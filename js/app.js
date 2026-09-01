// ============================================
// SRMS - Complete Application Logic
// ALL FIXES APPLIED
// ============================================

var selectedChatUser = null;
var currentChatUserEmail = null;
var currentChatUserName = null;
var unreadMessagesCount = 0;
var messageCheckInterval = null;
var bulkFurnitureClass = null;
var bulkBookClass = null;
var currentNoteId = null;

document.addEventListener('DOMContentLoaded', function() {
    var user = checkAuth();
    if (!user) return;
    
    var page = window.location.pathname.split('/').pop();
    loadPageData(page);
    startMessageChecking();
    logAction('Page Visit', 'Visited ' + page);
    
    // Initialize dropdown controller
    initDropdownController();
});

// ============ DROPDOWN CONTROLLER (FIXES DISAPPEARING DROPDOWNS) ============
function initDropdownController() {
    var navGroups = document.querySelectorAll('.nav-group');
    
    navGroups.forEach(function(group) {
        var dropdown = group.querySelector('.dropdown-menu');
        var button = group.querySelector('.classy-btn');
        
        if (!dropdown || !button) return;
        
        var closeTimeout = null;
        
        function openDropdown() {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu.open').forEach(function(d) {
                if (d !== dropdown) d.classList.remove('open');
            });
            dropdown.classList.add('open');
        }
        
        function closeDropdownDelayed() {
            closeTimeout = setTimeout(function() {
                dropdown.classList.remove('open');
            }, 300);
        }
        
        // Hover events
        group.addEventListener('mouseenter', openDropdown);
        group.addEventListener('mouseleave', closeDropdownDelayed);
        dropdown.addEventListener('mouseenter', openDropdown);
        dropdown.addEventListener('mouseleave', closeDropdownDelayed);
        
        // Click events
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (dropdown.classList.contains('open')) {
                dropdown.classList.remove('open');
            } else {
                openDropdown();
            }
        });
    });
    
    // Close all dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-group')) {
            document.querySelectorAll('.dropdown-menu.open').forEach(function(d) {
                d.classList.remove('open');
            });
        }
    });
}

// ============ PAGE ROUTER ============
function loadPageData(page) {
    switch(page) {
        case 'dashboard.html':
            loadDashboardData();
            break;
        case 'library.html':
            loadBooks();
            loadActiveReturns();
            loadAllBorrowed();
            loadBookOptions();
            loadClassesForBulkBookIssue();
            break;
        case 'students.html':
            loadStudentsFromClasses();
            break;
        case 'furniture.html':
            loadFurniture();
            loadClassesForBulkFurniture();
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
            loadStudentsForFees();
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

// ============ AUDIT LOGGING ============
function logAction(action, details) {
    var school = getCurrentSchool();
    var user = getCurrentUser();
    if (!school || !user) return;
    
    API.addAuditLog(school, {
        user: user.name,
        userEmail: user.email,
        action: action,
        details: details
    }).then(function(result) {
        if (result.success) {
            console.log('Audit logged:', action, '-', details);
        }
    });
}

// ============ MESSAGE NOTIFICATIONS ============
function startMessageChecking() {
    if (messageCheckInterval) clearInterval(messageCheckInterval);
    checkUnreadMessages();
    messageCheckInterval = setInterval(checkUnreadMessages, 5000);
}

function checkUnreadMessages() {
    var school = getCurrentSchool();
    var user = getCurrentUser();
    if (!school || !user) return;
    
    API.getChatMessages(school, user.email, user.email).then(function(messages) {
        unreadMessagesCount = messages.length;
        updateMessageBadge(unreadMessagesCount);
    });
}

function updateMessageBadge(count) {
    var badges = document.querySelectorAll('.message-badge, #communicationBadge');
    for (var i = 0; i < badges.length; i++) {
        if (count > 0) {
            badges[i].textContent = count;
            badges[i].style.display = 'flex';
        } else {
            badges[i].style.display = 'none';
        }
    }
}

// ============ STUDENTS FROM CLASSES ============
function loadStudentsFromClasses() {
    var school = getCurrentSchool();
    
    // Load students from the students table
    API.getStudents(school).then(function(dbStudents) {
        // Also load classes to extract students
        API.getClasses(school).then(function(classes) {
            var allStudents = [];
            var seenAdms = {};
            
            // First add students from the students table
            for (var i = 0; i < dbStudents.length; i++) {
                var adm = dbStudents[i].adm || dbStudents[i].ADM || '';
                if (adm && !seenAdms[adm]) {
                    seenAdms[adm] = true;
                    allStudents.push(dbStudents[i]);
                }
            }
            
            // Then extract students from classes
            for (var i = 0; i < classes.length; i++) {
                var classStudents = classes[i].students || [];
                for (var j = 0; j < classStudents.length; j++) {
                    var student = classStudents[j];
                    var adm = student.ADM || student.adm || student['ADM No'] || student['ADM'] || '';
                    var name = student.Name || student.name || student['Full Name'] || student['Student Name'] || 'Unknown';
                    
                    if (adm && !seenAdms[adm]) {
                        seenAdms[adm] = true;
                        allStudents.push({
                            name: name,
                            adm: adm,
                            form: classes[i].name || '',
                            stream: classes[i].stream || '',
                            gender: student.Gender || student.gender || '',
                            parentName: student['Parent Name'] || student.parentName || '',
                            parentPhone: student['Parent Phone'] || student.parentPhone || '',
                            parentEmail: student['Parent Email'] || student.parentEmail || '',
                            addedBy: 'Class Import',
                            addedAt: classes[i].createdAt || new Date().toISOString()
                        });
                    }
                }
            }
            
            // Also save extracted students to the students table
            for (var k = 0; k < allStudents.length; k++) {
                API.addStudent(school, allStudents[k]);
            }
            
            displayStudents(allStudents);
        });
    });
}

function displayStudents(students) {
    var tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students found. Add classes with Excel upload or add students individually.</td></tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < students.length; i++) {
        html += '<tr>' +
            '<td>' + students[i].name + '</td>' +
            '<td>' + students[i].adm + '</td>' +
            '<td>' + (students[i].form || '-') + '</td>' +
            '<td>' + (students[i].stream || '-') + '</td>' +
            '<td>' + (students[i].gender || '-') + '</td>' +
            '<td>' + (students[i].parentPhone || '-') + '</td>' +
            '<td><button class="btn btn-sm btn-danger" onclick="deleteStudent(\'' + students[i].adm + '\')"><i class="fas fa-trash"></i></button></td>' +
            '</tr>';
    }
    tbody.innerHTML = html;
}

function loadStudentsForFees() {
    var school = getCurrentSchool();
    
    API.getStudents(school).then(function(dbStudents) {
        API.getClasses(school).then(function(classes) {
            var allStudents = [];
            var seenAdms = {};
            
            for (var i = 0; i < dbStudents.length; i++) {
                var adm = dbStudents[i].adm || dbStudents[i].ADM || '';
                if (adm && !seenAdms[adm]) {
                    seenAdms[adm] = true;
                    allStudents.push(dbStudents[i]);
                }
            }
            
            for (var i = 0; i < classes.length; i++) {
                var classStudents = classes[i].students || [];
                for (var j = 0; j < classStudents.length; j++) {
                    var student = classStudents[j];
                    var adm = student.ADM || student.adm || student['ADM No'] || student['ADM'] || '';
                    var name = student.Name || student.name || student['Full Name'] || student['Student Name'] || 'Unknown';
                    
                    if (adm && !seenAdms[adm]) {
                        seenAdms[adm] = true;
                        allStudents.push({
                            name: name,
                            adm: adm,
                            form: classes[i].name || '',
                            stream: classes[i].stream || '',
                            gender: student.Gender || student.gender || ''
                        });
                    }
                }
            }
            
            var select = document.getElementById('feeStudent');
            if (select) {
                var html = '<option value="">Select Student</option>';
                for (var i = 0; i < allStudents.length; i++) {
                    html += '<option value="' + allStudents[i].adm + '">' + allStudents[i].name + ' (' + allStudents[i].adm + ')</option>';
                }
                select.innerHTML = html;
            }
        });
    });
}

// ============ DASHBOARD ============
function loadDashboardData() {
    var school = getCurrentSchool();
    if (!school) return;
    
    var user = getCurrentUser();
    if (user) {
        var welcomeUserName = document.getElementById('welcomeUserName');
        var welcomeUserRole = document.getElementById('welcomeUserRole');
        var welcomeSchoolName = document.getElementById('welcomeSchoolName');
        var dateDisplay = document.getElementById('dateDisplay');
        
        if (welcomeUserName) welcomeUserName.textContent = user.name;
        if (welcomeUserRole) welcomeUserRole.textContent = user.role;
        if (welcomeSchoolName) welcomeSchoolName.textContent = school;
        if (dateDisplay) dateDisplay.textContent = getDateDisplay();
        
        if (user.role === 'admin') {
            API.getSchool(school).then(function(schoolInfo) {
                if (schoolInfo && schoolInfo.inviteCode) {
                    var inviteCode = document.getElementById('inviteCode');
                    var inviteCodeBanner = document.getElementById('inviteCodeBanner');
                    if (inviteCode) inviteCode.textContent = schoolInfo.inviteCode;
                    if (inviteCodeBanner) inviteCodeBanner.style.display = 'block';
                }
            });
        }
    }
    
    API.getBooks(school).then(function(books) {
        var totalBooks = 0;
        var availableBooks = 0;
        for (var i = 0; i < books.length; i++) {
            totalBooks += books[i].quantity || 0;
            availableBooks += books[i].available || 0;
        }
        animateNumber('totalBooks', totalBooks);
        animateNumber('availableBooks', availableBooks);
    });
    
    // Load total students from both students table and classes
    API.getStudents(school).then(function(dbStudents) {
        API.getClasses(school).then(function(classes) {
            var totalStudents = dbStudents.length;
            var seenAdms = {};
            
            for (var i = 0; i < dbStudents.length; i++) {
                seenAdms[dbStudents[i].adm] = true;
            }
            
            for (var i = 0; i < classes.length; i++) {
                var classStudents = classes[i].students || [];
                for (var j = 0; j < classStudents.length; j++) {
                    var adm = classStudents[j].ADM || classStudents[j].adm || classStudents[j]['ADM No'] || '';
                    if (adm && !seenAdms[adm]) {
                        seenAdms[adm] = true;
                        totalStudents++;
                    }
                }
            }
            
            animateNumber('totalStudents', totalStudents);
        });
    });
    
    API.getBorrowed(school).then(function(borrowed) {
        var activeLoans = 0;
        var overdueBooks = 0;
        for (var i = 0; i < borrowed.length; i++) {
            if (!borrowed[i].returned) {
                activeLoans++;
                if (isOverdue(borrowed[i].returnDate)) overdueBooks++;
            }
        }
        animateNumber('activeLoans', activeLoans);
        animateNumber('overdueBooks', overdueBooks);
    });
    
    API.getFurniture(school).then(function(furniture) {
        var activeFurniture = 0;
        for (var i = 0; i < furniture.length; i++) {
            if (!furniture[i].returned) activeFurniture++;
        }
        animateNumber('activeFurniture', activeFurniture);
    });
    
    API.getTeachers(school).then(function(teachers) {
        var totalTeachers = document.getElementById('totalTeachersStat');
        if (totalTeachers) totalTeachers.textContent = teachers.length;
    });
    
    API.getClasses(school).then(function(classes) {
        var totalClasses = document.getElementById('totalClassesStat');
        if (totalClasses) totalClasses.textContent = classes.length;
    });
    
    API.getEvents(school).then(function(events) {
        var today = new Date().toISOString().split('T')[0];
        var upcoming = 0;
        for (var i = 0; i < events.length; i++) {
            if (events[i].eventDate >= today) upcoming++;
        }
        var upcomingEvents = document.getElementById('upcomingEventsStat');
        if (upcomingEvents) upcomingEvents.textContent = upcoming;
    });
    
    API.getFees(school).then(function(fees) {
        var totalBalance = 0;
        for (var i = 0; i < fees.length; i++) {
            totalBalance += fees[i].balance || 0;
        }
        var outstandingFees = document.getElementById('outstandingFeesStat');
        if (outstandingFees) outstandingFees.textContent = 'KES ' + formatNumber(totalBalance);
    });
    
    loadRecentActivity();
}

function loadRecentActivity() {
    var school = getCurrentSchool();
    var activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    var activities = [];
    
    API.getBorrowed(school).then(function(borrowed) {
        for (var i = 0; i < borrowed.length; i++) {
            activities.push({
                icon: 'fa-book',
                color: 'rgba(233, 69, 96, 0.2)',
                text: '<strong>' + borrowed[i].studentName + '</strong> borrowed "' + borrowed[i].bookTitle + '"',
                time: borrowed[i].createdAt || borrowed[i].borrowDate
            });
        }
        displayActivities(activities);
    });
    
    API.getFurniture(school).then(function(furniture) {
        for (var i = 0; i < furniture.length; i++) {
            activities.push({
                icon: 'fa-chair',
                color: 'rgba(255, 193, 7, 0.2)',
                text: '<strong>' + furniture[i].studentName + '</strong> allocated ' + furniture[i].chairNo,
                time: furniture[i].createdAt || furniture[i].allocationDate
            });
        }
        displayActivities(activities);
    });
}

function displayActivities(activities) {
    var activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    activities.sort(function(a, b) {
        return new Date(b.time) - new Date(a.time);
    });
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:20px;">No recent activity</p>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < Math.min(activities.length, 10); i++) {
        html += '<div class="activity-item">' +
            '<div class="activity-icon" style="background:' + activities[i].color + ';"><i class="fas ' + activities[i].icon + '"></i></div>' +
            '<div><div class="activity-text">' + activities[i].text + '</div>' +
            '<div class="activity-time">' + formatDateTime(activities[i].time) + '</div></div>' +
            '</div>';
    }
    activityList.innerHTML = html;
}

