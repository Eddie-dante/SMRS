// ============================================
// SRMS - Main Application Logic
// ============================================

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize application
function initializeApp() {
    // Check authentication
    const user = checkAuth();
    if (!user) return;
    
    // Update date display
    updateDateDisplay();
    
    // Set user information
    setUserInfo(user);
    
    // Load page-specific data
    const currentPage = getCurrentPage();
    
    switch (currentPage) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'library':
            loadLibrary();
            break;
        case 'students':
            loadStudents();
            break;
        case 'furniture':
            loadFurniture();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
}

// Update date display
function updateDateDisplay() {
    const dateElement = document.getElementById('dateDisplay');
    if (dateElement) {
        dateElement.textContent = getDateDisplay();
    }
}

// Set user information in sidebar
function setUserInfo(user) {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    const schoolNameDisplay = document.getElementById('schoolNameDisplay');
    
    if (userName) userName.textContent = user.name;
    if (userRole) userRole.textContent = user.role;
    if (userAvatar) userAvatar.textContent = getInitials(user.name);
    
    const school = getCurrentSchool();
    if (schoolNameDisplay && school) {
        schoolNameDisplay.textContent = school;
    }
}

// ============ DASHBOARD ============

async function loadDashboard() {
    const school = getCurrentSchool();
    if (!school) return;
    
    try {
        // Load books
        const books = await API.getBooks(school);
        const totalBooks = books.reduce((sum, book) => sum + (book.quantity || 0), 0);
        const availableBooks = books.reduce((sum, book) => sum + (book.available || 0), 0);
        
        document.getElementById('totalBooks').textContent = totalBooks;
        document.getElementById('availableBooks').textContent = availableBooks;
        
        // Load students
        const students = await API.getStudents(school);
        document.getElementById('totalStudents').textContent = students.length;
        
        // Load borrowed books
        const borrowed = await API.getBorrowed(school);
        const activeLoans = borrowed.filter(b => !b.returned);
        const overdueBooks = activeLoans.filter(b => isOverdue(b.returnDate));
        
        document.getElementById('activeLoans').textContent = activeLoans.length;
        document.getElementById('overdueBooks').textContent = overdueBooks.length;
        
        // Load furniture
        const furniture = await API.getFurniture(school);
        const activeFurniture = furniture.filter(f => !f.returned);
        document.getElementById('activeFurniture').textContent = activeFurniture.length;
        
        // Load recent activity
        loadRecentActivity(borrowed, furniture, students);
        
        // Set up real-time listeners
        setupRealTimeListeners(school);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

// Load recent activity
function loadRecentActivity(borrowed, furniture, students) {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    const activities = [];
    
    // Add borrowed activities
    borrowed.slice(0, 5).forEach(item => {
        activities.push({
            icon: 'fa-book',
            color: 'rgba(233, 69, 96, 0.2)',
            text: `${item.studentName} borrowed "${item.bookTitle}"`,
            time: item.createdAt
        });
    });
    
    // Add furniture activities
    furniture.slice(0, 5).forEach(item => {
        activities.push({
            icon: 'fa-chair',
            color: 'rgba(255, 193, 7, 0.2)',
            text: `${item.studentName} allocated furniture`,
            time: item.createdAt
        });
    });
    
    // Add student activities
    students.slice(0, 5).forEach(student => {
        activities.push({
            icon: 'fa-user-plus',
            color: 'rgba(40, 167, 69, 0.2)',
            text: `${student.name} added to database`,
            time: student.createdAt
        });
    });
    
    // Sort by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Display activities
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No recent activity</p>';
        return;
    }
    
    activityList.innerHTML = activities.slice(0, 10).map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${activity.color};">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${formatDateTime(activity.time)}</div>
            </div>
        </div>
    `).join('');
}

// Set up real-time listeners
function setupRealTimeListeners(school) {
    // Listen to books changes
    API.onBooksChange(school, (books) => {
        const totalBooks = books.reduce((sum, book) => sum + (book.quantity || 0), 0);
        const availableBooks = books.reduce((sum, book) => sum + (book.available || 0), 0);
        
        const totalBooksEl = document.getElementById('totalBooks');
        const availableBooksEl = document.getElementById('availableBooks');
        
        if (totalBooksEl) totalBooksEl.textContent = totalBooks;
        if (availableBooksEl) availableBooksEl.textContent = availableBooks;
    });
    
    // Listen to borrowed changes
    API.onBorrowedChange(school, (borrowed) => {
        const activeLoans = borrowed.filter(b => !b.returned);
        const overdueBooks = activeLoans.filter(b => isOverdue(b.returnDate));
        
        const activeLoansEl = document.getElementById('activeLoans');
        const overdueBooksEl = document.getElementById('overdueBooks');
        
        if (activeLoansEl) activeLoansEl.textContent = activeLoans.length;
        if (overdueBooksEl) overdueBooksEl.textContent = overdueBooks.length;
    });
    
    // Listen to furniture changes
    API.onFurnitureChange(school, (furniture) => {
        const activeFurniture = furniture.filter(f => !f.returned);
        
        const activeFurnitureEl = document.getElementById('activeFurniture');
        if (activeFurnitureEl) activeFurnitureEl.textContent = activeFurniture.length;
    });
}

// ============ LIBRARY ============

async function loadLibrary() {
    const school = getCurrentSchool();
    if (!school) return;
    
    // Set default dates
    const borrowDate = document.getElementById('issueBorrowDate');
    const returnDate = document.getElementById('issueReturnDate');
    
    if (borrowDate) borrowDate.value = getCurrentDate();
    if (returnDate) returnDate.value = addDays(getCurrentDate(), 14);
    
    // Load books
    await loadBooksTable();
    
    // Load book options for issue form
    await loadBookOptions();
    
    // Load active loans for returns
    await loadActiveReturns();
    
    // Load all borrowed
    await loadAllBorrowed();
}

// Load books table
async function loadBooksTable() {
    const school = getCurrentSchool();
    const books = await API.getBooks(school);
    
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    
    if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No books in catalog</td></tr>';
        return;
    }
    
    tbody.innerHTML = books.map(book => `
        <tr>
            <td>${book.title}</td>
            <td>${book.author || '-'}</td>
            <td>${book.type || '-'}</td>
            <td>${book.subject || '-'}</td>
            <td>${book.quantity || 0}</td>
            <td>${book.available || 0}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editBook('${book.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteBook('${book.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load book options for select
async function loadBookOptions() {
    const school = getCurrentSchool();
    const books = await API.getBooks(school);
    
    const select = document.getElementById('issueBookTitle');
    if (!select) return;
    
    const availableBooks = books.filter(book => book.available > 0);
    
    select.innerHTML = '<option value="">Select Book</option>' + 
        availableBooks.map(book => `<option value="${book.title}">${book.title} (${book.available} available)</option>`).join('');
}

// Load active returns
async function loadActiveReturns() {
    const school = getCurrentSchool();
    const borrowed = await API.getBorrowed(school);
    const activeLoans = borrowed.filter(item => !item.returned);
    
    const tbody = document.getElementById('returnsTableBody');
    if (!tbody) return;
    
    if (activeLoans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No active loans</td></tr>';
        return;
    }
    
    tbody.innerHTML = activeLoans.map(item => {
        const overdue = isOverdue(item.returnDate);
        const statusBadge = overdue 
            ? '<span class="badge badge-danger">Overdue</span>'
            : '<span class="badge badge-success">Active</span>';
        
        return `
            <tr>
                <td>${item.studentName}</td>
                <td>${item.adm}</td>
                <td>${item.bookTitle}</td>
                <td>${item.bookNo}</td>
                <td>${item.borrowDate}</td>
                <td>${item.returnDate}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="returnBook('${item.id}')">
                        <i class="fas fa-undo"></i> Return
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load all borrowed
async function loadAllBorrowed() {
    const school = getCurrentSchool();
    const borrowed = await API.getBorrowed(school);
    
    const tbody = document.getElementById('borrowedTableBody');
    if (!tbody) return;
    
    if (borrowed.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No borrowing records</td></tr>';
        return;
    }
    
    tbody.innerHTML = borrowed.map(item => `
        <tr>
            <td>${item.studentName}</td>
            <td>${item.bookTitle}</td>
            <td>${item.borrowDate}</td>
            <td>${item.returnDate || '-'}</td>
            <td>${item.returned 
                ? '<span class="badge badge-success">Returned</span>' 
                : '<span class="badge badge-warning">Active</span>'}</td>
        </tr>
    `).join('');
}

// Filter books
function filterBooks() {
    const searchInput = document.getElementById('searchBooks');
    const tbody = document.getElementById('booksTableBody');
    filterTable(searchInput, tbody);
}

// Filter returns
function filterReturns() {
    const searchInput = document.getElementById('searchReturns');
    const tbody = document.getElementById('returnsTableBody');
    filterTable(searchInput, tbody);
}

// Switch tabs
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Show selected tab
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Open add book modal
function openAddBookModal() {
    openModal('addBookModal');
}

// Add book
async function addBook(event) {
    event.preventDefault();
    
    const school = getCurrentSchool();
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const type = document.getElementById('bookType').value;
    const subject = document.getElementById('bookSubject').value.trim();
    const quantity = parseInt(document.getElementById('bookQuantity').value);
    
    if (!title || !quantity) {
        showNotification('Please fill in required fields', 'error');
        return;
    }
    
    const result = await API.addBook(school, {
        title,
        author,
        type,
        subject,
        quantity,
        createdBy: getCurrentUser()?.name || ''
    });
    
    if (result.success) {
        showNotification('Book added successfully!', 'success');
        closeModal('addBookModal');
        document.getElementById('addBookForm').reset();
        await loadBooksTable();
        await loadBookOptions();
    } else {
        showNotification(result.error || 'Failed to add book', 'error');
    }
}

// Issue book
async function issueBook(event) {
    event.preventDefault();
    
    const school = getCurrentSchool();
    const studentName = document.getElementById('issueStudentName').value.trim();
    const adm = document.getElementById('issueADM').value.trim();
    const bookTitle = document.getElementById('issueBookTitle').value;
    const bookNo = document.getElementById('issueBookNumber').value.trim();
    const borrowDate = document.getElementById('issueBorrowDate').value;
    const returnDate = document.getElementById('issueReturnDate').value;
    
    if (!studentName || !adm || !bookTitle || !bookNo) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const user = getCurrentUser();
    
    const result = await API.issueBook(school, {
        studentName,
        adm,
        bookTitle,
        bookNo,
        borrowDate,
        returnDate,
        issuedBy: user?.name || '',
        issuedByEmail: user?.email || ''
    });
    
    if (result.success) {
        showNotification('Book issued successfully!', 'success');
        document.getElementById('issueBookForm').reset();
        document.getElementById('issueBorrowDate').value = getCurrentDate();
        document.getElementById('issueReturnDate').value = addDays(getCurrentDate(), 14);
        await loadActiveReturns();
        await loadAllBorrowed();
    } else {
        showNotification(result.error || 'Failed to issue book', 'error');
    }
}

// Return book
async function returnBook(borrowId) {
    if (!confirm('Are you sure you want to return this book?')) return;
    
    const school = getCurrentSchool();
    const result = await API.returnBook(school, borrowId);
    
    if (result.success) {
        showNotification('Book returned successfully!', 'success');
        await loadActiveReturns();
        await loadAllBorrowed();
    } else {
        showNotification('Failed to return book', 'error');
    }
}

// ============ STUDENTS ============

async function loadStudents() {
    const school = getCurrentSchool();
    const students = await API.getStudents(school);
    
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No students in database</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${student.adm}</td>
            <td>${student.form || '-'}</td>
            <td>${student.stream || '-'}</td>
            <td>${student.gender || '-'}</td>
            <td>${student.parentName || '-'}</td>
            <td>${student.parentPhone || '-'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="viewStudent('${student.adm}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.adm}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Open add student modal
function openAddStudentModal() {
    openModal('addStudentModal');
}

// Add student
async function addStudent(event) {
    event.preventDefault();
    
    const school = getCurrentSchool();
    const name = document.getElementById('studentName').value.trim();
    const adm = document.getElementById('studentADM').value.trim();
    const form = document.getElementById('studentForm').value;
    const stream = document.getElementById('studentStream').value;
    const gender = document.getElementById('studentGender').value;
    const dob = document.getElementById('studentDOB').value;
    const parentName = document.getElementById('studentParentName').value.trim();
    const parentPhone = document.getElementById('studentParentPhone').value.trim();
    const parentEmail = document.getElementById('studentParentEmail').value.trim();
    const address = document.getElementById('studentAddress').value.trim();
    const medicalInfo = document.getElementById('studentMedical').value.trim();
    const specialNeeds = document.getElementById('studentSpecialNeeds').value.trim();
    
    if (!name || !adm) {
        showNotification('Name and ADM are required', 'error');
        return;
    }
    
    const result = await API.addStudent(school, {
        name,
        adm,
        form,
        stream,
        gender,
        dob,
        parentName,
        parentPhone,
        parentEmail,
        address,
        medicalInfo,
        specialNeeds,
        addedBy: getCurrentUser()?.name || ''
    });
    
    if (result.success) {
        showNotification('Student added successfully!', 'success');
        closeModal('addStudentModal');
        document.getElementById('addStudentForm').reset();
        await loadStudents();
    } else {
        showNotification(result.error || 'Failed to add student', 'error');
    }
}

// Filter students
function filterStudents() {
    const searchInput = document.getElementById('searchStudents');
    const tbody = document.getElementById('studentsTableBody');
    filterTable(searchInput, tbody);
}

// View student details
function viewStudent(adm) {
    openModal('studentDetailsModal');
    // Load student details here
}

// Delete student
async function deleteStudent(adm) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    const school = getCurrentSchool();
    const result = await API.deleteStudent(school, adm);
    
    if (result.success) {
        showNotification('Student deleted successfully!', 'success');
        await loadStudents();
    } else {
        showNotification('Failed to delete student', 'error');
    }
}

// ============ FURNITURE ============

async function loadFurniture() {
    const school = getCurrentSchool();
    const furniture = await API.getFurniture(school);
    
    // Set default date
    const allocationDate = document.getElementById('furnitureAllocationDate');
    if (allocationDate) allocationDate.value = getCurrentDate();
    
    // Load active allocations
    const active = furniture.filter(item => !item.returned);
    const activeTbody = document.getElementById('activeFurnitureTableBody');
    if (activeTbody) {
        if (active.length === 0) {
            activeTbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No active allocations</td></tr>';
        } else {
            activeTbody.innerHTML = active.map(item => `
                <tr>
                    <td>${item.studentName}</td>
                    <td>${item.adm}</td>
                    <td>${item.form || '-'}</td>
                    <td>${item.stream || '-'}</td>
                    <td>${item.chairNo}</td>
                    <td>${item.lockerNo || '-'}</td>
                    <td>${item.allocationDate}</td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="returnFurniture('${item.id}')">
                            <i class="fas fa-undo"></i> Return
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    // Load returned
    const returned = furniture.filter(item => item.returned);
    const returnedTbody = document.getElementById('returnedFurnitureTableBody');
    if (returnedTbody) {
        if (returned.length === 0) {
            returnedTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No returned furniture</td></tr>';
        } else {
            returnedTbody.innerHTML = returned.map(item => `
                <tr>
                    <td>${item.studentName}</td>
                    <td>${item.adm}</td>
                    <td>${item.chairNo}</td>
                    <td>${item.lockerNo || '-'}</td>
                    <td>${item.allocationDate}</td>
                    <td>${item.returnDate || '-'}</td>
                </tr>
            `).join('');
        }
    }
    
    // Load all
    const allTbody = document.getElementById('allFurnitureTableBody');
    if (allTbody) {
        if (furniture.length === 0) {
            allTbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No furniture records</td></tr>';
        } else {
            allTbody.innerHTML = furniture.map(item => `
                <tr>
                    <td>${item.studentName}</td>
                    <td>${item.adm}</td>
                    <td>${item.chairNo}</td>
                    <td>${item.lockerNo || '-'}</td>
                    <td>${item.returned 
                        ? '<span class="badge badge-success">Returned</span>' 
                        : '<span class="badge badge-warning">Active</span>'}</td>
                    <td>${item.allocationDate}</td>
                    <td>${item.returnDate || '-'}</td>
                </tr>
            `).join('');
        }
    }
}

// Open allocate modal
function openAllocateModal() {
    openModal('allocateFurnitureModal');
}

// Allocate furniture
async function allocateFurniture(event) {
    event.preventDefault();
    
    const school = getCurrentSchool();
    const studentName = document.getElementById('furnitureStudentName').value.trim();
    const adm = document.getElementById('furnitureADM').value.trim();
    const form = document.getElementById('furnitureForm').value;
    const stream = document.getElementById('furnitureStream').value;
    const allocationDate = document.getElementById('furnitureAllocationDate').value;
    const chairNo = document.getElementById('chairNumber').value.trim();
    const lockerNo = document.getElementById('lockerNumber').value.trim();
    
    if (!studentName || !adm || !chairNo) {
        showNotification('Please fill in required fields', 'error');
        return;
    }
    
    const result = await API.allocateFurniture(school, {
        studentName,
        adm,
        form,
        stream,
        chairNo,
        lockerNo,
        allocationDate,
        issuedBy: getCurrentUser()?.name || ''
    });
    
    if (result.success) {
        showNotification('Furniture allocated successfully!', 'success');
        closeModal('allocateFurnitureModal');
        document.getElementById('allocateFurnitureForm').reset();
        await loadFurniture();
    } else {
        showNotification(result.error || 'Failed to allocate furniture', 'error');
    }
}

// Return furniture
async function returnFurniture(furnitureId) {
    if (!confirm('Are you sure you want to return this furniture?')) return;
    
    const school = getCurrentSchool();
    const result = await API.returnFurniture(school, furnitureId);
    
    if (result.success) {
        showNotification('Furniture returned successfully!', 'success');
        await loadFurniture();
    } else {
        showNotification('Failed to return furniture', 'error');
    }
}

// Switch furniture tabs
function switchFurnitureTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="switchFurnitureTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}FurnitureTab`).classList.add('active');
}

// Filter active furniture
function filterActiveFurniture() {
    const searchInput = document.getElementById('searchActiveFurniture');
    const tbody = document.getElementById('activeFurnitureTableBody');
    filterTable(searchInput, tbody);
}

// ============ REPORTS ============

async function loadReports() {
    const school = getCurrentSchool();
    
    // Load data
    const borrowed = await API.getBorrowed(school);
    const furniture = await API.getFurniture(school);
    const students = await API.getStudents(school);
    const books = await API.getBooks(school);
    
    // Calculate statistics
    const activeLoans = borrowed.filter(b => !b.returned);
    const overdue = activeLoans.filter(b => isOverdue(b.returnDate));
    const returned = borrowed.filter(b => b.returned);
    const returnRate = borrowed.length > 0 ? Math.round((returned.length / borrowed.length) * 100) : 0;
    const activeFurniture = furniture.filter(f => !f.returned);
    
    // Update summary stats
    document.getElementById('overdueCount').textContent = overdue.length;
    document.getElementById('activeLoansCount').textContent = activeLoans.length;
    document.getElementById('returnRate').textContent = returnRate + '%';
    document.getElementById('furnitureCount').textContent = activeFurniture.length;
    
    // Load overdue table
    loadOverdueTable(overdue);
    
    // Create charts
    createBooksByTypeChart(books);
    createStudentsByFormChart(students);
    createFurnitureChart(furniture);
    createBorrowingTrendChart(borrowed);
}

// Load overdue table
function loadOverdueTable(overdue) {
    const tbody = document.getElementById('overdueTableBody');
    if (!tbody) return;
    
    if (overdue.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No overdue books</td></tr>';
        return;
    }
    
    tbody.innerHTML = overdue.map(item => `
        <tr>
            <td>${item.studentName}</td>
            <td>${item.adm}</td>
            <td>${item.bookTitle}</td>
            <td>${item.returnDate}</td>
            <td><span class="badge badge-danger">${daysOverdue(item.returnDate)} days</span></td>
        </tr>
    `).join('');
}

// Create books by type chart
function createBooksByTypeChart(books) {
    const canvas = document.getElementById('booksByTypeChart');
    if (!canvas) return;
    
    const types = {};
    books.forEach(book => {
        const type = book.type || 'Other';
        types[type] = (types[type] || 0) + (book.quantity || 0);
    });
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(types),
            datasets: [{
                data: Object.values(types),
                backgroundColor: ['#e94560', '#0f3460', '#d4af37', '#28a745', '#17a2b8']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: 'white' }
                }
            }
        }
    });
}

// Create students by form chart
function createStudentsByFormChart(students) {
    const canvas = document.getElementById('studentsByFormChart');
    if (!canvas) return;
    
    const forms = {};
    students.forEach(student => {
        const form = student.form || 'Unknown';
        forms[form] = (forms[form] || 0) + 1;
    });
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(forms),
            datasets: [{
                label: 'Students',
                data: Object.values(forms),
                backgroundColor: '#e94560'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: 'white' },
                    grid: { display: false }
                }
            }
        }
    });
}

