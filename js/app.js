// ============================================
// SRMS - Complete Application Logic
// ============================================

var selectedChatUser = null;
var currentChatUserEmail = null;
var currentChatUserName = null;

document.addEventListener('DOMContentLoaded', function() {
    var user = checkAuth();
    if (!user) return;
    
    var page = window.location.pathname.split('/').pop();
    loadPageData(page);
});

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
    
    API.getStudents(school).then(function(students) {
        animateNumber('totalStudents', students.length);
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

function loadBooks() {
    var school = getCurrentSchool();
    API.getBooks(school).then(function(books) {
        var tbody = document.getElementById('booksTableBody');
        if (!tbody) return;
        
        if (books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No books in catalog</td></tr>';
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
            showNotification('Book added!', 'success');
            closeModal('addBookModal');
            document.getElementById('addBookForm').reset();
            loadBooks();
            loadBookOptions();
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
        }
    });
}

function filterBooks() {
    var searchInput = document.getElementById('searchBooks');
    var tbody = document.getElementById('booksTableBody');
    filterTable(searchInput, tbody);
}

function loadStudents() {
    var school = getCurrentSchool();
    API.getStudents(school).then(function(students) {
        var tbody = document.getElementById('studentsTableBody');
        if (!tbody) return;
        
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students</td></tr>';
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
    });
}

function addStudent(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.addStudent(school, {
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
        addedBy: user ? user.name : ''
    }).then(function(result) {
        if (result.success) {
            showNotification('Student added!', 'success');
            closeModal('addStudentModal');
            document.getElementById('addStudentForm').reset();
            loadStudents();
        }
    });
    return false;
}

function deleteStudent(adm) {
    if (!confirm('Delete this student?')) return;
    var school = getCurrentSchool();
    API.deleteStudent(school, adm).then(function(result) {
        if (result.success) {
            showNotification('Student deleted!', 'success');
            loadStudents();
        }
    });
}

function filterStudents() {
    var searchInput = document.getElementById('searchStudents');
    var tbody = document.getElementById('studentsTableBody');
    filterTable(searchInput, tbody);
}

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
        
        var activeList = document.getElementById('activeFurnitureList');
        if (activeList) {
            if (active.length === 0) {
                activeList.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No active allocations</p>';
            } else {
                var html = '';
                for (var i = 0; i < active.length; i++) {
                    html += '<div class="furniture-card">' +
                        '<span class="status-badge status-active">Active</span>' +
                        '<div class="furniture-icon"><i class="fas fa-chair"></i></div>' +
                        '<div class="furniture-student-name">' + active[i].studentName + '</div>' +
                        '<div class="furniture-adm">' + active[i].adm + '</div>' +
                        '<div class="furniture-details">' +
                        '<div class="furniture-detail-item"><div class="furniture-detail-label">Chair</div><div class="furniture-detail-value">' + active[i].chairNo + '</div></div>' +
                        '<div class="furniture-detail-item"><div class="furniture-detail-label">Locker</div><div class="furniture-detail-value">' + (active[i].lockerNo || '-') + '</div></div>' +
                        '</div>' +
                        '<button class="btn-return" onclick="returnFurnitureItem(\'' + active[i].id + '\')"><i class="fas fa-undo"></i> Return</button>' +
                        '</div>';
                }
                activeList.innerHTML = html;
            }
        }
        
        var returnedList = document.getElementById('returnedFurnitureList');
        if (returnedList) {
            if (returned.length === 0) {
                returnedList.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No returned furniture</p>';
            } else {
                var html = '';
                for (var i = 0; i < returned.length; i++) {
                    html += '<div class="furniture-card">' +
                        '<span class="status-badge status-returned">Returned</span>' +
                        '<div class="furniture-icon"><i class="fas fa-chair"></i></div>' +
                        '<div class="furniture-student-name">' + returned[i].studentName + '</div>' +
                        '<div class="furniture-adm">' + returned[i].adm + '</div>' +
                        '<div class="furniture-details">' +
                        '<div class="furniture-detail-item"><div class="furniture-detail-label">Chair</div><div class="furniture-detail-value">' + returned[i].chairNo + '</div></div>' +
                        '<div class="furniture-detail-item"><div class="furniture-detail-label">Locker</div><div class="furniture-detail-value">' + (returned[i].lockerNo || '-') + '</div></div>' +
                        '</div>' +
                        '</div>';
                }
                returnedList.innerHTML = html;
            }
        }
        
        var allList = document.getElementById('allFurnitureList');
        if (allList) {
            if (furniture.length === 0) {
                allList.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No furniture records</p>';
            } else {
                var html = '';
                for (var i = 0; i < furniture.length; i++) {
                    var statusClass = furniture[i].returned ? 'status-returned' : 'status-active';
                    var statusText = furniture[i].returned ? 'Returned' : 'Active';
                    html += '<div class="furniture-card">' +
                        '<span class="status-badge ' + statusClass + '">' + statusText + '</span>' +
                        '<div class="furniture-icon"><i class="fas fa-chair"></i></div>' +
                        '<div class="furniture-student-name">' + furniture[i].studentName + '</div>' +
                        '<div class="furniture-adm">' + furniture[i].adm + '</div>' +
                        '<div class="furniture-details">' +
                        '<div class="furniture-detail-item"><div class="furniture-detail-label">Chair</div><div class="furniture-detail-value">' + furniture[i].chairNo + '</div></div>' +
                        '<div class="furniture-detail-item"><div class="furniture-detail-label">Date</div><div class="furniture-detail-value">' + furniture[i].allocationDate + '</div></div>' +
                        '</div>' +
                        '</div>';
                }
                allList.innerHTML = html;
            }
        }
    });
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
            closeModal('allocateModal');
            document.getElementById('allocateForm').reset();
            document.getElementById('furnitureAllocationDate').value = getCurrentDate();
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
}