// ============ LIBRARY ============
function loadBooks() {
    var school = getCurrentSchool();
    API.getBooks(school).then(function(books) {
        var tbody = document.getElementById('booksTableBody');
        if (!tbody) return;
        
        if (books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No books in catalog. Click "Add Book" to add books.</td></tr>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < books.length; i++) {
            html += '<tr>' +
                '<td>' + books[i].title + '</td>' +
                '<td>' + (books[i].author || '-') + '</td>' +
                '<td>' + (books[i].type || '-') + '</td>' +
                '<td>' + (books[i].subject || '-') + '</td>' +
                '<td>' + (books[i].quantity || 0) + '</td>' +
                '<td>' + (books[i].available || 0) + '</td>' +
                '<td><button class="btn btn-sm btn-danger" onclick="deleteBook(\'' + books[i].id + '\')"><i class="fas fa-trash"></i></button></td>' +
                '</tr>';
        }
        tbody.innerHTML = html;
    });
}

function loadBookOptions() {
    var school = getCurrentSchool();
    API.getBooks(school).then(function(books) {
        var select = document.getElementById('issueBookTitle');
        if (!select) return;
        
        var html = '<option value="">Select Book</option>';
        for (var i = 0; i < books.length; i++) {
            if (books[i].available > 0) {
                html += '<option value="' + books[i].title + '">' + books[i].title + ' (' + books[i].available + ' available)</option>';
            }
        }
        select.innerHTML = html;
        
        var bulkSelect = document.getElementById('bulkBookTitle');
        if (bulkSelect) {
            var bulkHtml = '<option value="">Select Book</option>';
            for (var j = 0; j < books.length; j++) {
                if (books[j].available > 0) {
                    bulkHtml += '<option value="' + books[j].title + '">' + books[j].title + ' (' + books[j].available + ' available)</option>';
                }
            }
            bulkSelect.innerHTML = bulkHtml;
        }
    });
}