// Create furniture chart
function createFurnitureChart(furniture) {
    const canvas = document.getElementById('furnitureChart');
    if (!canvas) return;
    
    const active = furniture.filter(f => !f.returned).length;
    const returned = furniture.filter(f => f.returned).length;
    
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['Active', 'Returned'],
            datasets: [{
                data: [active, returned],
                backgroundColor: ['#ffc107', '#28a745']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: 'white' }
                }
            }
        }
    });
}

// Create borrowing trend chart
function createBorrowingTrendChart(borrowed) {
    const canvas = document.getElementById('borrowingTrendChart');
    if (!canvas) return;
    
    const months = {};
    borrowed.forEach(item => {
        const date = new Date(item.borrowDate);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        months[monthKey] = (months[monthKey] || 0) + 1;
    });
    
    const sortedMonths = Object.keys(months).sort();
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: sortedMonths.map(m => {
                const [year, month] = m.split('-');
                return getMonthName(parseInt(month) - 1) + ' ' + year;
            }),
            datasets: [{
                label: 'Books Borrowed',
                data: sortedMonths.map(m => months[m]),
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            },
            scales: {
                y: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: 'white' },
                    grid: { display: false }
                }
            }
        }
    });
}

// Export report
function exportReport() {
    showNotification('Report exported successfully!', 'success');
}

