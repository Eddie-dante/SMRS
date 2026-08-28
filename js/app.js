// ============================================
// SRMS - Complete Application Logic
// All Features and Functionality
// ============================================

// ============ GLOBAL VARIABLES ============
let selectedChatUser = null;
let currentChatUserEmail = null;

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set user info in taskbar
    setTaskbarUserInfo(user);
    
    // Load page-specific data
    const page = window.location.pathname.split('/').pop();
    loadPageData(page);
});

function setTaskbarUserInfo(user) {
    if (!user) return;
    
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const schoolNameDisplay = document.getElementById('schoolNameDisplay');
    
    if (userAvatar) userAvatar.textContent = getInitials(user.name);
    if (userName) userName.textContent = user.name;
    if (userRole) userRole.textContent = user.role;
    
    const school = getCurrentSchool();
    if (schoolNameDisplay && school) {
        schoolNameDisplay.textContent = school;
    }
}

function loadPageData(page) {
    switch(page) {
        case 'dashboard.html':
            loadDashboardData();
            setupDashboardRealTime();
            break;
        case 'library.html':
            loadBooks();
            loadActiveReturns();
            loadAllBorrowed();
            loadBookOptions();
            break;
        case 'students.html':
            loadStudents();
            break;
        case 'furniture.html':
            loadFurniture();
            break;
        case 'chat.html':
            loadChatUsers();
            break;
        case 'forum.html':
            loadForumMessages();
            break;
        case 'notepad.html':
            loadNotes();
            break;
        case 'events.html':
            loadEvents();
            break;
        case 'fees.html':
            loadFees();
            break;
        case 'timetable.html':
            loadTimetable();
            loadTimetableClasses();
            break;
        case 'teachers.html':
            loadTeachers();
            break;
        case 'classes.html':
            loadClasses();
            break;
        case 'terms.html':
            loadTerms();
            break;
        case 'qrcodes.html':
            // QR codes don't need initial load
            break;
        case 'auditlog.html':
            loadAuditLog();
            break;
        case 'reports.html':
            loadReports();
            break;
        case 'settings.html':
            loadSettings();
            loadUsersForSettings();
            break;
        case 'database.html':
            loadDatabaseTables();
            break;
        case 'wallpaper.html':
            loadWallpapers();
            break;
    }
}

// ============ DASHBOARD FUNCTIONS ============
async function loadDashboardData() {
    const school = getCurrentSchool();
    if (!school) return;
    
    showLoading('Loading dashboard...');
    
    try {
        const [books, students, borrowed, furniture, events, classes] = await Promise.all([
            API.getBooks(school),
            API.getStudents(school),
            API.getBorrowed(school),
            API.getFurniture(school),
            API.getEvents(school),
            API.getClasses(school)
        ]);
        
        // Update welcome banner
        const user = getCurrentUser();
        document.getElementById('welcomeUserName').textContent = user.name;
        document.getElementById('welcomeUserRole').textContent = user.role;
        document.getElementById('welcomeSchoolName').textContent = school;
        
        // Update date
        document.getElementById('dateDisplay').textContent = getDateDisplay();
        
        // Load invite code for admin
        if (user.role === 'admin') {
            const schoolInfo = await API.getSchool(school);
            if (schoolInfo && schoolInfo.inviteCode) {
                document.getElementById('inviteCode').textContent = schoolInfo.inviteCode;
                document.getElementById('inviteCodeBanner').style.display = 'block';
            }
        }
        
        // Update stats
        const totalBooks = books.reduce((sum, b) => sum + (b.quantity || 0), 0);
        const availableBooks = books.reduce((sum, b) => sum + (b.available || 0), 0);
        const activeLoans = borrowed.filter(b => !b.returned);
        const overdueBooks = activeLoans.filter(b => isOverdue(b.returnDate));
        const activeFurniture = furniture.filter(f => !f.returned);
        
        animateNumber('totalBooks', totalBooks);
        animateNumber('availableBooks', availableBooks);
        animateNumber('totalStudents', students.length);
        animateNumber('activeFurniture', activeFurniture.length);
        animateNumber('overdueBooks', overdueBooks.length);
        animateNumber('activeLoans', activeLoans.length);
        
        // Load recent activity
        loadRecentActivity(borrowed, furniture, students, events);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Error loading dashboard', 'error');
    } finally {
        hideLoading();
    }
}