function loadActiveReturns() {
    var school = getCurrentSchool();
    API.getBorrowed(school).then(function(borrowed) {
        var tbody = document.getElementById('returnsTableBody');
        if (!tbody) return;
        
        var active = [];
        for (var i = 0; i < borrowed.length; i++) {
            if (!borrowed[i].returned) active.push(borrowed[i]);
        }
        
        if (active.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No active loans</td></tr>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < active.length; i++) {
            var overdue = isOverdue(active[i].returnDate);
            var badge = overdue ? '<span class="badge badge-danger">Overdue</span>' : '<span class="badge badge-success">Active</span>';
            html += '<tr>' +
                '<td>' + active[i].studentName + '</td>' +
                '<td>' + active[i].adm + '</td>' +
                '<td>' + active[i].bookTitle + '</td>' +
                '<td>' + active[i].bookNo + '</td>' +
                '<td>' + active[i].returnDate + '</td>' +
                '<td>' + badge + '</td>' +
                '<td><button class="btn btn-sm btn-success" onclick="returnBook(\'' + active[i].id + '\')"><i class="fas fa-undo"></i> Return</button></td>' +
                '</tr>';
        }
        tbody.innerHTML = html;
    });
}

function loadAllBorrowed() {
    var school = getCurrentSchool();
    API.getBorrowed(school).then(function(borrowed) {
        var tbody = document.getElementById('borrowedTableBody');
        if (!tbody) return;
        
        if (borrowed.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No records</td></tr>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < borrowed.length; i++) {
            var status = borrowed[i].returned ? '<span class="badge badge-success">Returned</span>' : '<span class="badge badge-warning">Active</span>';
            html += '<tr>' +
                '<td>' + borrowed[i].studentName + '</td>' +
                '<td>' + borrowed[i].bookTitle + '</td>' +
                '<td>' + borrowed[i].borrowDate + '</td>' +
                '<td>' + (borrowed[i].returnDate || '-') + '</td>' +
                '<td>' + status + '</td>' +
                '</tr>';
        }
        tbody.innerHTML = html;
    });
}

function addBook(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.addBook(school, {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        type: document.getElementById('bookType').value,
        subject: document.getElementById('bookSubject').value,
        quantity: parseInt(document.getElementById('bookQuantity').value),
        createdBy: user ? user.name : ''
    }).then(function(result) {
        if (result.success) {
            showNotification('Book added successfully!', 'success');
            logAction('Book Added', document.getElementById('bookTitle').value);
            closeModal('addBookModal');
            document.getElementById('addBookForm').reset();
            loadBooks();
            loadBookOptions();
        } else {
            showNotification('Failed to add book: ' + result.error, 'error');
        }
    });
    return false;
}

function issueBook(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.issueBook(school, {
        studentName: document.getElementById('issueStudentName').value,
        adm: document.getElementById('issueADM').value,
        bookTitle: document.getElementById('issueBookTitle').value,
        bookNo: document.getElementById('issueBookNumber').value,
        borrowDate: document.getElementById('issueBorrowDate').value,
        returnDate: document.getElementById('issueReturnDate').value,
        issuedBy: user ? user.name : '',
        issuedByEmail: user ? user.email : ''
    }).then(function(result) {
        if (result.success) {
            showNotification('Book issued!', 'success');
            logAction('Book Issued', document.getElementById('issueBookTitle').value);
            document.getElementById('issueBookForm').reset();
            loadBooks();
            loadActiveReturns();
            loadAllBorrowed();
            loadBookOptions();
        }
    });
    return false;
}

function returnBook(borrowId) {
    if (!confirm('Return this book?')) return;
    var school = getCurrentSchool();
    API.returnBook(school, borrowId).then(function(result) {
        if (result.success) {
            showNotification('Book returned!', 'success');
            logAction('Book Returned', borrowId);
            loadBooks();
            loadActiveReturns();
            loadAllBorrowed();
        }
    });
}

function deleteBook(bookId) {
    if (!confirm('Delete this book?')) return;
    var school = getCurrentSchool();
    API.deleteBook(school, bookId).then(function(result) {
        if (result.success) {
            showNotification('Book deleted!', 'success');
            loadBooks();
            loadBookOptions();
        }
    });
}

function filterBooks() {
    var searchInput = document.getElementById('searchBooks');
    var tbody = document.getElementById('booksTableBody');
    filterTable(searchInput, tbody);
}

// ============ BULK BOOK ISSUE ============
function loadClassesForBulkBookIssue() {
    var school = getCurrentSchool();
    API.getClasses(school).then(function(classes) {
        var select = document.getElementById('bulkBookClass');
        if (!select) return;
        
        var html = '<option value="">Select Class</option>';
        for (var i = 0; i < classes.length; i++) {
            html += '<option value="' + classes[i].id + '">' + classes[i].name + ' ' + (classes[i].stream || '') + ' (' + (classes[i].students ? classes[i].students.length : 0) + ' students)</option>';
        }
        select.innerHTML = html;
    });
}

function loadClassStudentsForBooks() {
    var school = getCurrentSchool();
    var classId = document.getElementById('bulkBookClass').value;
    if (!classId) return;
    
    API.getClasses(school).then(function(classes) {
        var selectedClass = null;
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].id === classId) {
                selectedClass = classes[i];
                break;
            }
        }
        
        if (selectedClass && selectedClass.students) {
            bulkBookClass = selectedClass;
            var container = document.getElementById('bulkBookStudents');
            var html = '<h4 style="color:#d4af37;margin-bottom:15px;">Students (' + selectedClass.students.length + ')</h4>';
            
            for (var i = 0; i < selectedClass.students.length; i++) {
                var student = selectedClass.students[i];
                var name = student.Name || student.name || student['Full Name'] || 'Unknown';
                var adm = student.ADM || student.adm || student['ADM No'] || '';
                
                html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
                    '<span style="flex:1;">' + name + ' (' + adm + ')</span>' +
                    '<input type="text" class="book-number-input" placeholder="Book No" data-adm="' + adm + '" data-name="' + name + '" style="width:120px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">' +
                    '</div>';
            }
            
            html += '<button class="btn-primary" style="width:100%;margin-top:15px;" onclick="issueBulkBooks()"><i class="fas fa-book"></i> Issue to All</button>';
            container.innerHTML = html;
        }
    });
}

function issueBulkBooks() {
    var school = getCurrentSchool();
    var user = getCurrentUser();
    var bookTitle = document.getElementById('bulkBookTitle').value;
    var borrowDate = document.getElementById('bulkBookBorrowDate').value || getCurrentDate();
    var returnDate = document.getElementById('bulkBookReturnDate').value || addDays(getCurrentDate(), 14);
    
    if (!bookTitle) {
        showNotification('Please select a book', 'error');
        return false;
    }
    
    var bookInputs = document.querySelectorAll('.book-number-input');
    var issued = 0;
    var promises = [];
    
    for (var i = 0; i < bookInputs.length; i++) {
        var adm = bookInputs[i].dataset.adm;
        var name = bookInputs[i].dataset.name;
        var bookNo = bookInputs[i].value;
        
        if (bookNo) {
            promises.push(API.issueBook(school, {
                studentName: name,
                adm: adm,
                form: bulkBookClass ? bulkBookClass.name : '',
                stream: bulkBookClass ? (bulkBookClass.stream || '') : '',
                bookTitle: bookTitle,
                bookNo: bookNo,
                borrowDate: borrowDate,
                returnDate: returnDate,
                issuedBy: user ? user.name : '',
                issuedByEmail: user ? user.email : ''
            }));
            issued++;
        }
    }
    
    Promise.all(promises).then(function() {
        showNotification('Issued books to ' + issued + ' students!', 'success');
        logAction('Bulk Book Issue', issued + ' students');
        closeModal('bulkBookModal');
        loadBooks();
        loadActiveReturns();
        loadAllBorrowed();
    });
    
    return false;
}

// ============ FURNITURE ============
function loadFurniture() {
    var school = getCurrentSchool();
    API.getFurniture(school).then(function(furniture) {
        var active = [];
        var returned = [];
        
        for (var i = 0; i < furniture.length; i++) {
            if (furniture[i].returned) returned.push(furniture[i]);
            else active.push(furniture[i]);
        }
        
        var totalStat = document.getElementById('totalFurnitureStat');
        var activeStat = document.getElementById('activeFurnitureStat');
        var returnedStat = document.getElementById('returnedFurnitureStat');
        
        if (totalStat) totalStat.textContent = furniture.length;
        if (activeStat) activeStat.textContent = active.length;
        if (returnedStat) returnedStat.textContent = returned.length;
        
        renderFurnitureList('activeFurnitureList', active, true);
        renderFurnitureList('returnedFurnitureList', returned, false);
        renderFurnitureList('allFurnitureList', furniture, null);
    });
}