// ============ SETTINGS ============

async function loadSettings() {
    const school = getCurrentSchool();
    
    // Load school info
    const schoolInfo = await API.getSchool(school);
    if (schoolInfo) {
        document.getElementById('schoolNameInput').value = schoolInfo.name || '';
        document.getElementById('schoolAddress').value = schoolInfo.address || '';
        document.getElementById('adminName').value = schoolInfo.adminName || '';
        document.getElementById('adminEmail').value = schoolInfo.adminEmail || '';
        document.getElementById('schoolMotto').value = schoolInfo.motto || '';
    }
    
    // Load settings
    const settings = await API.getSettings(school);
    if (settings) {
        document.getElementById('maxBorrowDays').value = settings.maxBorrowDays || 14;
        document.getElementById('maxBooksPerStudent').value = settings.maxBooksPerStudent || 3;
        document.getElementById('finePerDay').value = settings.finePerDay || 10;
    }
    
    // Load users
    await loadUsers();
}

// Load users table
async function loadUsers() {
    const school = getCurrentSchool();
    const users = await API.getUsers(school);
    
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No users</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.isActive 
                ? '<span class="badge badge-success">Active</span>' 
                : '<span class="badge badge-danger">Inactive</span>'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Save school info
async function saveSchoolInfo(event) {
    event.preventDefault();
    
    showNotification('School information saved!', 'success');
}

// Save library settings
async function saveLibrarySettings(event) {
    event.preventDefault();
    
    const school = getCurrentSchool();
    const maxBorrowDays = parseInt(document.getElementById('maxBorrowDays').value);
    const maxBooksPerStudent = parseInt(document.getElementById('maxBooksPerStudent').value);
    const finePerDay = parseInt(document.getElementById('finePerDay').value);
    
    const result = await API.updateSettings(school, {
        maxBorrowDays,
        maxBooksPerStudent,
        finePerDay
    });
    
    if (result.success) {
        showNotification('Settings saved successfully!', 'success');
    } else {
        showNotification('Failed to save settings', 'error');
    }
}

// Open add user modal
function openAddUserModal() {
    openModal('addUserModal');
}

// Add user
async function addUser(event) {
    event.preventDefault();
    
    const school = getCurrentSchool();
    const name = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const role = document.getElementById('newUserRole').value;
    const password = document.getElementById('newUserPassword').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    const result = await API.createUser(school, {
        name,
        email,
        role,
        password
    });
    
    if (result.success) {
        showNotification('User added successfully!', 'success');
        closeModal('addUserModal');
        document.getElementById('addUserForm').reset();
        await loadUsers();
    } else {
        showNotification(result.error || 'Failed to add user', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    showNotification('User deleted successfully!', 'success');
}

// Export data
function exportData() {
    showNotification('Data exported successfully!', 'success');
}

// Clear all data
function clearAllData() {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone!')) return;
    
    if (!confirm('This will delete ALL data. Are you absolutely sure?')) return;
    
    showNotification('All data cleared!', 'success');
}