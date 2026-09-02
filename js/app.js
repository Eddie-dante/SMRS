// ============================================
// SRMS - Complete Application Logic
// With QR Scanning, Class Storage, Fee Editing
// Timetable per Class/Teacher, Filtered Audit Log
// ============================================

var selectedChatUser = null;
var currentChatUserEmail = null;
var currentChatUserName = null;
var unreadMessagesCount = 0;
var messageCheckInterval = null;
var bulkFurnitureClass = null;
var bulkBookClass = null;
var currentNoteId = null;
var currentEditingFeeId = null;
var scannedQRId = null;
var scannedQRCode = null;

document.addEventListener('DOMContentLoaded', function() {
    var user = checkAuth();
    if (!user) return;
    
    var page = window.location.pathname.split('/').pop();
    loadPageData(page);
    startMessageChecking();
    initDropdownController();
});

// ============ DROPDOWN CONTROLLER ============
function initDropdownController() {
    var navGroups = document.querySelectorAll('.nav-group');
    
    navGroups.forEach(function(group) {
        var dropdown = group.querySelector('.dropdown-menu');
        var button = group.querySelector('.classy-btn');
        
        if (!dropdown || !button) return;
        
        var closeTimeout = null;
        
        function openDropdown() {
            if (closeTimeout) { clearTimeout(closeTimeout); closeTimeout = null; }
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
        
        group.addEventListener('mouseenter', openDropdown);
        group.addEventListener('mouseleave', closeDropdownDelayed);
        dropdown.addEventListener('mouseenter', openDropdown);
        dropdown.addEventListener('mouseleave', closeDropdownDelayed);
        
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
            break;
        case 'timetable.html':
            loadTimetable();
            loadTimetableClasses();
            loadTeachersForTimetable();
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
        case 'qrcodes.html':
            loadQRCodeList();
            break;
    }
}

// ============ AUDIT LOGGING (Filtered) ============
function logAction(action, details) {
    var school = getCurrentSchool();
    var user = getCurrentUser();
    if (!school || !user) return;
    
    // Filter out unnecessary actions
    var skipActions = ['Page Visit', 'Message Check', 'Wallpaper Applied'];
    if (skipActions.indexOf(action) !== -1) {
        return;
    }
    
    API.addAuditLog(school, {
        user: user.name,
        userEmail: user.email,
        action: action,
        details: details
    }).then(function(result) {
        if (result.skipped) {
            console.log('Audit skipped (unnecessary):', action);
        } else if (result.success) {
            console.log('Audit logged:', action);
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
    
    API.getStudents(school).then(function(dbStudents) {
        API.getClasses(school).then(function(classes) {
            var allStudents = [];
            var seenAdms = {};
            
            for (var i = 0; i < dbStudents.length; i++) {
                var adm = dbStudents[i].adm || '';
                if (adm && !seenAdms[adm]) {
                    seenAdms[adm] = true;
                    allStudents.push(dbStudents[i]);
                }
            }
            
            for (var i = 0; i < classes.length; i++) {
                var classStudents = classes[i].students || [];
                for (var j = 0; j < classStudents.length; j++) {
                    var student = classStudents[j];
                    var adm = student.ADM || student.adm || student['ADM No'] || '';
                    var name = student.Name || student.name || student['Full Name'] || 'Unknown';
                    
                    if (adm && !seenAdms[adm]) {
                        seenAdms[adm] = true;
                        allStudents.push({
                            name: name,
                            adm: adm,
                            form: classes[i].name || '',
                            stream: classes[i].stream || '',
                            gender: student.Gender || student.gender || '',
                            parentName: student['Parent Name'] || '',
                            parentPhone: student['Parent Phone'] || '',
                            parentEmail: student['Parent Email'] || ''
                        });
                    }
                }
            }
            
            displayStudents(allStudents);
        });
    });
}

function displayStudents(students) {
    var tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students found.</td></tr>';
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
        var totalBooks = 0, availableBooks = 0;
        for (var i = 0; i < books.length; i++) {
            totalBooks += books[i].quantity || 0;
            availableBooks += books[i].available || 0;
        }
        animateNumber('totalBooks', totalBooks);
        animateNumber('availableBooks', availableBooks);
    });
    
    API.getStudents(school).then(function(dbStudents) {
        API.getClasses(school).then(function(classes) {
            var totalStudents = dbStudents.length;
            var seenAdms = {};
            for (var i = 0; i < dbStudents.length; i++) seenAdms[dbStudents[i].adm] = true;
            for (var i = 0; i < classes.length; i++) {
                var classStudents = classes[i].students || [];
                for (var j = 0; j < classStudents.length; j++) {
                    var adm = classStudents[j].ADM || classStudents[j].adm || '';
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
        var activeLoans = 0, overdueBooks = 0;
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
        animateNumber('activeFurniture', furniture.length);
    });
    
    API.getTeachers(school).then(function(teachers) {
        var el = document.getElementById('totalTeachersStat');
        if (el) el.textContent = teachers.length;
    });
    
    API.getClasses(school).then(function(classes) {
        var el = document.getElementById('totalClassesStat');
        if (el) el.textContent = classes.length;
    });
    
    API.getEvents(school).then(function(events) {
        var today = new Date().toISOString().split('T')[0];
        var upcoming = 0;
        for (var i = 0; i < events.length; i++) {
            if (events[i].eventDate >= today) upcoming++;
        }
        var el = document.getElementById('upcomingEventsStat');
        if (el) el.textContent = upcoming;
    });
    
    API.getFees(school).then(function(fees) {
        var totalBalance = 0;
        for (var i = 0; i < fees.length; i++) totalBalance += fees[i].balance || 0;
        var el = document.getElementById('outstandingFeesStat');
        if (el) el.textContent = 'KES ' + formatNumber(totalBalance);
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
                time: borrowed[i].createdAt
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
                time: furniture[i].createdAt
            });
        }
        displayActivities(activities);
    });
}

function displayActivities(activities) {
    var activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    activities.sort(function(a, b) { return new Date(b.time) - new Date(a.time); });
    
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

// ============ QR CODE OPERATIONS ============
function loadQRCodeList() {
    var school = getCurrentSchool();
    API.getQRCodes(school).then(function(codes) {
        var container = document.getElementById('qrCodeList');
        if (!container) return;
        
        if (codes.length === 0) {
            container.innerHTML = '<p style="text-align:center;">No QR codes generated yet</p>';
            return;
        }
        
        var html = '<table class="data-table"><thead><tr><th>Code</th><th>Type</th><th>Status</th><th>Assigned To</th><th>Class</th><th>ADM</th></tr></thead><tbody>';
        for (var i = 0; i < codes.length; i++) {
            var status = codes[i].returned ? 'Returned' : (codes[i].assigned ? 'Assigned' : 'Available');
            var badgeClass = codes[i].returned ? 'badge-success' : (codes[i].assigned ? 'badge-warning' : 'badge-info');
            html += '<tr>' +
                '<td><strong>' + codes[i].code + '</strong></td>' +
                '<td>' + codes[i].type + '</td>' +
                '<td><span class="badge ' + badgeClass + '">' + status + '</span></td>' +
                '<td>' + (codes[i].assignedTo || '-') + '</td>' +
                '<td>' + (codes[i].className || '-') + '</td>' +
                '<td>' + (codes[i].adm || '-') + '</td>' +
                '</tr>';
        }
        html += '</tbody></table>';
        container.innerHTML = html;
    });
}

function generateQRCodes() {
    var school = getCurrentSchool();
    var type = document.getElementById('qrType').value;
    var start = parseInt(document.getElementById('qrStart').value);
    var end = parseInt(document.getElementById('qrEnd').value);
    var container = document.getElementById('qrContainer');
    
    API.generateQRCodes(school, type, start, end).then(function(result) {
        if (result.success) {
            showNotification('Generated ' + result.codes.length + ' unique QR codes!', 'success');
            logAction('QR Code Generated', result.codes.length + ' codes');
            
            // Display generated codes
            var html = '';
            for (var i = 0; i < result.codes.length; i++) {
                html += '<div class="qr-item">' +
                    '<div class="qr-placeholder"><i class="fas fa-qrcode"></i></div>' +
                    '<p>' + result.codes[i] + '</p>' +
                    '</div>';
            }
            container.innerHTML = html;
            
            loadQRCodeList();
        }
    });
}

function handleScannedQRCode(code) {
    var school = getCurrentSchool();
    
    API.scanQRCode(school, code).then(function(result) {
        if (!result.success) {
            showNotification(result.error, 'error');
            return;
        }
        
        if (result.status === 'assigned') {
            // Show already assigned dialog
            scannedQRId = result.id;
            scannedQRCode = code;
            
            var modal = document.createElement('div');
            modal.className = 'modal active';
            modal.id = 'assignedQRModal';
            modal.innerHTML = '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<h3><i class="fas fa-exclamation-triangle" style="color:#ffc107;"></i> Code Already Assigned</h3>' +
                '<button class="modal-close" onclick="closeModal(\'assignedQRModal\')"><i class="fas fa-times"></i></button>' +
                '</div>' +
                '<p>This code is already assigned to:</p>' +
                '<p style="font-size:1.2em;font-weight:700;color:#d4af37;">' + result.qr.assignedTo + '</p>' +
                '<p>Class: ' + (result.qr.className || '-') + '</p>' +
                '<p>ADM: ' + (result.qr.adm || '-') + '</p>' +
                '<button class="btn btn-primary" style="width:100%;margin-top:15px;" onclick="returnScannedQR()">' +
                '<i class="fas fa-undo"></i> Return This Item' +
                '</button>' +
                '</div>';
            document.body.appendChild(modal);
        } else {
            // Available - show borrow form
            scannedQRId = result.id;
            scannedQRCode = code;
            
            var modal = document.createElement('div');
            modal.className = 'modal active';
            modal.id = 'borrowQRModal';
            modal.innerHTML = '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<h3><i class="fas fa-book"></i> Borrow Form - ' + code + '</h3>' +
                '<button class="modal-close" onclick="closeModal(\'borrowQRModal\')"><i class="fas fa-times"></i></button>' +
                '</div>' +
                '<form onsubmit="return assignScannedQR(event)">' +
                '<div class="form-group"><label>Student Name *</label><input type="text" id="scannedStudentName" required></div>' +
                '<div class="form-row">' +
                '<div class="form-group"><label>Class</label><input type="text" id="scannedClassName" placeholder="e.g., Form 1"></div>' +
                '<div class="form-group"><label>Stream</label><input type="text" id="scannedStream" placeholder="e.g., East"></div>' +
                '</div>' +
                '<div class="form-group"><label>ADM Number *</label><input type="text" id="scannedADM" required></div>' +
                '<button type="submit" class="btn btn-primary" style="width:100%;"><i class="fas fa-check"></i> Assign</button>' +
                '</form>' +
                '</div>';
            document.body.appendChild(modal);
        }
    });
}

function assignScannedQR(event) {
    event.preventDefault();
    var school = getCurrentSchool();
    
    API.assignQRCode(school, scannedQRId, {
        studentName: document.getElementById('scannedStudentName').value,
        className: document.getElementById('scannedClassName').value,
        stream: document.getElementById('scannedStream').value,
        adm: document.getElementById('scannedADM').value
    }).then(function(result) {
        if (result.success) {
            showNotification('QR code assigned!', 'success');
            logAction('QR Code Assigned', scannedQRCode);
            closeModal('borrowQRModal');
            loadQRCodeList();
        }
    });
    return false;
}

function returnScannedQR() {
    var school = getCurrentSchool();
    
    if (!confirm('Return this item? The record will be deleted.')) return;
    
    API.returnQRCode(school, scannedQRId).then(function(result) {
        if (result.success) {
            showNotification('Item returned! Record deleted.', 'success');
            logAction('QR Code Returned', scannedQRCode);
            closeModal('assignedQRModal');
            loadQRCodeList();
        }
    });
}

// ============ LIBRARY ============
function loadBooks() {
    var school = getCurrentSchool();
    API.getBooks(school).then(function(books) {
        var tbody = document.getElementById('booksTableBody');
        if (!tbody) return;
        
        if (books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No books</td></tr>';
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

function returnBook(borrowId) {
    if (!confirm('Return this book? The record will be deleted.')) return;
    var school = getCurrentSchool();
    API.returnBook(school, borrowId).then(function(result) {
        if (result.success) {
            showNotification('Book returned! Record deleted.', 'success');
            logAction('Book Returned', borrowId);
            loadBooks();
            loadActiveReturns();
            loadAllBorrowed();
        }
    });
}

// ============ FEES ============
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
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No fee records</td></tr>';
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
                    '<td>' + badge + '</td>' +
                    '<td>' +
                    '<button class="btn btn-sm btn-primary" onclick="editFee(\'' + fees[i].id + '\')"><i class="fas fa-edit"></i></button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="deleteFee(\'' + fees[i].id + '\')"><i class="fas fa-trash"></i></button>' +
                    '</td>' +
                    '</tr>';
            }
            tbody.innerHTML = html;
        }
        
        var totalFees = 0, totalPaid = 0, totalBalance = 0;
        for (var i = 0; i < fees.length; i++) {
            totalFees += fees[i].amount || 0;
            totalPaid += fees[i].paid || 0;
            totalBalance += fees[i].balance || 0;
        }
        
        if (document.getElementById('totalFeesAmount')) document.getElementById('totalFeesAmount').textContent = formatCurrency(totalFees);
        if (document.getElementById('totalPaidAmount')) document.getElementById('totalPaidAmount').textContent = formatCurrency(totalPaid);
        if (document.getElementById('totalBalanceAmount')) document.getElementById('totalBalanceAmount').textContent = formatCurrency(totalBalance);
    });
}

function editFee(feeId) {
    var school = getCurrentSchool();
    API.getFees(school).then(function(fees) {
        for (var i = 0; i < fees.length; i++) {
            if (fees[i].id === feeId) {
                currentEditingFeeId = feeId;
                document.getElementById('feeStudent').value = fees[i].studentAdm;
                document.getElementById('feeAmount').value = fees[i].amount;
                document.getElementById('feePaid').value = fees[i].paid;
                document.getElementById('feeTerm').value = fees[i].term;
                
                var saveBtn = document.getElementById('saveFeeBtn');
                if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save"></i> Update Fee';
                break;
            }
        }
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
    
    var select = document.getElementById('feeStudent');
    var studentName = select.options[select.selectedIndex].text.split(' (')[0];
    
    API.saveFee(school, {
        id: currentEditingFeeId,
        studentAdm: studentAdm,
        studentName: studentName,
        amount: parseFloat(document.getElementById('feeAmount').value) || 0,
        paid: parseFloat(document.getElementById('feePaid').value) || 0,
        term: document.getElementById('feeTerm').value || 'Term 1'
    }).then(function(result) {
        if (result.success) {
            showNotification(currentEditingFeeId ? 'Fee updated!' : 'Fee saved!', 'success');
            logAction(currentEditingFeeId ? 'Fee Updated' : 'Fee Recorded', studentName);
            currentEditingFeeId = null;
            var saveBtn = document.getElementById('saveFeeBtn');
            if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Fee';
            loadFees();
        }
    });
    return false;
}

function deleteFee(feeId) {
    if (!confirm('Delete this fee record?')) return;
    var school = getCurrentSchool();
    API.deleteFee(school, feeId).then(function(result) {
        if (result.success) {
            showNotification('Fee deleted!', 'success');
            logAction('Fee Deleted', feeId);
            loadFees();
        }
    });
}

// ============ CLASSES ============
function loadClasses() {
    var school = getCurrentSchool();
    var user = getCurrentUser();
    API.getClasses(school).then(function(classes) {
        var container = document.getElementById('classesList');
        if (!container) return;
        
        if (classes.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No classes yet</p>';
            return;
        }
        
        var html = '';
        for (var i = 0; i < classes.length; i++) {
            var studentCount = classes[i].students ? classes[i].students.length : 0;
            var deleteBtn = '';
            if (user && user.role === 'admin') {
                deleteBtn = '<button class="btn btn-sm btn-danger" onclick="deleteClass(\'' + classes[i].id + '\')"><i class="fas fa-trash"></i> Delete</button>';
            }
            html += '<div class="class-card">' +
                '<h4>' + classes[i].name + ' ' + (classes[i].stream || '') + '</h4>' +
                '<p>' + studentCount + ' students</p>' +
                '<p>Teacher: ' + (classes[i].teacher || 'Not assigned') + '</p>' +
                '<div style="display:flex;gap:8px;margin-top:10px;">' +
                '<button class="btn btn-sm btn-primary" onclick="viewClassStudents(\'' + classes[i].id + '\')"><i class="fas fa-eye"></i> View</button> ' +
                deleteBtn +
                '</div>' +
                '</div>';
        }
        container.innerHTML = html;
    });
}

function deleteClass(classId) {
    if (!confirm('Delete this class? This will remove all students in this class.')) return;
    var school = getCurrentSchool();
    API.deleteClass(school, classId).then(function(result) {
        if (result.success) {
            showNotification('Class deleted!', 'success');
            logAction('Class Deleted', classId);
            loadClasses();
        }
    });
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

function loadTeachersForTimetable() {
    var school = getCurrentSchool();
    API.getTeachers(school).then(function(teachers) {
        var select = document.getElementById('ttTeacher');
        if (!select) return;
        
        var html = '';
        for (var i = 0; i < teachers.length; i++) {
            html += '<option value="' + teachers[i].name + '">' + teachers[i].name + '</option>';
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
            logAction('Timetable Added', document.getElementById('ttSubject').value);
            loadTimetable();
        }
    });
    return false;
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
        document.getElementById('furnitureCount').textContent = furniture.length;
        
        createBooksByTypeChart(books);
        createStudentsByFormChart(students);
        createFurnitureChart(furniture);
        createBorrowingTrendChart(borrowed);
    });
}

function printReport() {
    window.print();
}

// ============ WALLPAPER ============
function loadWallpapers() {
    var grid = document.getElementById('wallpaperGrid');
    if (!grid) return;
    
    var currentWallpaper = localStorage.getItem('srms_wallpaper') || 'library';
    
    var html = '';
    for (var key in WALLPAPER_DATA) {
        var wallpaper = WALLPAPER_DATA[key];
        var isActive = key === currentWallpaper ? ' active' : '';
        
        var previewStyle = '';
        if (wallpaper.type === 'gradient') {
            previewStyle = 'background:' + wallpaper.css + ';';
        } else {
            var thumbUrl = wallpaper.url.replace('w=1920', 'w=400&h=250&fit=crop&q=60');
            previewStyle = 'background-image:url("' + thumbUrl + '");background-size:cover;background-position:center;';
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
window.loadStudentsFromClasses = loadStudentsFromClasses;
window.addStudent = addStudent;
window.deleteStudent = deleteStudent;
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
window.deleteNote = deleteNote;
window.loadEvents = loadEvents;
window.addEvent = addEvent;
window.loadFees = loadFees;
window.saveFee = saveFee;
window.editFee = editFee;
window.deleteFee = deleteFee;
window.loadTimetable = loadTimetable;
window.loadTimetableClasses = loadTimetableClasses;
window.loadTeachersForTimetable = loadTeachersForTimetable;
window.addTimetableEntry = addTimetableEntry;
window.loadTeachers = loadTeachers;
window.addTeacher = addTeacher;
window.deleteTeacher = deleteTeacher;
window.loadClasses = loadClasses;
window.addClassWithExcel = addClassWithExcel;
window.handleExcelUpload = handleExcelUpload;
window.viewClassStudents = viewClassStudents;
window.deleteClass = deleteClass;
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
window.loadQRCodeList = loadQRCodeList;
window.generateQRCodes = generateQRCodes;
window.handleScannedQRCode = handleScannedQRCode;
window.assignScannedQR = assignScannedQR;
window.returnScannedQR = returnScannedQR;
window.printReport = printReport;