function renderFurnitureList(containerId, items, showReturnButton) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:20px;">No records</p>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < items.length; i++) {
        var isReturned = items[i].returned;
        var statusClass = isReturned ? 'status-returned' : 'status-active';
        var statusText = isReturned ? 'Returned' : 'Active';
        
        html += '<div class="furniture-card">' +
            '<span class="status-badge ' + statusClass + '">' + statusText + '</span>' +
            '<div class="furniture-icon"><i class="fas fa-chair"></i></div>' +
            '<div class="furniture-student-name">' + items[i].studentName + '</div>' +
            '<div class="furniture-adm">' + items[i].adm + '</div>' +
            '<div class="furniture-details">' +
            '<div class="furniture-detail-item"><div class="furniture-detail-label">Chair</div><div class="furniture-detail-value">' + items[i].chairNo + '</div></div>' +
            '<div class="furniture-detail-item"><div class="furniture-detail-label">Locker</div><div class="furniture-detail-value">' + (items[i].lockerNo || '-') + '</div></div>' +
            '</div>';
        
        if (showReturnButton === true && !isReturned) {
            html += '<button class="btn-return" onclick="returnFurnitureItem(\'' + items[i].id + '\')"><i class="fas fa-undo"></i> Return</button>';
        }
        
        html += '</div>';
    }
    container.innerHTML = html;
}

function allocateFurniture(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.allocateFurniture(school, {
        studentName: document.getElementById('furnitureStudentName').value,
        adm: document.getElementById('furnitureADM').value,
        form: document.getElementById('furnitureForm').value,
        stream: document.getElementById('furnitureStream').value,
        chairNo: document.getElementById('chairNumber').value,
        lockerNo: document.getElementById('lockerNumber').value,
        allocationDate: document.getElementById('furnitureAllocationDate').value,
        issuedBy: user ? user.name : '',
        issuedByEmail: user ? user.email : ''
    }).then(function(result) {
        if (result.success) {
            showNotification('Furniture allocated!', 'success');
            logAction('Furniture Allocated', document.getElementById('furnitureStudentName').value);
            closeModal('allocateModal');
            loadFurniture();
        }
    });
    return false;
}

function returnFurnitureItem(furnitureId) {
    if (!confirm('Return this furniture?')) return;
    var school = getCurrentSchool();
    API.returnFurniture(school, furnitureId).then(function(result) {
        if (result.success) {
            showNotification('Furniture returned!', 'success');
            loadFurniture();
        }
    });
}

function switchFurnitureTab(tabName) {
    var tabs = document.querySelectorAll('.tab');
    var contents = document.querySelectorAll('.tab-content');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
    for (var i = 0; i < contents.length; i++) contents[i].classList.remove('active');
    
    var tabButtons = document.querySelectorAll('[onclick*="switchFurnitureTab"]');
    for (var i = 0; i < tabButtons.length; i++) {
        if (tabButtons[i].getAttribute('onclick').indexOf(tabName) > -1) {
            tabButtons[i].classList.add('active');
        }
    }
    document.getElementById(tabName + 'FurnitureTab').classList.add('active');
}

function loadClassesForBulkFurniture() {
    var school = getCurrentSchool();
    API.getClasses(school).then(function(classes) {
        var select = document.getElementById('bulkFurnitureClass');
        if (!select) return;
        
        var html = '<option value="">Select Class</option>';
        for (var i = 0; i < classes.length; i++) {
            html += '<option value="' + classes[i].id + '">' + classes[i].name + ' ' + (classes[i].stream || '') + ' (' + (classes[i].students ? classes[i].students.length : 0) + ' students)</option>';
        }
        select.innerHTML = html;
    });
}

function loadClassStudentsForFurniture() {
    var school = getCurrentSchool();
    var classId = document.getElementById('bulkFurnitureClass').value;
    if (!classId) return;
    
    API.getClasses(school).then(function(classes) {
        var selectedClass = null;
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].id === classId) {
                selectedClass = classes[i];
                break;
            }
        }
        
        if (selectedClass && selectedClass.students) {
            bulkFurnitureClass = selectedClass;
            var container = document.getElementById('bulkFurnitureStudents');
            var html = '<h4 style="color:#d4af37;margin-bottom:15px;">Students (' + selectedClass.students.length + ')</h4>';
            
            for (var i = 0; i < selectedClass.students.length; i++) {
                var student = selectedClass.students[i];
                var name = student.Name || student.name || student['Full Name'] || 'Unknown';
                var adm = student.ADM || student.adm || student['ADM No'] || '';
                
                html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
                    '<span style="flex:1;">' + name + ' (' + adm + ')</span>' +
                    '<input type="text" class="furniture-chair-input" placeholder="Chair No" data-adm="' + adm + '" style="width:100px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">' +
                    '<input type="text" class="furniture-locker-input" placeholder="Locker No" data-adm="' + adm + '" style="width:100px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">' +
                    '</div>';
            }
            
            html += '<button class="btn-primary" style="width:100%;margin-top:15px;" onclick="allocateBulkFurniture()"><i class="fas fa-chair"></i> Allocate to All</button>';
            container.innerHTML = html;
        }
    });
}

function allocateBulkFurniture() {
    var school = getCurrentSchool();
    var user = getCurrentUser();
    var allocationDate = document.getElementById('bulkFurnitureDate').value || getCurrentDate();
    
    var chairInputs = document.querySelectorAll('.furniture-chair-input');
    var lockerInputs = document.querySelectorAll('.furniture-locker-input');
    
    var allocated = 0;
    var promises = [];
    
    for (var i = 0; i < chairInputs.length; i++) {
        var adm = chairInputs[i].dataset.adm;
        var chairNo = chairInputs[i].value;
        var lockerNo = lockerInputs[i] ? lockerInputs[i].value : '';
        
        if (chairNo) {
            var student = null;
            if (bulkFurnitureClass && bulkFurnitureClass.students) {
                for (var j = 0; j < bulkFurnitureClass.students.length; j++) {
                    var s = bulkFurnitureClass.students[j];
                    var sAdm = s.ADM || s.adm || s['ADM No'] || '';
                    if (sAdm === adm) {
                        student = s;
                        break;
                    }
                }
            }
            
            if (student) {
                var name = student.Name || student.name || student['Full Name'] || 'Unknown';
                promises.push(API.allocateFurniture(school, {
                    studentName: name,
                    adm: adm,
                    form: bulkFurnitureClass.name,
                    stream: bulkFurnitureClass.stream || '',
                    chairNo: chairNo,
                    lockerNo: lockerNo,
                    allocationDate: allocationDate,
                    issuedBy: user ? user.name : '',
                    issuedByEmail: user ? user.email : ''
                }));
                allocated++;
            }
        }
    }
    
    Promise.all(promises).then(function() {
        showNotification('Allocated furniture to ' + allocated + ' students!', 'success');
        closeModal('bulkFurnitureModal');
        loadFurniture();
    });
    
    return false;
}

// ============ CHAT ============
function loadChatUsers() {
    var school = getCurrentSchool();
    API.getUsers(school).then(function(users) {
        var currentUser = getCurrentUser();
        var userList = document.getElementById('chatUserList');
        if (!userList) return;
        
        var html = '';
        for (var i = 0; i < users.length; i++) {
            if (users[i].email !== currentUser.email) {
                html += '<button class="chat-user-btn" onclick="selectChatUser(\'' + users[i].email + '\', \'' + users[i].name + '\')">' +
                    '<div style="width:35px;height:35px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#f0d060);display:flex;align-items:center;justify-content:center;font-weight:700;color:#0a0e27;">' + getInitials(users[i].name) + '</div>' +
                    '<div style="flex:1;text-align:left;"><div style="font-weight:600;">' + users[i].name + '</div>' +
                    '<small style="color:rgba(255,255,255,0.5);">' + users[i].role + '</small></div>' +
                    '</button>';
            }
        }
        userList.innerHTML = html;
    });
}