function setupDashboardRealTime() {
    const school = getCurrentSchool();
    if (!school) return;
    
    API.onBooksChange(school, (books) => {
        const totalBooks = books.reduce((sum, b) => sum + (b.quantity || 0), 0);
        const availableBooks = books.reduce((sum, b) => sum + (b.available || 0), 0);
        document.getElementById('totalBooks').textContent = totalBooks;
        document.getElementById('availableBooks').textContent = availableBooks;
    });
    
    API.onBorrowedChange(school, (borrowed) => {
        const activeLoans = borrowed.filter(b => !b.returned);
        const overdueBooks = activeLoans.filter(b => isOverdue(b.returnDate));
        document.getElementById('activeLoans').textContent = activeLoans.length;
        document.getElementById('overdueBooks').textContent = overdueBooks.length;
    });
    
    API.onStudentsChange(school, (students) => {
        document.getElementById('totalStudents').textContent = students.length;
    });
    
    API.onFurnitureChange(school, (furniture) => {
        const activeFurniture = furniture.filter(f => !f.returned);
        document.getElementById('activeFurniture').textContent = activeFurniture.length;
    });
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * eased);
        element.textContent = currentValue;
        if (progress < 1) requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}

function loadRecentActivity(borrowed, furniture, students, events) {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    const activities = [];
    
    borrowed.forEach(item => {
        activities.push({
            icon: 'fa-book',
            color: 'rgba(233, 69, 96, 0.2)',
            text: `<strong>${item.studentName}</strong> borrowed "${item.bookTitle}"`,
            time: item.createdAt || item.borrowDate
        });
    });
    
    furniture.forEach(item => {
        activities.push({
            icon: 'fa-chair',
            color: 'rgba(255, 193, 7, 0.2)',
            text: `<strong>${item.studentName}</strong> allocated furniture (${item.chairNo})`,
            time: item.createdAt || item.allocationDate
        });
    });
    
    students.forEach(student => {
        activities.push({
            icon: 'fa-user-plus',
            color: 'rgba(40, 167, 69, 0.2)',
            text: `<strong>${student.name}</strong> added to database`,
            time: student.createdAt
        });
    });
    
    events.forEach(event => {
        activities.push({
            icon: 'fa-calendar',
            color: 'rgba(23, 162, 184, 0.2)',
            text: `<strong>${event.title}</strong> event scheduled`,
            time: event.createdAt
        });
    });
    
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:20px;">No recent activity</p>';
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

// ============ LIBRARY FUNCTIONS ============
async function loadBooks() {
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
                <button class="btn btn-sm btn-secondary" onclick="editBook('${book.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteBook('${book.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadBookOptions() {
    const school = getCurrentSchool();
    const books = await API.getBooks(school);
    const select = document.getElementById('issueBookTitle');
    
    if (!select) return;
    
    const availableBooks = books.filter(book => book.available > 0);
    select.innerHTML = '<option value="">Select Book</option>' + 
        availableBooks.map(book => `<option value="${book.title}">${book.title} (${book.available} available)</option>`).join('');
}

async function loadActiveReturns() {
    const school = getCurrentSchool();
    const borrowed = await API.getBorrowed(school);
    const activeLoans = borrowed.filter(item => !item.returned);
    const tbody = document.getElementById('returnsTableBody');
    
    if (!tbody) return;
    
    if (activeLoans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No active loans</td></tr>';
        return;
    }
    
    tbody.innerHTML = activeLoans.map(item => {
        const overdue = isOverdue(item.returnDate);
        const badge = overdue ? '<span class="badge badge-danger">Overdue</span>' : '<span class="badge badge-success">Active</span>';
        
        return `
            <tr>
                <td>${item.studentName}</td>
                <td>${item.adm}</td>
                <td>${item.bookTitle}</td>
                <td>${item.bookNo}</td>
                <td>${item.returnDate}</td>
                <td>${badge}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="returnBook('${item.id}')">
                        <i class="fas fa-undo"></i> Return
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

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
            <td>${item.returned ? '<span class="badge badge-success">Returned</span>' : '<span class="badge badge-warning">Active</span>'}</td>
        </tr>
    `).join('');
}

async function addBook(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    const user = getCurrentUser();
    
    const result = await API.addBook(school, {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        type: document.getElementById('bookType').value,
        subject: document.getElementById('bookSubject').value,
        quantity: parseInt(document.getElementById('bookQuantity').value),
        createdBy: user.name
    });
    
    if (result.success) {
        showNotification('Book added successfully!', 'success');
        closeModal('addBookModal');
        document.getElementById('addBookForm').reset();
        loadBooks();
        loadBookOptions();
    } else {
        showNotification(result.error || 'Failed to add book', 'error');
    }
}

async function issueBook(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    const user = getCurrentUser();
    
    const result = await API.issueBook(school, {
        studentName: document.getElementById('issueStudentName').value,
        adm: document.getElementById('issueADM').value,
        bookTitle: document.getElementById('issueBookTitle').value,
        bookNo: document.getElementById('issueBookNumber').value,
        borrowDate: document.getElementById('issueBorrowDate').value,
        returnDate: document.getElementById('issueReturnDate').value,
        issuedBy: user.name,
        issuedByEmail: user.email
    });
    
    if (result.success) {
        showNotification('Book issued successfully!', 'success');
        document.getElementById('issueBookForm').reset();
        loadBooks();
        loadActiveReturns();
        loadAllBorrowed();
        loadBookOptions();
    } else {
        showNotification('Failed to issue book', 'error');
    }
}

async function returnBook(borrowId) {
    if (!confirm('Return this book?')) return;
    const school = getCurrentSchool();
    const result = await API.returnBook(school, borrowId);
    
    if (result.success) {
        showNotification('Book returned!', 'success');
        loadBooks();
        loadActiveReturns();
        loadAllBorrowed();
    }
}

async function deleteBook(bookId) {
    if (!confirm('Delete this book?')) return;
    const school = getCurrentSchool();
    const result = await API.deleteBook(school, bookId);
    
    if (result.success) {
        showNotification('Book deleted!', 'success');
        loadBooks();
    }
}

function filterBooks() {
    const searchInput = document.getElementById('searchBooks');
    const tbody = document.getElementById('booksTableBody');
    filterTable(searchInput, tbody);
}

// ============ STUDENTS FUNCTIONS ============
async function loadStudents() {
    const school = getCurrentSchool();
    const students = await API.getStudents(school);
    const tbody = document.getElementById('studentsTableBody');
    
    if (!tbody) return;
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students in database</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${student.adm}</td>
            <td>${student.form || '-'}</td>
            <td>${student.stream || '-'}</td>
            <td>${student.gender || '-'}</td>
            <td>${student.parentPhone || '-'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="viewStudent('${student.adm}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.adm}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function addStudent(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    const user = getCurrentUser();
    
    const result = await API.addStudent(school, {
        name: document.getElementById('studentName').value,
        adm: document.getElementById('studentADM').value,
        form: document.getElementById('studentForm').value,
        stream: document.getElementById('studentStream').value,
        gender: document.getElementById('studentGender').value,
        dob: document.getElementById('studentDOB').value,
        parentName: document.getElementById('studentParentName').value,
        parentPhone: document.getElementById('studentParentPhone').value,
        parentEmail: document.getElementById('studentParentEmail').value,
        address: document.getElementById('studentAddress').value,
        medicalInfo: document.getElementById('studentMedical').value,
        specialNeeds: document.getElementById('studentSpecialNeeds').value,
        addedBy: user.name
    });
    
    if (result.success) {
        showNotification('Student added!', 'success');
        closeModal('addStudentModal');
        document.getElementById('addStudentForm').reset();
        loadStudents();
    } else {
        showNotification(result.error || 'Failed to add student', 'error');
    }
}

function viewStudent(adm) {
    showNotification('Student details loading...', 'info');
    // Implement student details view
}

async function deleteStudent(adm) {
    if (!confirm('Delete this student?')) return;
    const school = getCurrentSchool();
    const result = await API.deleteStudent(school, adm);
    if (result.success) {
        showNotification('Student deleted!', 'success');
        loadStudents();
    }
}

function filterStudents() {
    const searchInput = document.getElementById('searchStudents');
    const tbody = document.getElementById('studentsTableBody');
    filterTable(searchInput, tbody);
}

// ============ FURNITURE FUNCTIONS ============
async function loadFurniture() {
    const school = getCurrentSchool();
    const furniture = await API.getFurniture(school);
    
    const active = furniture.filter(f => !f.returned);
    const returned = furniture.filter(f => f.returned);
    
    const activeTbody = document.getElementById('activeFurnitureTableBody');
    const returnedTbody = document.getElementById('returnedFurnitureTableBody');
    const allTbody = document.getElementById('allFurnitureTableBody');
    
    if (activeTbody) {
        activeTbody.innerHTML = active.length === 0 
            ? '<tr><td colspan="6">No active allocations</td></tr>'
            : active.map(f => `
                <tr>
                    <td>${f.studentName}</td>
                    <td>${f.adm}</td>
                    <td>${f.chairNo}</td>
                    <td>${f.lockerNo || '-'}</td>
                    <td>${f.allocationDate}</td>
                    <td><button class="btn btn-sm btn-success" onclick="returnFurnitureItem('${f.id}')">Return</button></td>
                </tr>
            `).join('');
    }
    
    if (returnedTbody) {
        returnedTbody.innerHTML = returned.length === 0
            ? '<tr><td colspan="5">No returned furniture</td></tr>'
            : returned.map(f => `
                <tr>
                    <td>${f.studentName}</td>
                    <td>${f.chairNo}</td>
                    <td>${f.lockerNo || '-'}</td>
                    <td>${f.allocationDate}</td>
                    <td>${f.returnDate || '-'}</td>
                </tr>
            `).join('');
    }
    
    if (allTbody) {
        allTbody.innerHTML = furniture.length === 0
            ? '<tr><td colspan="7">No furniture records</td></tr>'
            : furniture.map(f => `
                <tr>
                    <td>${f.studentName}</td>
                    <td>${f.adm}</td>
                    <td>${f.chairNo}</td>
                    <td>${f.lockerNo || '-'}</td>
                    <td>${f.returned ? 'Returned' : 'Active'}</td>
                    <td>${f.allocationDate}</td>
                    <td>${f.returnDate || '-'}</td>
                </tr>
            `).join('');
    }
}

async function allocateFurniture(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    const user = getCurrentUser();
    
    const result = await API.allocateFurniture(school, {
        studentName: document.getElementById('furnitureStudentName').value,
        adm: document.getElementById('furnitureADM').value,
        form: document.getElementById('furnitureForm').value,
        stream: document.getElementById('furnitureStream').value,
        chairNo: document.getElementById('chairNumber').value,
        lockerNo: document.getElementById('lockerNumber').value,
        allocationDate: document.getElementById('furnitureAllocationDate').value,
        issuedBy: user.name,
        issuedByEmail: user.email
    });
    
    if (result.success) {
        showNotification('Furniture allocated!', 'success');
        closeModal('allocateFurnitureModal');
        loadFurniture();
    }
}

async function returnFurnitureItem(furnitureId) {
    if (!confirm('Return this furniture?')) return;
    const school = getCurrentSchool();
    const result = await API.returnFurniture(school, furnitureId);
    if (result.success) {
        showNotification('Furniture returned!', 'success');
        loadFurniture();
    }
}

// ============ CHAT FUNCTIONS ============
async function loadChatUsers() {
    const school = getCurrentSchool();
    const users = await API.getUsers(school);
    const currentUser = getCurrentUser();
    
    const userList = document.getElementById('chatUserList');
    if (!userList) return;
    
    const otherUsers = users.filter(u => u.email !== currentUser.email);
    
    userList.innerHTML = otherUsers.map(u => `
        <button class="chat-user-btn" onclick="selectChatUser('${u.email}', '${u.name}')">
            <div class="avatar" style="background: linear-gradient(135deg, #d4af37, #f0d060); color: #0a0e27; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                ${getInitials(u.name)}
            </div>
            <div style="flex:1; text-align: left;">
                <div style="font-weight: 600;">${u.name}</div>
                <small style="color: rgba(255,255,255,0.5);">${u.role}</small>
            </div>
        </button>
    `).join('');
}

async function selectChatUser(email, name) {
    currentChatUserEmail = email;
    document.getElementById('chatWithName').textContent = name;
    await loadChatMessages();
}

async function loadChatMessages() {
    if (!currentChatUserEmail) return;
    
    const school = getCurrentSchool();
    const user = getCurrentUser();
    const messages = await API.getChatMessages(school, user.email, currentChatUserEmail);
    
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = messages.map(msg => {
        const isMine = msg.fromEmail === user.email;
        return `
            <div style="display:flex; justify-content:${isMine ? 'flex-end' : 'flex-start'}; margin: 8px 0;">
                <div style="background:${isMine ? 'rgba(233,69,96,0.4)' : 'rgba(255,255,255,0.15)'}; padding: 10px 16px; border-radius: 16px; max-width: 70%;">
                    <strong>${msg.fromName}:</strong> ${msg.message}
                    <br><small>${formatTime(msg.timestamp)}</small>
                </div>
            </div>
        `;
    }).join('');
}

async function sendMessage(event) {
    event.preventDefault();
    if (!currentChatUserEmail) {
        showNotification('Select a user to chat with', 'warning');
        return;
    }
    
    const school = getCurrentSchool();
    const user = getCurrentUser();
    const messageInput = document.getElementById('messageInput');
    
    await API.sendChatMessage(school, {
        fromEmail: user.email,
        fromName: user.name,
        toEmail: currentChatUserEmail,
        message: messageInput.value
    });
    
    messageInput.value = '';
    loadChatMessages();
}

// ============ FORUM FUNCTIONS ============
async function loadForumMessages() {
    const school = getCurrentSchool();
    const messages = await API.getForumMessages(school);
    const container = document.getElementById('forumMessages');
    
    if (!container) return;
    
    container.innerHTML = messages.map(msg => `
        <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin:10px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong>${msg.fromName}</strong>
                <small>${formatDateTime(msg.timestamp)}</small>
            </div>
            <p style="margin:0;">${msg.message}</p>
        </div>
    `).join('');
}

async function postForumMessage(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    const user = getCurrentUser();
    const messageInput = document.getElementById('forumMessageInput');
    
    await API.postForumMessage(school, {
        fromEmail: user.email,
        fromName: user.name,
        role: user.role,
        message: messageInput.value
    });
    
    messageInput.value = '';
    loadForumMessages();
    showNotification('Posted to forum!', 'success');
}

// ============ NOTEPAD FUNCTIONS ============
async function loadNotes() {
    const school = getCurrentSchool();
    const user = getCurrentUser();
    const notes = await API.getNotes(school, user.email);
    const container = document.getElementById('notesList');
    
    if (!container) return;
    
    const myNotes = notes.filter(n => n.authorEmail === user.email);
    
    container.innerHTML = myNotes.length === 0
        ? '<p style="text-align:center;color:rgba(255,255,255,0.5);">No notes yet</p>'
        : myNotes.map(note => `
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin:10px 0;">
                <h4 style="margin:0 0 5px;">${note.title || 'Untitled'}</h4>
                <p style="margin:0 0 8px;">${note.content}</p>
                <small>${formatDateTime(note.timestamp)}</small>
            </div>
        `).join('');
}

async function saveNote(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    const user = getCurrentUser();
    
    await API.saveNote(school, {
        author: user.name,
        authorEmail: user.email,
        title: document.getElementById('noteTitle').value,
        content: document.getElementById('noteContent').value
    });
    
    showNotification('Note saved!', 'success');
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    loadNotes();
}

// ============ EVENTS FUNCTIONS ============
async function loadEvents() {
    const school = getCurrentSchool();
    const events = await API.getEvents(school);
    const container = document.getElementById('eventsList');
    
    if (!container) return;
    
    container.innerHTML = events.length === 0
        ? '<p style="text-align:center;color:rgba(255,255,255,0.5);">No events</p>'
        : events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)).map(event => `
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin:10px 0; border-left:4px solid #e94560;">
                <div style="display:flex; justify-content:space-between;">
                    <strong>${event.title}</strong>
                    <span class="badge badge-info">${event.eventType}</span>
                </div>
                <p style="margin:5px 0;">${event.description || ''}</p>
                <small>📅 ${formatDate(event.eventDate)}</small>
            </div>
        `).join('');
}

async function addEvent(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    const user = getCurrentUser();
    
    await API.addEvent(school, {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        eventDate: document.getElementById('eventDate').value,
        eventType: document.getElementById('eventType').value,
        createdBy: user.name
    });
    
    showNotification('Event added!', 'success');
    loadEvents();
}

// ============ FEES FUNCTIONS ============
async function loadFees() {
    const school = getCurrentSchool();
    const [fees, students] = await Promise.all([
        API.getFees(school),
        API.getStudents(school)
    ]);
    
    // Populate student select
    const studentSelect = document.getElementById('feeStudent');
    if (studentSelect) {
        studentSelect.innerHTML = '<option value="">Select Student</option>' +
            students.map(s => `<option value="${s.adm}">${s.name} (${s.adm})</option>`).join('');
    }
    
    // Load fees table
    const tbody = document.getElementById('feesTableBody');
    if (tbody) {
        tbody.innerHTML = fees.length === 0
            ? '<tr><td colspan="7">No fee records</td></tr>'
            : fees.map(fee => `
                <tr>
                    <td>${fee.studentName}</td>
                    <td>${fee.studentAdm}</td>
                    <td>KES ${formatNumber(fee.amount)}</td>
                    <td>KES ${formatNumber(fee.paid)}</td>
                    <td>KES ${formatNumber(fee.balance)}</td>
                    <td>${fee.term}</td>
                    <td><span class="badge ${fee.balance <= 0 ? 'badge-success' : 'badge-warning'}">${fee.status}</span></td>
                </tr>
            `).join('');
    }
    
    // Update totals
    const totalFees = fees.reduce((s, f) => s + f.amount, 0);
    const totalPaid = fees.reduce((s, f) => s + f.paid, 0);
    const totalBalance = fees.reduce((s, f) => s + f.balance, 0);
    
    document.getElementById('totalFeesAmount').textContent = formatCurrency(totalFees);
    document.getElementById('totalPaidAmount').textContent = formatCurrency(totalPaid);
    document.getElementById('totalBalanceAmount').textContent = formatCurrency(totalBalance);
}

async function saveFee(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    const studentAdm = document.getElementById('feeStudent').value;
    
    if (!studentAdm) {
        showNotification('Select a student', 'warning');
        return;
    }
    
    const students = await API.getStudents(school);
    const student = students.find(s => s.adm === studentAdm);
    
    await API.saveFee(school, {
        studentAdm: studentAdm,
        studentName: student?.name || '',
        amount: parseFloat(document.getElementById('feeAmount').value) || 0,
        paid: parseFloat(document.getElementById('feePaid').value) || 0,
        term: document.getElementById('feeTerm').value || 'Term 1'
    });
    
    showNotification('Fee saved!', 'success');
    loadFees();
}

// ============ TIMETABLE FUNCTIONS ============
async function loadTimetable() {
    const school = getCurrentSchool();
    const timetable = await API.getTimetable(school);
    const tbody = document.getElementById('timetableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = timetable.length === 0
        ? '<tr><td colspan="6">No timetable entries</td></tr>'
        : timetable.map(t => `
            <tr>
                <td>${t.day}</td>
                <td>${t.period}</td>
                <td>${t.className}</td>
                <td>${t.subject}</td>
                <td>${t.teacher || '-'}</td>
                <td>${t.room || '-'}</td>
            </tr>
        `).join('');
}

async function loadTimetableClasses() {
    const school = getCurrentSchool();
    const classes = await API.getClasses(school);
    const select = document.getElementById('ttClass');
    
    if (select) {
        select.innerHTML = classes.map(c => `<option value="${c.name}">${c.name} ${c.stream || ''}</option>`).join('');
    }
}

async function addTimetableEntry(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    const user = getCurrentUser();
    
    await API.addTimetableEntry(school, {
        className: document.getElementById('ttClass').value,
        day: document.getElementById('ttDay').value,
        period: document.getElementById('ttPeriod').value,
        subject: document.getElementById('ttSubject').value,
        teacher: document.getElementById('ttTeacher').value,
        room: document.getElementById('ttRoom').value,
        createdBy: user.name
    });
    
    showNotification('Timetable entry added!', 'success');
    loadTimetable();
}

// ============ TEACHERS FUNCTIONS ============
async function loadTeachers() {
    const school = getCurrentSchool();
    const teachers = await API.getTeachers(school);
    const tbody = document.getElementById('teachersTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = teachers.length === 0
        ? '<tr><td colspan="5">No teachers</td></tr>'
        : teachers.map(t => `
            <tr>
                <td>${t.name}</td>
                <td>${t.email || '-'}</td>
                <td>${t.subjects || '-'}</td>
                <td>${t.classes || '-'}</td>
                <td><button class="btn btn-sm btn-danger" onclick="deleteTeacher('${t.id}')"><i class="fas fa-trash"></i></button></td>
            </tr>
        `).join('');
}

async function addTeacher(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    const user = getCurrentUser();
    
    await API.addTeacher(school, {
        name: document.getElementById('teacherName').value,
        email: document.getElementById('teacherEmail').value,
        subjects: document.getElementById('teacherSubjects').value,
        classes: document.getElementById('teacherClasses').value,
        addedBy: user.name
    });
    
    showNotification('Teacher added!', 'success');
    loadTeachers();
}

async function deleteTeacher(teacherId) {
    if (!confirm('Delete this teacher?')) return;
    const school = getCurrentSchool();
    await API.deleteTeacher(school, teacherId);
    showNotification('Teacher deleted!', 'success');
    loadTeachers();
}

// ============ CLASSES FUNCTIONS ============
async function loadClasses() {
    const school = getCurrentSchool();
    const classes = await API.getClasses(school);
    const container = document.getElementById('classesList');
    
    if (!container) return;
    
    container.innerHTML = classes.length === 0
        ? '<p style="text-align:center;">No classes</p>'
        : classes.map(c => `
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin:10px 0;">
                <h4>${c.name} ${c.stream || ''}</h4>
                <p>${c.students?.length || 0} students</p>
                <p>Teacher: ${c.teacher || 'Not assigned'}</p>
            </div>
        `).join('');
}

// ============ TERMS FUNCTIONS ============
async function loadTerms() {
    const school = getCurrentSchool();
    const terms = await API.getTerms(school);
    const container = document.getElementById('termsList');
    
    if (!container) return;
    
    container.innerHTML = terms.length === 0
        ? '<p style="text-align:center;">No terms</p>'
        : terms.map(t => `
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin:10px 0; ${t.isCurrent ? 'border-left:4px solid #28a745;' : ''}">
                <h4>${t.name} ${t.isCurrent ? '✅ Current' : ''}</h4>
                <p>${t.startDate} → ${t.endDate}</p>
            </div>
        `).join('');
}

// ============ AUDIT LOG FUNCTIONS ============
async function loadAuditLog() {
    const school = getCurrentSchool();
    const logs = await API.getAuditLog(school);
    const tbody = document.getElementById('auditLogBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = logs.length === 0
        ? '<tr><td colspan="5">No audit log entries</td></tr>'
        : logs.map(log => `
            <tr>
                <td>${formatDateTime(log.timestamp)}</td>
                <td>${log.user}</td>
                <td>${log.userEmail}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
            </tr>
        `).join('');
}

// ============ SETTINGS FUNCTIONS ============
async function loadSettings() {
    const school = getCurrentSchool();
    const [settings, schoolInfo] = await Promise.all([
        API.getSettings(school),
        API.getSchool(school)
    ]);
    
    if (schoolInfo) {
        document.getElementById('schoolNameInput').value = schoolInfo.name || '';
        document.getElementById('schoolAddress').value = schoolInfo.address || '';
        document.getElementById('adminName').value = schoolInfo.adminName || '';
        document.getElementById('adminEmail').value = schoolInfo.adminEmail || '';
        document.getElementById('schoolMotto').value = schoolInfo.motto || '';
    }
    
    if (settings) {
        document.getElementById('maxBorrowDays').value = settings.maxBorrowDays || 14;
        document.getElementById('maxBooksPerStudent').value = settings.maxBooksPerStudent || 3;
        document.getElementById('finePerDay').value = settings.finePerDay || 10;
    }
}

async function loadUsersForSettings() {
    const school = getCurrentSchool();
    const users = await API.getUsers(school);
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${u.isActive !== false ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'}</td>
            <td>
                ${u.role !== 'admin' ? `<button class="btn btn-sm btn-danger" onclick="deleteUser('${u.email}')"><i class="fas fa-trash"></i></button>` : '-'}
            </td>
        </tr>
    `).join('');
}

async function saveSettings(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    
    await API.updateSettings(school, {
        maxBorrowDays: parseInt(document.getElementById('maxBorrowDays').value),
        maxBooksPerStudent: parseInt(document.getElementById('maxBooksPerStudent').value),
        finePerDay: parseInt(document.getElementById('finePerDay').value)
    });
    
    showNotification('Settings saved!', 'success');
}

async function saveSchoolInfo(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    
    await API.updateSchool(school, {
        address: document.getElementById('schoolAddress').value,
        motto: document.getElementById('schoolMotto').value
    });
    
    showNotification('School information saved!', 'success');
}

async function addUser(event) {
    event.preventDefault();
    const school = getCurrentSchool();
    
    const result = await API.createUser(school, {
        name: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        role: document.getElementById('newUserRole').value,
        password: document.getElementById('newUserPassword').value
    });
    
    if (result.success) {
        showNotification('User added!', 'success');
        closeModal('addUserModal');
        loadUsersForSettings();
    } else {
        showNotification(result.error || 'Failed to add user', 'error');
    }
}

async function deleteUser(email) {
    if (!confirm('Delete this user?')) return;
    const school = getCurrentSchool();
    await API.deleteUser(school, email);
    showNotification('User deactivated!', 'success');
    loadUsersForSettings();
}

// ============ REPORTS FUNCTIONS ============
async function loadReports() {
    const school = getCurrentSchool();
    const [books, students, borrowed, furniture] = await Promise.all([
        API.getBooks(school),
        API.getStudents(school),
        API.getBorrowed(school),
        API.getFurniture(school)
    ]);
    
    const activeLoans = borrowed.filter(b => !b.returned);
    const overdue = activeLoans.filter(b => isOverdue(b.returnDate));
    const returned = borrowed.filter(b => b.returned);
    const returnRate = borrowed.length > 0 ? Math.round((returned.length / borrowed.length) * 100) : 0;
    
    document.getElementById('overdueCount').textContent = overdue.length;
    document.getElementById('activeLoansCount').textContent = activeLoans.length;
    document.getElementById('returnRate').textContent = returnRate + '%';
    document.getElementById('furnitureCount').textContent = furniture.filter(f => !f.returned).length;
    
    createBooksByTypeChart(books);
    createStudentsByFormChart(students);
    createFurnitureChart(furniture);
    createBorrowingTrendChart(borrowed);
}

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
                backgroundColor: ['#e94560', '#0f3460', '#d4af37', '#28a745', '#17a2b8', '#6f42c1']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: 'white' } } }
        }
    });
}

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
            datasets: [{ label: 'Students', data: Object.values(forms), backgroundColor: '#e94560' }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: 'white' } }
            }
        }
    });
}

function createFurnitureChart(furniture) {
    const canvas = document.getElementById('furnitureChart');
    if (!canvas) return;
    
    const active = furniture.filter(f => !f.returned).length;
    const returned = furniture.filter(f => f.returned).length;
    
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['Active', 'Returned'],
            datasets: [{ data: [active, returned], backgroundColor: ['#ffc107', '#28a745'] }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: 'white' } } }
        }
    });
}

function createBorrowingTrendChart(borrowed) {
    const canvas = document.getElementById('borrowingTrendChart');
    if (!canvas) return;
    
    const months = {};
    borrowed.forEach(item => {
        const date = new Date(item.borrowDate);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        months[key] = (months[key] || 0) + 1;
    });
    
    const sortedKeys = Object.keys(months).sort();
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: sortedKeys.map(k => {
                const [year, month] = k.split('-');
                return getMonthShortName(parseInt(month) - 1) + ' ' + year;
            }),
            datasets: [{
                label: 'Books Borrowed',
                data: sortedKeys.map(k => months[k]),
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: 'white' } } },
            scales: {
                y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: 'white' } }
            }
        }
    });
}

// ============ DATABASE MANAGER ============
async function loadDatabaseTables() {
    const tables = ['books', 'borrowed', 'students', 'furniture', 'teachers', 'classes', 'terms', 'events', 'fees', 'timetable', 'auditLog', 'users', 'chat', 'forum', 'notes'];
    const select = document.getElementById('databaseTableSelect');
    
    if (select) {
        select.innerHTML = tables.map(t => `<option value="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('');
    }
}

async function loadDatabaseTable() {
    const school = getCurrentSchool();
    const tableName = document.getElementById('databaseTableSelect').value;
    const data = await API.getTableData(school, tableName);
    
    const tbody = document.getElementById('databaseTableBody');
    const thead = document.getElementById('databaseTableHead');
    
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td>No data</td></tr>';
        return;
    }
    
    const columns = Object.keys(data[0]).filter(col => col !== 'password');
    
    if (thead) {
        thead.innerHTML = columns.map(col => `<th>${col}</th>`).join('');
    }
    
    tbody.innerHTML = data.map(row => `
        <tr>${columns.map(col => `<td>${typeof row[col] === 'object' ? JSON.stringify(row[col]) : (row[col] || '-')}</td>`).join('')}</tr>
    `).join('');
}

// ============ QR CODES ============
function generateQRCodes() {
    const type = document.getElementById('qrType').value;
    const start = parseInt(document.getElementById('qrStart').value);
    const end = parseInt(document.getElementById('qrEnd').value);
    const container = document.getElementById('qrContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = start; i <= Math.min(end, start + 20); i++) {
        const div = document.createElement('div');
        div.style.cssText = 'background: white; padding: 15px; border-radius: 10px; text-align: center;';
        div.innerHTML = `
            <div style="width: 100px; height: 100px; margin: 0 auto; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #333;">
                <i class="fas fa-qrcode"></i>
            </div>
            <p style="margin-top: 10px; font-weight: 700; color: #333;">${type}-${i}</p>
        `;
        container.appendChild(div);
    }
}

// ============ WALLPAPER PAGE ============
function loadWallpapers() {
    const grid = document.getElementById('wallpaperGrid');
    if (!grid) return;
    
    const currentWallpaper = localStorage.getItem('srms_wallpaper') || 'none';
    
    grid.innerHTML = Object.entries(WALLPAPER_DATA).map(([key, wallpaper]) => {
        const isActive = key === currentWallpaper;
        const previewStyle = wallpaper.type === 'gradient' 
            ? `background: ${wallpaper.css};`
            : `background-image: url('${wallpaper.url}');`;
        
        return `
            <div class="wallpaper-card ${isActive ? 'active' : ''}" onclick="selectWallpaper('${key}')">
                <div class="check-badge"><i class="fas fa-check"></i></div>
                <div class="wallpaper-preview" style="${previewStyle}">
                    <i class="fas ${wallpaper.icon || 'fa-image'}"></i>
                </div>
                <div class="wallpaper-info">
                    <h3>${wallpaper.name}</h3>
                </div>
            </div>
        `;
    }).join('');
}

function selectWallpaper(key) {
    localStorage.setItem('srms_wallpaper', key);
    document.querySelectorAll('.wallpaper-card').forEach(card => card.classList.remove('active'));
    event.target.closest('.wallpaper-card').classList.add('active');
    showNotification('Wallpaper applied!', 'success');
}

// ============ EXPORT ALL FUNCTIONS ============
window.loadDashboardData = loadDashboardData;
window.loadBooks = loadBooks;
window.loadBookOptions = loadBookOptions;
window.loadActiveReturns = loadActiveReturns;
window.loadAllBorrowed = loadAllBorrowed;
window.addBook = addBook;
window.issueBook = issueBook;
window.returnBook = returnBook;
window.deleteBook = deleteBook;
window.filterBooks = filterBooks;
window.loadStudents = loadStudents;
window.addStudent = addStudent;
window.viewStudent = viewStudent;
window.deleteStudent = deleteStudent;
window.filterStudents = filterStudents;
window.loadFurniture = loadFurniture;
window.allocateFurniture = allocateFurniture;
window.returnFurnitureItem = returnFurnitureItem;
window.loadChatUsers = loadChatUsers;
window.selectChatUser = selectChatUser;
window.sendMessage = sendMessage;
window.loadForumMessages = loadForumMessages;
window.postForumMessage = postForumMessage;
window.loadNotes = loadNotes;
window.saveNote = saveNote;
window.loadEvents = loadEvents;
window.addEvent = addEvent;
window.loadFees = loadFees;
window.saveFee = saveFee;
window.loadTimetable = loadTimetable;
window.addTimetableEntry = addTimetableEntry;
window.loadTeachers = loadTeachers;
window.addTeacher = addTeacher;
window.deleteTeacher = deleteTeacher;
window.loadClasses = loadClasses;
window.loadTerms = loadTerms;
window.loadAuditLog = loadAuditLog;
window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
window.saveSchoolInfo = saveSchoolInfo;
window.loadUsersForSettings = loadUsersForSettings;
window.addUser = addUser;
window.deleteUser = deleteUser;
window.loadReports = loadReports;
window.loadDatabaseTables = loadDatabaseTables;
window.loadDatabaseTable = loadDatabaseTable;
window.generateQRCodes = generateQRCodes;
window.loadWallpapers = loadWallpapers;
window.selectWallpaper = selectWallpaper;
window.switchTab = switchTab;
window.switchFurnitureTab = switchFurnitureTab;
window.openAddBookModal = function() { openModal('addBookModal'); };
window.openAddStudentModal = function() { openModal('addStudentModal'); };
window.openAllocateModal = function() { openModal('allocateFurnitureModal'); };
window.openAddUserModal = function() { openModal('addUserModal'); };