function loadChatMessages() {
    if (!currentChatUserEmail) return;
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.getChatMessages(school, user.email, currentChatUserEmail).then(function(messages) {
        var container = document.getElementById('chatMessages');
        if (!container) return;
        
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

function loadForumMessages() {
    var school = getCurrentSchool();
    API.getForumMessages(school).then(function(messages) {
        var container = document.getElementById('forumMessages');
        if (!container) return;
        
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
            html += '<div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:12px;margin:10px 0;">' +
                '<h4 style="margin:0 0 5px;color:#d4af37;">' + (myNotes[i].title || 'Untitled') + '</h4>' +
                '<p style="margin:0 0 8px;">' + myNotes[i].content + '</p>' +
                '<small>' + formatDateTime(myNotes[i].timestamp) + '</small></div>';
        }
        container.innerHTML = html;
    });
}

function saveNote(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.saveNote(school, {
        author: user.name,
        authorEmail: user.email,
        title: document.getElementById('noteTitle').value,
        content: document.getElementById('noteContent').value
    }).then(function(result) {
        if (result.success) {
            showNotification('Note saved!', 'success');
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
            loadNotes();
        }
    });
    return false;
}

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

function loadFees() {
    var school = getCurrentSchool();
    
    API.getStudents(school).then(function(students) {
        var select = document.getElementById('feeStudent');
        if (select) {
            var html = '<option value="">Select Student</option>';
            for (var i = 0; i < students.length; i++) {
                html += '<option value="' + students[i].adm + '">' + students[i].name + ' (' + students[i].adm + ')</option>';
            }
            select.innerHTML = html;
        }
    });
    
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
    
    API.getStudents(school).then(function(students) {
        var studentName = '';
        for (var i = 0; i < students.length; i++) {
            if (students[i].adm === studentAdm) {
                studentName = students[i].name;
                break;
            }
        }
        
        return API.saveFee(school, {
            studentAdm: studentAdm,
            studentName: studentName,
            amount: parseFloat(document.getElementById('feeAmount').value) || 0,
            paid: parseFloat(document.getElementById('feePaid').value) || 0,
            term: document.getElementById('feeTerm').value || 'Term 1'
        });
    }).then(function(result) {
        if (result && result.success) {
            showNotification('Fee saved!', 'success');
            loadFees();
        }
    });
    return false;
}

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

function loadClasses() {
    var school = getCurrentSchool();
    API.getClasses(school).then(function(classes) {
        var container = document.getElementById('classesList');
        if (!container) return;
        
        if (classes.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No classes</p>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < classes.length; i++) {
            html += '<div class="class-card">' +
                '<h4>' + classes[i].name + ' ' + (classes[i].stream || '') + '</h4>' +
                '<p>' + (classes[i].students ? classes[i].students.length : 0) + ' students</p>' +
                '<p>Teacher: ' + (classes[i].teacher || 'Not assigned') + '</p></div>';
        }
        container.innerHTML = html;
    });
}

function addClass(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    var user = getCurrentUser();
    
    API.addClass(school, {
        name: document.getElementById('className').value,
        stream: document.getElementById('classStream').value,
        teacher: document.getElementById('classTeacher').value,
        createdBy: user ? user.name : ''
    }).then(function(result) {
        if (result.success) {
            showNotification('Class added!', 'success');
            closeModal('addClassModal');
            loadClasses();
        }
    });
    return false;
}

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

function loadAuditLog() {
    var school = getCurrentSchool();
    API.getAuditLog(school).then(function(logs) {
        var tbody = document.getElementById('auditLogBody');
        if (!tbody) return;
        
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No audit log entries</td></tr>';
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

function loadSettings() {
    var school = getCurrentSchool();
    
    API.getSchool(school).then(function(schoolInfo) {
        if (schoolInfo) {
            var schoolNameInput = document.getElementById('schoolNameInput');
            var schoolAddress = document.getElementById('schoolAddress');
            var adminName = document.getElementById('adminName');
            var adminEmail = document.getElementById('adminEmail');
            var schoolMotto = document.getElementById('schoolMotto');
            
            if (schoolNameInput) schoolNameInput.value = schoolInfo.name || '';
            if (schoolAddress) schoolAddress.value = schoolInfo.address || '';
            if (adminName) adminName.value = schoolInfo.adminName || '';
            if (adminEmail) adminEmail.value = schoolInfo.adminEmail || '';
            if (schoolMotto) schoolMotto.value = schoolInfo.motto || '';
        }
    });
    
    API.getSettings(school).then(function(settings) {
        if (settings) {
            var maxBorrowDays = document.getElementById('maxBorrowDays');
            var maxBooksPerStudent = document.getElementById('maxBooksPerStudent');
            var finePerDay = document.getElementById('finePerDay');
            
            if (maxBorrowDays) maxBorrowDays.value = settings.maxBorrowDays || 14;
            if (maxBooksPerStudent) maxBooksPerStudent.value = settings.maxBooksPerStudent || 3;
            if (finePerDay) finePerDay.value = settings.finePerDay || 10;
        }
    });
}

function loadUsersForSettings() {
    var school = getCurrentSchool();
    API.getUsers(school).then(function(users) {
        var tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        var html = '';
        for (var i = 0; i < users.length; i++) {
            var status = users[i].isActive !== false ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>';
            var action = users[i].role !== 'admin' ? '<button class="btn btn-sm btn-danger" onclick="deleteUser(\'' + users[i].email + '\')"><i class="fas fa-trash"></i></button>' : '-';
            html += '<tr>' +
                '<td>' + users[i].name + '</td>' +
                '<td>' + users[i].email + '</td>' +
                '<td>' + users[i].role + '</td>' +
                '<td>' + status + '</td>' +
                '<td>' + action + '</td></tr>';
        }
        tbody.innerHTML = html;
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

function loadDatabaseTables() {
    var tables = ['books', 'borrowed', 'students', 'furniture', 'teachers', 'classes', 'terms', 'events', 'fees', 'timetable', 'auditLog', 'users', 'chat', 'forum', 'notes'];
    var select = document.getElementById('databaseTableSelect');
    if (!select) return;
    
    var html = '';
    for (var i = 0; i < tables.length; i++) {
        html += '<option value="' + tables[i] + '">' + tables[i].charAt(0).toUpperCase() + tables[i].slice(1) + '</option>';
    }
    select.innerHTML = html;
    
    setTimeout(function() {
        loadDatabaseTable();
    }, 500);
}

function loadDatabaseTable() {
    var school = getCurrentSchool();
    var tableName = document.getElementById('databaseTableSelect').value;
    
    API.getTableData(school, tableName).then(function(data) {
        var tbody = document.getElementById('databaseTableBody');
        var thead = document.getElementById('databaseTableHead');
        
        if (!tbody) return;
        
        if (data.length === 0) {
            thead.innerHTML = '';
            tbody.innerHTML = '<tr><td>No data</td></tr>';
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

function loadWallpapers() {
    var grid = document.getElementById('wallpaperGrid');
    if (!grid) return;
    
    var currentWallpaper = localStorage.getItem('srms_wallpaper') || 'none';
    
    var html = '';
    for (var key in WALLPAPER_DATA) {
        var wallpaper = WALLPAPER_DATA[key];
        var isActive = key === currentWallpaper ? ' active' : '';
        var previewStyle = wallpaper.type === 'gradient' ? 'background:' + wallpaper.css + ';' : 'background-image:url("' + wallpaper.url.replace('w=1920', 'w=400') + '");';
        
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
window.addClass = addClass;
window.loadTerms = loadTerms;
window.addTerm = addTerm;
window.loadAuditLog = loadAuditLog;
window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
window.saveSchoolInfo = saveSchoolInfo;
window.loadUsersForSettings = loadUsersForSettings;
window.addUser = addUser;
window.deleteUser = deleteUser;
window.loadDatabaseTables = loadDatabaseTables;
window.loadDatabaseTable = loadDatabaseTable;
window.loadWallpapers = loadWallpapers;
window.selectWallpaper = selectWallpaper;