function selectChatUser(email, name) {
    currentChatUserEmail = email;
    currentChatUserName = name;
    document.getElementById('chatWithName').textContent = name;
    loadChatMessages();
    
    var school = getCurrentSchool();
    var user = getCurrentUser();
    API.markMessagesAsRead(school, user.email, email).then(function() {
        checkUnreadMessages();
    });
}

function loadChatMessages() {
    if (!currentChatUserEmail) return;
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.getChatMessages(school, user.email, currentChatUserEmail).then(function(messages) {
        var container = document.getElementById('chatMessages');
        if (!container) return;
        
        if (messages.length === 0) {
            container.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">No messages yet</p>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < messages.length; i++) {
            var isMine = messages[i].fromEmail === user.email;
            var bg = isMine ? 'rgba(233,69,96,0.4)' : 'rgba(255,255,255,0.15)';
            var align = isMine ? 'flex-end' : 'flex-start';
            html += '<div style="display:flex;justify-content:' + align + ';margin:8px 0;">' +
                '<div style="background:' + bg + ';padding:10px 16px;border-radius:16px;max-width:70%;">' +
                '<strong>' + messages[i].fromName + ':</strong> ' + messages[i].message +
                '<br><small>' + formatTime(messages[i].timestamp) + '</small>' +
                '</div></div>';
        }
        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    });
}

function sendMessage(event) {
    event.preventDefault();
    if (!currentChatUserEmail) {
        showNotification('Select a user first', 'warning');
        return false;
    }
    
    var school = getCurrentSchool();
    var user = getCurrentUser();
    var messageInput = document.getElementById('messageInput');
    
    API.sendChatMessage(school, {
        fromEmail: user.email,
        fromName: user.name,
        toEmail: currentChatUserEmail,
        message: messageInput.value
    }).then(function(result) {
        if (result.success) {
            messageInput.value = '';
            loadChatMessages();
        }
    });
    return false;
}

// ============ FORUM ============
function loadForumMessages() {
    var school = getCurrentSchool();
    API.getForumMessages(school).then(function(messages) {
        var container = document.getElementById('forumMessages');
        if (!container) return;
        
        if (messages.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No messages</p>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < messages.length; i++) {
            html += '<div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:12px;margin:10px 0;">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
                '<strong>' + messages[i].fromName + '</strong>' +
                '<small>' + formatDateTime(messages[i].timestamp) + '</small></div>' +
                '<p style="margin:0;">' + messages[i].message + '</p></div>';
        }
        container.innerHTML = html;
    });
}

function postForumMessage(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    var input = document.getElementById('forumMessageInput');
    
    API.postForumMessage(school, {
        fromEmail: user.email,
        fromName: user.name,
        role: user.role,
        message: input.value
    }).then(function(result) {
        if (result.success) {
            input.value = '';
            loadForumMessages();
            showNotification('Posted!', 'success');
        }
    });
    return false;
}

// ============ NOTEPAD ============
function loadNotes() {
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.getNotes(school, user.email).then(function(notes) {
        var container = document.getElementById('notesList');
        if (!container) return;
        
        var myNotes = [];
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].authorEmail === user.email) myNotes.push(notes[i]);
        }
        
        if (myNotes.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No notes yet</p>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < myNotes.length; i++) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = myNotes[i].content || '';
            var contentPreview = tempDiv.textContent.substring(0, 100) + '...';
            
            html += '<div class="note-card">' +
                '<h4>' + (myNotes[i].title || 'Untitled') + '</h4>' +
                '<p>' + contentPreview + '</p>' +
                '<small>' + formatDateTime(myNotes[i].timestamp) + '</small>' +
                '<div style="margin-top:10px;display:flex;gap:8px;">' +
                '<button class="btn btn-sm btn-primary" onclick="loadNoteForEdit(\'' + myNotes[i].id + '\')"><i class="fas fa-edit"></i> Edit</button>' +
                '<button class="btn btn-sm btn-danger" onclick="deleteNote(\'' + myNotes[i].id + '\')"><i class="fas fa-trash"></i></button>' +
                '</div></div>';
        }
        container.innerHTML = html;
    });
}

function loadNoteForEdit(noteId) {
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.getNotes(school, user.email).then(function(notes) {
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id === noteId) {
                currentNoteId = noteId;
                document.getElementById('noteTitle').value = notes[i].title || '';
                document.getElementById('noteContent').innerHTML = notes[i].content || '';
                showNotification('Note loaded for editing', 'info');
                window.scrollTo(0, 0);
                break;
            }
        }
    });
}

function saveNote(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    var title = document.getElementById('noteTitle').value;
    var content = document.getElementById('noteContent').innerHTML;
    
    API.saveNote(school, {
        author: user.name,
        authorEmail: user.email,
        title: title || 'Untitled',
        content: content
    }).then(function(result) {
        if (result.success) {
            showNotification('Note saved!', 'success');
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').innerHTML = '';
            currentNoteId = null;
            loadNotes();
        }
    });
    return false;
}

function deleteNote(noteId) {
    if (!confirm('Delete this note?')) return;
    var school = getCurrentSchool();
    
    API.deleteNote(school, noteId).then(function(result) {
        if (result.success) {
            showNotification('Note deleted!', 'success');
            loadNotes();
        }
    });
}

// ============ EVENTS ============
function loadEvents() {
    var school = getCurrentSchool();
    API.getEvents(school).then(function(events) {
        var container = document.getElementById('eventsList');
        if (!container) return;
        
        if (events.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No events</p>';
            return;
        }
        
        events.sort(function(a, b) {
            return new Date(a.eventDate) - new Date(b.eventDate);
        });
        
        var html = '';
        for (var i = 0; i < events.length; i++) {
            html += '<div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:12px;margin:10px 0;border-left:4px solid #e94560;">' +
                '<div style="display:flex;justify-content:space-between;">' +
                '<strong>' + events[i].title + '</strong>' +
                '<span class="badge badge-info">' + events[i].eventType + '</span></div>' +
                '<p style="margin:5px 0;">' + (events[i].description || '') + '</p>' +
                '<small>' + formatDate(events[i].eventDate) + '</small></div>';
        }
        container.innerHTML = html;
    });
}

function addEvent(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.addEvent(school, {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        eventDate: document.getElementById('eventDate').value,
        eventType: document.getElementById('eventType').value,
        createdBy: user ? user.name : ''
    }).then(function(result) {
        if (result.success) {
            showNotification('Event added!', 'success');
            closeModal('addEventModal');
            loadEvents();
        }
    });
    return false;
}

// ============ FEES ============
function loadFees() {
    var school = getCurrentSchool();
    loadStudentsForFees();
    
    API.getFees(school).then(function(fees) {
        var tbody = document.getElementById('feesTableBody');
        if (!tbody) return;
        
        if (fees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No fee records</td></tr>';
        } else {
            var html = '';
            for (var i = 0; i < fees.length; i++) {
                var badge = fees[i].balance <= 0 ? '<span class="badge badge-success">Completed</span>' : '<span class="badge badge-warning">Partial</span>';
                html += '<tr>' +
                    '<td>' + fees[i].studentName + '</td>' +
                    '<td>' + fees[i].studentAdm + '</td>' +
                    '<td>KES ' + formatNumber(fees[i].amount) + '</td>' +
                    '<td>KES ' + formatNumber(fees[i].paid) + '</td>' +
                    '<td>KES ' + formatNumber(fees[i].balance) + '</td>' +
                    '<td>' + fees[i].term + '</td>' +
                    '<td>' + badge + '</td></tr>';
            }
            tbody.innerHTML = html;
        }
        
        var totalFees = 0, totalPaid = 0, totalBalance = 0;
        for (var i = 0; i < fees.length; i++) {
            totalFees += fees[i].amount || 0;
            totalPaid += fees[i].paid || 0;
            totalBalance += fees[i].balance || 0;
        }
        
        var totalFeesEl = document.getElementById('totalFeesAmount');
        var totalPaidEl = document.getElementById('totalPaidAmount');
        var totalBalanceEl = document.getElementById('totalBalanceAmount');
        
        if (totalFeesEl) totalFeesEl.textContent = formatCurrency(totalFees);
        if (totalPaidEl) totalPaidEl.textContent = formatCurrency(totalPaid);
        if (totalBalanceEl) totalBalanceEl.textContent = formatCurrency(totalBalance);
    });
}

function saveFee(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var studentAdm = document.getElementById('feeStudent').value;
    
    if (!studentAdm) {
        showNotification('Select a student', 'warning');
        return false;
    }
    
    var studentName = '';
    var select = document.getElementById('feeStudent');
    studentName = select.options[select.selectedIndex].text.split(' (')[0];
    
    API.saveFee(school, {
        studentAdm: studentAdm,
        studentName: studentName,
        amount: parseFloat(document.getElementById('feeAmount').value) || 0,
        paid: parseFloat(document.getElementById('feePaid').value) || 0,
        term: document.getElementById('feeTerm').value || 'Term 1'
    }).then(function(result) {
        if (result && result.success) {
            showNotification('Fee saved!', 'success');
            loadFees();
        }
    });
    return false;
}

// ============ TIMETABLE ============
function loadTimetable() {
    var school = getCurrentSchool();
    API.getTimetable(school).then(function(timetable) {
        var tbody = document.getElementById('timetableBody');
        if (!tbody) return;
        
        if (timetable.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No entries</td></tr>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < timetable.length; i++) {
            html += '<tr>' +
                '<td>' + timetable[i].day + '</td>' +
                '<td>' + timetable[i].period + '</td>' +
                '<td>' + timetable[i].className + '</td>' +
                '<td>' + timetable[i].subject + '</td>' +
                '<td>' + (timetable[i].teacher || '-') + '</td>' +
                '<td>' + (timetable[i].room || '-') + '</td></tr>';
        }
        tbody.innerHTML = html;
    });
}

function loadTimetableClasses() {
    var school = getCurrentSchool();
    API.getClasses(school).then(function(classes) {
        var select = document.getElementById('ttClass');
        if (!select) return;
        
        var html = '';
        for (var i = 0; i < classes.length; i++) {
            html += '<option value="' + classes[i].name + '">' + classes[i].name + ' ' + (classes[i].stream || '') + '</option>';
        }
        select.innerHTML = html;
    });
}

function addTimetableEntry(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.addTimetableEntry(school, {
        className: document.getElementById('ttClass').value,
        day: document.getElementById('ttDay').value,
        period: document.getElementById('ttPeriod').value,
        subject: document.getElementById('ttSubject').value,
        teacher: document.getElementById('ttTeacher').value,
        room: document.getElementById('ttRoom').value,
        createdBy: user ? user.name : ''
    }).then(function(result) {
        if (result.success) {
            showNotification('Entry added!', 'success');
            loadTimetable();
        }
    });
    return false;
}

// ============ TEACHERS ============
function loadTeachers() {
    var school = getCurrentSchool();
    API.getTeachers(school).then(function(teachers) {
        var tbody = document.getElementById('teachersTableBody');
        if (!tbody) return;
        
        if (teachers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No teachers</td></tr>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < teachers.length; i++) {
            html += '<tr>' +
                '<td>' + teachers[i].name + '</td>' +
                '<td>' + (teachers[i].email || '-') + '</td>' +
                '<td>' + (teachers[i].phone || '-') + '</td>' +
                '<td>' + (teachers[i].subjects || '-') + '</td>' +
                '<td>' + (teachers[i].classes || '-') + '</td>' +
                '<td><button class="btn btn-sm btn-danger" onclick="deleteTeacher(\'' + teachers[i].id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
        }
        tbody.innerHTML = html;
    });
}

function addTeacher(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.addTeacher(school, {
        name: document.getElementById('teacherName').value,
        email: document.getElementById('teacherEmail').value,
        phone: document.getElementById('teacherPhone').value,
        subjects: document.getElementById('teacherSubjects').value,
        classes: document.getElementById('teacherClasses').value,
        addedBy: user ? user.name : ''
    }).then(function(result) {
        if (result.success) {
            showNotification('Teacher added!', 'success');
            closeModal('addTeacherModal');
            loadTeachers();
        }
    });
    return false;
}

function deleteTeacher(teacherId) {
    if (!confirm('Delete this teacher?')) return;
    var school = getCurrentSchool();
    API.deleteTeacher(school, teacherId).then(function() {
        showNotification('Teacher deleted!', 'success');
        loadTeachers();
    });
}

// ============ CLASSES ============
function loadClasses() {
    var school = getCurrentSchool();
    API.getClasses(school).then(function(classes) {
        var container = document.getElementById('classesList');
        if (!container) return;
        
        if (classes.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No classes yet. Add a class with Excel upload.</p>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < classes.length; i++) {
            var studentCount = classes[i].students ? classes[i].students.length : 0;
            html += '<div class="class-card">' +
                '<h4>' + classes[i].name + ' ' + (classes[i].stream || '') + '</h4>' +
                '<p>' + studentCount + ' students</p>' +
                '<p>Teacher: ' + (classes[i].teacher || 'Not assigned') + '</p>' +
                '<button class="btn btn-sm btn-primary" onclick="viewClassStudents(\'' + classes[i].id + '\')"><i class="fas fa-eye"></i> View Students</button>' +
                '</div>';
        }
        container.innerHTML = html;
    });
}

function handleExcelUpload(event) {
    var file = event.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = e.target.result;
            var workbook = XLSX.read(data, { type: 'binary' });
            var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            var jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            document.getElementById('excelStudentCount').textContent = jsonData.length + ' students loaded';
            document.getElementById('excelStudentsData').value = JSON.stringify(jsonData);
            document.getElementById('excelStudentsData').dataset.loaded = 'true';
            
            if (jsonData.length > 0) {
                var columns = Object.keys(jsonData[0]);
                var previewHtml = '<table class="data-table"><thead><tr>';
                for (var i = 0; i < columns.length; i++) {
                    previewHtml += '<th>' + columns[i] + '</th>';
                }
                previewHtml += '</tr></thead><tbody>';
                for (var i = 0; i < Math.min(jsonData.length, 5); i++) {
                    previewHtml += '<tr>';
                    for (var j = 0; j < columns.length; j++) {
                        previewHtml += '<td>' + (jsonData[i][columns[j]] || '-') + '</td>';
                    }
                    previewHtml += '</tr>';
                }
                previewHtml += '</tbody></table>';
                document.getElementById('excelPreview').innerHTML = previewHtml;
            }
        } catch (error) {
            showNotification('Error reading Excel file: ' + error.message, 'error');
        }
    };
    reader.readAsBinaryString(file);
}

function addClassWithExcel(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    var className = document.getElementById('className').value;
    var classStream = document.getElementById('classStream').value;
    var classTeacher = document.getElementById('classTeacher').value;
    var studentsData = document.getElementById('excelStudentsData').value;
    
    if (!className) {
        showNotification('Class name is required', 'error');
        return false;
    }
    
    var students = [];
    if (studentsData && document.getElementById('excelStudentsData').dataset.loaded === 'true') {
        try {
            students = JSON.parse(studentsData);
        } catch (e) {
            students = [];
        }
    }
    
    API.addClass(school, {
        name: className,
        stream: classStream,
        teacher: classTeacher,
        students: students,
        createdBy: user ? user.name : ''
    }).then(function(result) {
        if (result.success) {
            showNotification('Class added with ' + students.length + ' students!', 'success');
            logAction('Class Added', className + ' with ' + students.length + ' students');
            closeModal('addClassModal');
            loadClasses();
        }
    });
    return false;
}

function viewClassStudents(classId) {
    var school = getCurrentSchool();
    API.getClasses(school).then(function(classes) {
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].id === classId) {
                var cls = classes[i];
                var students = cls.students || [];
                
                var existingModal = document.getElementById('viewStudentsModal');
                if (existingModal) existingModal.remove();
                
                var modal = document.createElement('div');
                modal.className = 'modal active';
                modal.id = 'viewStudentsModal';
                
                var html = '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<h3><i class="fas fa-users"></i> ' + cls.name + ' ' + (cls.stream || '') + ' Students</h3>' +
                    '<button class="modal-close" onclick="closeModal(\'viewStudentsModal\')"><i class="fas fa-times"></i></button>' +
                    '</div>';
                
                if (students.length === 0) {
                    html += '<p style="text-align:center;">No students in this class</p>';
                } else {
                    html += '<table class="data-table"><thead><tr><th>#</th><th>Name</th><th>ADM</th><th>Gender</th></tr></thead><tbody>';
                    for (var j = 0; j < students.length; j++) {
                        var name = students[j].Name || students[j].name || students[j]['Full Name'] || students[j]['Student Name'] || 'Unknown';
                        var adm = students[j].ADM || students[j].adm || students[j]['ADM No'] || students[j]['ADM'] || '-';
                        var gender = students[j].Gender || students[j].gender || '-';
                        html += '<tr><td>' + (j + 1) + '</td><td>' + name + '</td><td>' + adm + '</td><td>' + gender + '</td></tr>';
                    }
                    html += '</tbody></table>';
                }
                
                html += '</div>';
                modal.innerHTML = html;
                document.body.appendChild(modal);
                break;
            }
        }
    });
}

// ============ TERMS ============
function loadTerms() {
    var school = getCurrentSchool();
    API.getTerms(school).then(function(terms) {
        var container = document.getElementById('termsList');
        if (!container) return;
        
        if (terms.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No terms</p>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < terms.length; i++) {
            var current = terms[i].isCurrent ? '✅ Current' : '';
            var borderStyle = terms[i].isCurrent ? 'border-left:4px solid #28a745;' : '';
            html += '<div class="term-card" style="' + borderStyle + '">' +
                '<h4>' + terms[i].name + ' ' + current + '</h4>' +
                '<p>' + terms[i].startDate + ' → ' + terms[i].endDate + '</p></div>';
        }
        container.innerHTML = html;
    });
}

function addTerm(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.addTerm(school, {
        name: document.getElementById('termName').value,
        startDate: document.getElementById('termStartDate').value,
        endDate: document.getElementById('termEndDate').value,
        createdBy: user ? user.name : ''
    }).then(function(result) {
        if (result.success) {
            showNotification('Term added!', 'success');
            closeModal('addTermModal');
            loadTerms();
        }
    });
    return false;
}

// ============ AUDIT LOG ============
function loadAuditLog() {
    var school = getCurrentSchool();
    API.getAuditLog(school).then(function(logs) {
        var tbody = document.getElementById('auditLogBody');
        if (!tbody) return;
        
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No audit log entries yet</td></tr>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < logs.length; i++) {
            html += '<tr>' +
                '<td>' + formatDateTime(logs[i].timestamp) + '</td>' +
                '<td>' + (logs[i].user || '-') + '</td>' +
                '<td>' + (logs[i].userEmail || '-') + '</td>' +
                '<td>' + (logs[i].action || '-') + '</td>' +
                '<td>' + (logs[i].details || '-') + '</td></tr>';
        }
        tbody.innerHTML = html;
    });
}

// ============ SETTINGS ============
function loadSettings() {
    var school = getCurrentSchool();
    
    API.getSchool(school).then(function(schoolInfo) {
        if (schoolInfo) {
            document.getElementById('schoolNameInput').value = schoolInfo.name || '';
            document.getElementById('schoolAddress').value = schoolInfo.address || '';
            document.getElementById('adminName').value = schoolInfo.adminName || '';
            document.getElementById('adminEmail').value = schoolInfo.adminEmail || '';
            document.getElementById('schoolMotto').value = schoolInfo.motto || '';
        }
    });
    
    API.getSettings(school).then(function(settings) {
        if (settings) {
            document.getElementById('maxBorrowDays').value = settings.maxBorrowDays || 14;
            document.getElementById('maxBooksPerStudent').value = settings.maxBooksPerStudent || 3;
            document.getElementById('finePerDay').value = settings.finePerDay || 10;
        }
    });
}

function loadUsersForSettings() {
    var school = getCurrentSchool();
    API.getUsers(school).then(function(users) {
        var tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        var currentUser = getCurrentUser();
        var html = '';
        
        for (var i = 0; i < users.length; i++) {
            var status = users[i].isActive !== false ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>';
            var roleBadge = users[i].role === 'admin' ? '<span class="badge badge-admin">Admin</span>' : '<span class="badge badge-info">' + users[i].role + '</span>';
            
            var actions = '';
            if (users[i].role !== 'admin') {
                actions += '<button class="btn-promote" onclick="promoteToAdmin(\'' + users[i].email + '\')"><i class="fas fa-arrow-up"></i> Promote</button> ';
            }
            if (users[i].email !== currentUser.email) {
                actions += '<button class="btn btn-sm btn-danger" onclick="deleteUser(\'' + users[i].email + '\')"><i class="fas fa-trash"></i></button>';
            } else {
                actions += '<span style="font-size:11px;color:rgba(255,255,255,0.4);">You</span>';
            }
            
            html += '<tr>' +
                '<td>' + users[i].name + '</td>' +
                '<td>' + users[i].email + '</td>' +
                '<td>' + roleBadge + '</td>' +
                '<td>' + status + '</td>' +
                '<td>' + actions + '</td></tr>';
        }
        tbody.innerHTML = html;
    });
}

function promoteToAdmin(email) {
    if (!confirm('Promote this user to admin?')) return;
    var school = getCurrentSchool();
    
    API.updateUser(school, email, { role: 'admin' }).then(function(result) {
        if (result.success) {
            showNotification('User promoted to admin!', 'success');
            logAction('User Promoted', email);
            loadUsersForSettings();
        }
    });
}

function saveSettings(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    
    API.updateSettings(school, {
        maxBorrowDays: parseInt(document.getElementById('maxBorrowDays').value),
        maxBooksPerStudent: parseInt(document.getElementById('maxBooksPerStudent').value),
        finePerDay: parseInt(document.getElementById('finePerDay').value)
    }).then(function(result) {
        if (result.success) showNotification('Settings saved!', 'success');
    });
    return false;
}

function saveSchoolInfo(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    
    API.updateSchool(school, {
        address: document.getElementById('schoolAddress').value,
        motto: document.getElementById('schoolMotto').value
    }).then(function(result) {
        if (result.success) showNotification('School info saved!', 'success');
    });
    return false;
}

function addUser(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    
    API.createUser(school, {
        name: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        role: document.getElementById('newUserRole').value,
        password: document.getElementById('newUserPassword').value
    }).then(function(result) {
        if (result.success) {
            showNotification('User added!', 'success');
            closeModal('addUserModal');
            loadUsersForSettings();
        } else {
            showNotification(result.error || 'Failed to add user', 'error');
        }
    });
    return false;
}

function deleteUser(email) {
    if (!confirm('Deactivate this user?')) return;
    var school = getCurrentSchool();
    API.deleteUser(school, email).then(function() {
        showNotification('User deactivated!', 'success');
        loadUsersForSettings();
    });
}

// ============ DATABASE MANAGER ============
function loadDatabaseTables() {
    var tables = ['books', 'borrowed', 'students', 'furniture', 'teachers', 'classes', 'terms', 'events', 'fees', 'timetable', 'auditLog', 'users', 'chat', 'forum', 'notes'];
    var select = document.getElementById('databaseTableSelect');
    if (!select) return;
    
    var html = '';
    for (var i = 0; i < tables.length; i++) {
        html += '<option value="' + tables[i] + '">' + tables[i].charAt(0).toUpperCase() + tables[i].slice(1) + '</option>';
    }
    select.innerHTML = html;
    
    setTimeout(loadDatabaseTable, 500);
}

function loadDatabaseTable() {
    var school = getCurrentSchool();
    var tableName = document.getElementById('databaseTableSelect').value;
    
    API.getTableData(school, tableName).then(function(data) {
        var tbody = document.getElementById('databaseTableBody');
        var thead = document.getElementById('databaseTableHead');
        
        if (!tbody || !thead) return;
        
        if (data.length === 0) {
            thead.innerHTML = '';
            tbody.innerHTML = '<tr><td>No data in this table</td></tr>';
            return;
        }
        
        var columns = Object.keys(data[0]);
        var filteredColumns = [];
        for (var i = 0; i < columns.length; i++) {
            if (columns[i] !== 'password') filteredColumns.push(columns[i]);
        }
        
        var headHtml = '';
        for (var i = 0; i < filteredColumns.length; i++) {
            headHtml += '<th>' + filteredColumns[i] + '</th>';
        }
        thead.innerHTML = headHtml;
        
        var bodyHtml = '';
        for (var i = 0; i < data.length; i++) {
            bodyHtml += '<tr>';
            for (var j = 0; j < filteredColumns.length; j++) {
                var value = data[i][filteredColumns[j]];
                if (typeof value === 'object') value = JSON.stringify(value);
                bodyHtml += '<td>' + (value || '-') + '</td>';
            }
            bodyHtml += '</tr>';
        }
        tbody.innerHTML = bodyHtml;
    });
}

// ============ WALLPAPER ============
function loadWallpapers() {
    var grid = document.getElementById('wallpaperGrid');
    if (!grid) return;
    
    var currentWallpaper = localStorage.getItem('srms_wallpaper') || 'none';
    
    var html = '';
    for (var key in WALLPAPER_DATA) {
        var wallpaper = WALLPAPER_DATA[key];
        var isActive = key === currentWallpaper ? ' active' : '';
        
        // FIX: Use actual image preview with visible thumbnail
        var previewStyle = '';
        if (wallpaper.type === 'gradient') {
            previewStyle = 'background:' + wallpaper.css + ';';
        } else {
            previewStyle = 'background-image:url("' + wallpaper.url.replace('w=1920', 'w=400&h=300&fit=crop') + '");background-size:cover;background-position:center;';
        }
        
        html += '<div class="wallpaper-card' + isActive + '" onclick="selectWallpaper(\'' + key + '\')">' +
            '<div class="check-badge"><i class="fas fa-check"></i></div>' +
            '<div class="wallpaper-preview" style="' + previewStyle + '"></div>' +
            '<div class="wallpaper-info"><h3>' + wallpaper.name + '</h3></div></div>';
    }
    grid.innerHTML = html;
}

function selectWallpaper(key) {
    localStorage.setItem('srms_wallpaper', key);
    var cards = document.querySelectorAll('.wallpaper-card');
    for (var i = 0; i < cards.length; i++) cards[i].classList.remove('active');
    event.target.closest('.wallpaper-card').classList.add('active');
    
    var wallpaper = WALLPAPER_DATA[key];
    if (wallpaper.type === 'gradient') {
        document.body.style.background = wallpaper.css;
        document.body.style.backgroundImage = 'none';
    } else {
        document.body.style.backgroundImage = 'linear-gradient(rgba(10,14,39,0.55),rgba(10,14,39,0.65)),url("' + wallpaper.url + '")';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }
    
    showNotification('Wallpaper applied!', 'success');
}

// ============ REPORTS ============
function loadReports() {
    var school = getCurrentSchool();
    
    Promise.all([
        API.getBooks(school),
        API.getStudents(school),
        API.getBorrowed(school),
        API.getFurniture(school)
    ]).then(function(results) {
        var books = results[0];
        var students = results[1];
        var borrowed = results[2];
        var furniture = results[3];
        
        var activeLoans = borrowed.filter(function(b) { return !b.returned; });
        var overdue = activeLoans.filter(function(b) { return isOverdue(b.returnDate); });
        var returned = borrowed.filter(function(b) { return b.returned; });
        var returnRate = borrowed.length > 0 ? Math.round((returned.length / borrowed.length) * 100) : 0;
        
        document.getElementById('overdueCount').textContent = overdue.length;
        document.getElementById('activeLoansCount').textContent = activeLoans.length;
        document.getElementById('returnRate').textContent = returnRate + '%';
        document.getElementById('furnitureCount').textContent = furniture.filter(function(f) { return !f.returned; }).length;
        
        createBooksByTypeChart(books);
        createStudentsByFormChart(students);
        createFurnitureChart(furniture);
        createBorrowingTrendChart(borrowed);
    });
}

function createBooksByTypeChart(books) {
    var canvas = document.getElementById('booksByTypeChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    var types = {};
    for (var i = 0; i < books.length; i++) {
        var type = books[i].type || 'Other';
        types[type] = (types[type] || 0) + (books[i].quantity || 0);
    }
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(types),
            datasets: [{ data: Object.values(types), backgroundColor: ['#e94560', '#0f3460', '#d4af37', '#28a745', '#17a2b8', '#6f42c1'] }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: 'white' } } }
        }
    });
}

function createStudentsByFormChart(students) {
    var canvas = document.getElementById('studentsByFormChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    var forms = {};
    for (var i = 0; i < students.length; i++) {
        var form = students[i].form || 'Unknown';
        forms[form] = (forms[form] || 0) + 1;
    }
    
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
    var canvas = document.getElementById('furnitureChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    var active = furniture.filter(function(f) { return !f.returned; }).length;
    var returned = furniture.filter(function(f) { return f.returned; }).length;
    
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
    var canvas = document.getElementById('borrowingTrendChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    var months = {};
    for (var i = 0; i < borrowed.length; i++) {
        var date = new Date(borrowed[i].borrowDate);
        var key = date.getFullYear() + '-' + (date.getMonth() + 1);
        months[key] = (months[key] || 0) + 1;
    }
    
    var sortedKeys = Object.keys(months).sort();
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: sortedKeys.map(function(k) {
                var parts = k.split('-');
                return getMonthShortName(parseInt(parts[1]) - 1) + ' ' + parts[0];
            }),
            datasets: [{
                label: 'Books Borrowed',
                data: sortedKeys.map(function(k) { return months[k]; }),
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212,175,55,0.2)',
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
window.loadStudentsFromClasses = loadStudentsFromClasses;
window.addStudent = addStudent;
window.deleteStudent = deleteStudent;
window.filterStudents = filterStudents;
window.loadFurniture = loadFurniture;
window.allocateFurniture = allocateFurniture;
window.returnFurnitureItem = returnFurnitureItem;
window.switchFurnitureTab = switchFurnitureTab;
window.loadChatUsers = loadChatUsers;
window.selectChatUser = selectChatUser;
window.sendMessage = sendMessage;
window.loadForumMessages = loadForumMessages;
window.postForumMessage = postForumMessage;
window.loadNotes = loadNotes;
window.saveNote = saveNote;
window.deleteNote = deleteNote;
window.loadNoteForEdit = loadNoteForEdit;
window.loadEvents = loadEvents;
window.addEvent = addEvent;
window.loadFees = loadFees;
window.saveFee = saveFee;
window.loadTimetable = loadTimetable;
window.loadTimetableClasses = loadTimetableClasses;
window.addTimetableEntry = addTimetableEntry;
window.loadTeachers = loadTeachers;
window.addTeacher = addTeacher;
window.deleteTeacher = deleteTeacher;
window.loadClasses = loadClasses;
window.addClassWithExcel = addClassWithExcel;
window.handleExcelUpload = handleExcelUpload;
window.viewClassStudents = viewClassStudents;
window.loadTerms = loadTerms;
window.addTerm = addTerm;
window.loadAuditLog = loadAuditLog;
window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
window.saveSchoolInfo = saveSchoolInfo;
window.loadUsersForSettings = loadUsersForSettings;
window.addUser = addUser;
window.deleteUser = deleteUser;
window.promoteToAdmin = promoteToAdmin;
window.loadDatabaseTables = loadDatabaseTables;
window.loadDatabaseTable = loadDatabaseTable;
window.loadWallpapers = loadWallpapers;
window.selectWallpaper = selectWallpaper;
window.logAction = logAction;
window.loadClassesForBulkFurniture = loadClassesForBulkFurniture;
window.loadClassStudentsForFurniture = loadClassStudentsForFurniture;
window.allocateBulkFurniture = allocateBulkFurniture;
window.loadClassesForBulkBookIssue = loadClassesForBulkBookIssue;
window.loadClassStudentsForBooks = loadClassStudentsForBooks;
window.issueBulkBooks = issueBulkBooks;
window.checkUnreadMessages = checkUnreadMessages;
window.startMessageChecking = startMessageChecking;
window.initDropdownController = initDropdownController;
window.loadStudentsForFees = loadStudentsForFees;