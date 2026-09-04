// ============================================
// SRMS - Complete Application Logic
// Full Version - 100% Working
// ============================================

// ============ GLOBAL VARIABLES ============
var currentChatUserEmail = null;
var currentChatUserName = null;
var unreadMessagesCount = 0;
var messageCheckInterval = null;
var currentNoteId = null;
var currentEditingFeeId = null;
var allNotesCache = [];
var allStudentsCache = [];
var allQRCodesCache = [];
var isAppInitialized = false;

// ============ INITIALIZATION ============
document.addEventListener("DOMContentLoaded", function() {
  if (isAppInitialized) return;
  isAppInitialized = true;
  
  var user = checkAuth();
  if (!user) return;

  var page = window.location.pathname.split("/").pop() || "dashboard.html";
  
  // Fix for pages in subdirectories
  if (page === "") {
    page = "dashboard.html";
  }

  // Initialize dropdowns
  initDropdownController();

  // Load page data
  setTimeout(function() {
    loadPageData(page);
  }, 300);

  // Start message checking
  setTimeout(function() {
    checkUnreadMessages();
    if (messageCheckInterval) clearInterval(messageCheckInterval);
    messageCheckInterval = setInterval(checkUnreadMessages, 30000);
  }, 3000);
});

// ============ DROPDOWN CONTROLLER ============
function initDropdownController() {
  var navGroups = document.querySelectorAll(".nav-group");
  
  navGroups.forEach(function(group) {
    var dropdown = group.querySelector(".dropdown-menu");
    var button = group.querySelector(".classy-btn");
    
    if (!dropdown || !button) return;

    var closeTimeout = null;

    function openDropdown() {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      document.querySelectorAll(".dropdown-menu.open").forEach(function(d) {
        if (d !== dropdown) d.classList.remove("open");
      });
      dropdown.classList.add("open");
    }

    function closeDropdownDelayed() {
      closeTimeout = setTimeout(function() {
        dropdown.classList.remove("open");
      }, 300);
    }

    // Clean up old listeners by cloning
    var newGroup = group.cloneNode(true);
    group.parentNode.replaceChild(newGroup, group);
    
    var newDropdown = newGroup.querySelector(".dropdown-menu");
    var newButton = newGroup.querySelector(".classy-btn");
    
    if (!newDropdown || !newButton) return;

    newGroup.addEventListener("mouseenter", openDropdown);
    newGroup.addEventListener("mouseleave", closeDropdownDelayed);
    newDropdown.addEventListener("mouseenter", openDropdown);
    newDropdown.addEventListener("mouseleave", closeDropdownDelayed);

    newButton.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (newDropdown.classList.contains("open")) {
        newDropdown.classList.remove("open");
      } else {
        openDropdown();
      }
    });
  });

  document.addEventListener("click", function(event) {
    if (!event.target.closest(".nav-group")) {
      document.querySelectorAll(".dropdown-menu.open").forEach(function(d) {
        d.classList.remove("open");
      });
    }
  });
}

// ============ PAGE ROUTER ============
function loadPageData(page) {
  switch (page) {
    case "dashboard.html":
      loadDashboardData();
      break;
    case "library.html":
      loadLibraryData();
      break;
    case "students.html":
      loadStudentsData();
      break;
    case "studentsids.html":
      // StudentsIDs.html loads its own data
      break;
    case "furniture.html":
      loadFurnitureData();
      break;
    case "chat.html":
      loadChatUsers();
      break;
    case "forum.html":
      loadForumMessages();
      break;
    case "notepad.html":
      loadNotes();
      break;
    case "events.html":
      loadEvents();
      break;
    case "fees.html":
      loadFeesData();
      break;
    case "timetable.html":
      loadTimetableData();
      break;
    case "teachers.html":
      loadTeachersData();
      break;
    case "classes.html":
      loadClassesData();
      break;
    case "terms.html":
      loadTerms();
      break;
    case "auditlog.html":
      loadAuditLog();
      break;
    case "reports.html":
      loadReports();
      break;
    case "settings.html":
      loadSettingsData();
      break;
    case "database.html":
      loadDatabaseTables();
      break;
    case "qrcodes.html":
      loadQRCodeList();
      break;
    case "wallpaper.html":
      // Wallpaper loads itself
      break;
    case "landing.html":
      // Landing page loads itself
      break;
    case "index.html":
      // Login page loads itself
      break;
    default:
      // If on dashboard or unknown page, try to load dashboard data
      if (document.getElementById("welcomeUserName")) {
        loadDashboardData();
      }
      break;
  }
}

// ============ AUDIT LOGGING ============
function logAction(action, details) {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  var skipActions = ["Page Visit", "Message Check", "Wallpaper Applied", "Search", "Filter"];
  if (skipActions.indexOf(action) !== -1) return;

  API.addAuditLog(school, {
    user: user.name,
    userEmail: user.email,
    action: action,
    details: details
  });
}

// ============ MESSAGE NOTIFICATIONS ============
function checkUnreadMessages() {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  API.getChatMessages(school, user.email, user.email).then(function(messages) {
    unreadMessagesCount = messages ? messages.length : 0;
    var badges = document.querySelectorAll(".message-badge, #communicationBadge");
    badges.forEach(function(badge) {
      if (unreadMessagesCount > 0) {
        badge.textContent = unreadMessagesCount;
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    });
  }).catch(function() {
    // Silently fail
  });
}

// ============ DASHBOARD ============
function loadDashboardData() {
  var school = getCurrentSchool();
  if (!school) {
    var user = getCurrentUser();
    if (user && user.school) {
      localStorage.setItem("srms_school", user.school);
      school = user.school;
    } else {
      return;
    }
  }

  var user = getCurrentUser();
  if (user) {
    var nameEl = document.getElementById("welcomeUserName");
    var roleEl = document.getElementById("welcomeUserRole");
    var schoolEl = document.getElementById("welcomeSchoolName");
    var dateEl = document.getElementById("dateDisplay");
    
    if (nameEl) nameEl.textContent = user.name || "User";
    if (roleEl) roleEl.textContent = user.role || "Role";
    if (schoolEl) schoolEl.textContent = school;
    if (dateEl) dateEl.textContent = getDateDisplay();

    if (user.role === "admin") {
      API.getSchool(school).then(function(schoolInfo) {
        if (schoolInfo && schoolInfo.inviteCode) {
          var codeEl = document.getElementById("inviteCode");
          var bannerEl = document.getElementById("inviteCodeBanner");
          if (codeEl) codeEl.textContent = schoolInfo.inviteCode;
          if (bannerEl) bannerEl.style.display = "block";
        }
      });
    }
  }

  // Load all data in parallel
  Promise.all([
    API.getBooks(school),
    API.getStudents(school),
    API.getBorrowed(school),
    API.getFurniture(school),
    API.getTeachers(school),
    API.getClasses(school),
    API.getEvents(school),
    API.getFees(school)
  ]).then(function(results) {
    var books = results[0] || [];
    var students = results[1] || [];
    var borrowed = results[2] || [];
    var furniture = results[3] || [];
    var teachers = results[4] || [];
    var classes = results[5] || [];
    var events = results[6] || [];
    var fees = results[7] || [];

    // Update stats
    var totalBooks = books.reduce(function(s, b) { return s + (b.quantity || 0); }, 0);
    var availableBooks = books.reduce(function(s, b) { return s + (b.available || 0); }, 0);
    animateNumber("totalBooks", totalBooks);
    animateNumber("availableBooks", availableBooks);

    var totalStudents = students.length;
    var seenAdms = {};
    students.forEach(function(s) { if (s.adm) seenAdms[s.adm] = true; });
    classes.forEach(function(c) {
      (c.students || []).forEach(function(st) {
        var adm = st.ADM || st.adm || "";
        if (adm && !seenAdms[adm]) {
          seenAdms[adm] = true;
          totalStudents++;
        }
      });
    });
    animateNumber("totalStudents", totalStudents);

    var activeLoans = borrowed.filter(function(b) { return !b.returned; });
    animateNumber("activeLoans", activeLoans.length);
    
    var overdue = activeLoans.filter(function(b) { return isOverdue(b.returnDate); });
    animateNumber("overdueBooks", overdue.length);
    animateNumber("activeFurniture", furniture.length);

    var teachersStat = document.getElementById("totalTeachersStat");
    var classesStat = document.getElementById("totalClassesStat");
    if (teachersStat) teachersStat.textContent = teachers.length;
    if (classesStat) classesStat.textContent = classes.length;

    var today = new Date().toISOString().split("T")[0];
    var upcomingEvents = events.filter(function(e) { return e.eventDate >= today; });
    var upcomingEl = document.getElementById("upcomingEventsStat");
    if (upcomingEl) upcomingEl.textContent = upcomingEvents.length;

    var totalBalance = fees.reduce(function(s, f) { return s + (f.balance || 0); }, 0);
    var outstandingEl = document.getElementById("outstandingFeesStat");
    if (outstandingEl) outstandingEl.textContent = "KES " + formatNumber(totalBalance);

    displayRecentActivity(borrowed, furniture);
  }).catch(function(err) {
    console.error("Dashboard data error:", err);
    var recentEl = document.getElementById("recentActivity");
    if (recentEl) {
      recentEl.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Could not load activity</p></div>';
    }
  });
}

function displayRecentActivity(borrowed, furniture) {
  var activityList = document.getElementById("recentActivity");
  if (!activityList) return;

  var activities = [];

  (borrowed || []).slice(0, 10).forEach(function(b) {
    activities.push({
      icon: "fa-book",
      color: "rgba(233, 69, 96, 0.2)",
      text: "<strong>" + (b.studentName || 'Unknown') + '</strong> borrowed "' + (b.bookTitle || '') + '"',
      time: b.createdAt || new Date().toISOString()
    });
  });

  (furniture || []).slice(0, 10).forEach(function(f) {
    activities.push({
      icon: "fa-chair",
      color: "rgba(255, 193, 7, 0.2)",
      text: "<strong>" + (f.studentName || 'Unknown') + "</strong> allocated " + (f.chairNo || ''),
      time: f.createdAt || new Date().toISOString()
    });
  });

  activities.sort(function(a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  activities = activities.slice(0, 8);

  if (activities.length === 0) {
    activityList.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No recent activity</p></div>';
    return;
  }

  var html = "";
  activities.forEach(function(a) {
    html += '<div class="activity-item">' +
      '<div class="activity-icon" style="background:' + a.color + ';"><i class="fas ' + a.icon + '"></i></div>' +
      '<div><div class="activity-text">' + a.text + '</div>' +
      '<div class="activity-time">' + formatDateTime(a.time) + '</div></div>' +
      '</div>';
  });
  activityList.innerHTML = html;
}

// ============ ANIMATE NUMBER ============
function animateNumber(elementId, targetValue) {
  var element = document.getElementById(elementId);
  if (!element) return;

  var startValue = parseInt(element.textContent) || 0;
  var duration = 600;
  var startTime = performance.now();

  function update(currentTime) {
    var elapsed = currentTime - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var currentValue = Math.round(startValue + (targetValue - startValue) * eased);
    element.textContent = currentValue;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ============ LIBRARY ============
function loadLibraryData() {
  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([
    API.getBooks(school),
    API.getBorrowed(school),
    API.getClasses(school)
  ]).then(function(results) {
    var books = results[0] || [];
    var borrowed = results[1] || [];
    var classes = results[2] || [];

    // Books table
    var booksTbody = document.getElementById("booksTableBody");
    if (booksTbody) {
      if (books.length === 0) {
        booksTbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No books in catalog</td></tr>';
      } else {
        var booksHtml = "";
        books.forEach(function(b) {
          booksHtml += "<tr><td>" + (b.title || '-') + "</td><td>" + (b.author || '-') + "</td><td>" + (b.type || '-') + "</td><td>" + (b.subject || '-') + "</td><td>" + (b.quantity || 0) + "</td><td>" + (b.available || 0) + '</td><td><button class="btn btn-sm btn-danger" onclick="deleteBook(\'' + b.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
        });
        booksTbody.innerHTML = booksHtml;
      }

      // Populate book selects
      var select = document.getElementById("issueBookTitle");
      if (select) {
        var selectHtml = '<option value="">Select Book</option>';
        books.forEach(function(b) {
          if (b.available > 0) selectHtml += '<option value="' + b.title + '">' + b.title + " (" + b.available + ")</option>";
        });
        select.innerHTML = selectHtml;
      }

      var bulkSelect = document.getElementById("bulkBookTitle");
      if (bulkSelect) {
        var bulkHtml = '<option value="">Select Book</option>';
        books.forEach(function(b) {
          if (b.available > 0) bulkHtml += '<option value="' + b.title + '">' + b.title + " (" + b.available + ")</option>";
        });
        bulkSelect.innerHTML = bulkHtml;
      }
    }

    // Returns table
    var returnsTbody = document.getElementById("returnsTableBody");
    if (returnsTbody) {
      var active = borrowed.filter(function(b) { return !b.returned; });
      if (active.length === 0) {
        returnsTbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No active loans</td></tr>';
      } else {
        var returnsHtml = "";
        active.forEach(function(b) {
          var overdue = isOverdue(b.returnDate);
          var badge = overdue ? '<span class="badge badge-danger">Overdue</span>' : '<span class="badge badge-success">Active</span>';
          returnsHtml += "<tr><td>" + (b.studentName || '-') + "</td><td>" + (b.adm || '-') + "</td><td>" + (b.bookTitle || '-') + "</td><td>" + (b.bookNo || '-') + "</td><td>" + (b.returnDate || '-') + "</td><td>" + badge + '</td><td><button class="btn btn-sm btn-success" onclick="returnBook(\'' + b.id + '\')"><i class="fas fa-undo"></i> Return</button></td></tr>';
        });
        returnsTbody.innerHTML = returnsHtml;
      }
    }

    // Borrowed history
    var borrowedTbody = document.getElementById("borrowedTableBody");
    if (borrowedTbody) {
      if (borrowed.length === 0) {
        borrowedTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No records</td></tr>';
      } else {
        var borrowedHtml = "";
        borrowed.forEach(function(b) {
          var status = b.returned ? '<span class="badge badge-success">Returned</span>' : '<span class="badge badge-warning">Active</span>';
          borrowedHtml += "<tr><td>" + (b.studentName || '-') + "</td><td>" + (b.bookTitle || '-') + "</td><td>" + (b.borrowDate || '-') + "</td><td>" + (b.returnDate || '-') + "</td><td>" + status + "</td></tr>";
        });
        borrowedTbody.innerHTML = borrowedHtml;
      }
    }

    // Bulk book classes
    var bulkClassSelect = document.getElementById("bulkBookClass");
    if (bulkClassSelect) {
      var classHtml = '<option value="">Select Class</option>';
      classes.forEach(function(c) {
        classHtml += '<option value="' + c.id + '">' + (c.name || '') + " " + (c.stream || '') + " (" + (c.students ? c.students.length : 0) + ")</option>";
      });
      bulkClassSelect.innerHTML = classHtml;
    }
  }).catch(function(err) {
    console.error("Library data error:", err);
  });
}

function addBook(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var title = document.getElementById("bookTitle");
  if (!title || !title.value) {
    showNotification("Book title is required", "warning");
    return false;
  }

  API.addBook(school, {
    title: title.value,
    author: document.getElementById("bookAuthor") ? document.getElementById("bookAuthor").value : "",
    type: document.getElementById("bookType") ? document.getElementById("bookType").value : "Textbook",
    subject: document.getElementById("bookSubject") ? document.getElementById("bookSubject").value : "",
    quantity: parseInt(document.getElementById("bookQuantity") ? document.getElementById("bookQuantity").value : 1),
    createdBy: user ? user.name : ""
  }).then(function(result) {
    if (result.success) {
      showNotification("Book added!", "success");
      logAction("Book Added", title.value);
      closeModal("addBookModal");
      if (document.getElementById("addBookForm")) document.getElementById("addBookForm").reset();
      loadLibraryData();
    }
  });
  return false;
}

function issueBook(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var studentName = document.getElementById("issueStudentName");
  var adm = document.getElementById("issueADM");
  var bookTitle = document.getElementById("issueBookTitle");
  var bookNo = document.getElementById("issueBookNumber");

  if (!studentName || !studentName.value || !adm || !adm.value || !bookTitle || !bookTitle.value || !bookNo || !bookNo.value) {
    showNotification("Please fill in all required fields", "warning");
    return false;
  }

  API.issueBook(school, {
    studentName: studentName.value,
    adm: adm.value,
    bookTitle: bookTitle.value,
    bookNo: bookNo.value,
    borrowDate: document.getElementById("issueBorrowDate") ? document.getElementById("issueBorrowDate").value : getCurrentDate(),
    returnDate: document.getElementById("issueReturnDate") ? document.getElementById("issueReturnDate").value : addDays(getCurrentDate(), 14),
    issuedBy: user ? user.name : ""
  }).then(function(result) {
    if (result.success) {
      showNotification("Book issued!", "success");
      logAction("Book Issued", bookTitle.value);
      if (document.getElementById("issueBookForm")) document.getElementById("issueBookForm").reset();
      loadLibraryData();
    }
  });
  return false;
}

function returnBook(borrowId) {
  if (!borrowId) return;
  
  DialogSystem.confirm("Return this book? The record will be deleted.", {
    title: "Return Book",
    type: "info",
    confirmText: "Return",
    cancelText: "Cancel"
  }).then(function(confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.returnBook(school, borrowId).then(function(result) {
      if (result.success) {
        showNotification("Book returned!", "success");
        logAction("Book Returned", borrowId);
        loadLibraryData();
      }
    });
  });
}

function deleteBook(bookId) {
  if (!bookId) return;
  
  DialogSystem.confirm("Delete this book?", {
    title: "Delete Book",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel"
  }).then(function(confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.deleteBook(school, bookId).then(function() {
      showNotification("Book deleted!", "success");
      logAction("Book Deleted", bookId);
      loadLibraryData();
    });
  });
}

// ============ BULK BOOK ISSUE ============
function loadClassStudentsForBooks() {
  var school = getCurrentSchool();
  var classId = document.getElementById("bulkBookClass");
  if (!classId || !classId.value) return;

  API.getClasses(school).then(function(classes) {
    var selectedClass = null;
    classes.forEach(function(c) {
      if (c.id === classId.value) selectedClass = c;
    });

    if (selectedClass && selectedClass.students) {
      bulkBookClass = selectedClass;
      var container = document.getElementById("bulkBookStudents");
      if (!container) return;
      
      var html = '<h4 style="color:#d4af37;margin-bottom:15px;">Students (' + selectedClass.students.length + ")</h4>";

      selectedClass.students.forEach(function(student) {
        var name = student.Name || student.name || student["Full Name"] || "Unknown";
        var adm = student.ADM || student.adm || student["ADM No"] || "";

        html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
          '<span style="flex:1;">' + name + " (" + adm + ")</span>" +
          '<input type="text" class="book-number-input" placeholder="Book No" data-adm="' + adm + '" data-name="' + name + '" style="width:120px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">' +
          '</div>';
      });

      html += '<button class="btn btn-primary" style="width:100%;margin-top:15px;" onclick="issueBulkBooks()"><i class="fas fa-book"></i> Issue to All</button>';
      container.innerHTML = html;
    }
  });
}

function issueBulkBooks() {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  var bookTitle = document.getElementById("bulkBookTitle");
  if (!bookTitle || !bookTitle.value) {
    showNotification("Please select a book", "warning");
    return;
  }

  var borrowDate = document.getElementById("bulkBookBorrowDate");
  var returnDate = document.getElementById("bulkBookReturnDate");
  var bDate = borrowDate && borrowDate.value ? borrowDate.value : getCurrentDate();
  var rDate = returnDate && returnDate.value ? returnDate.value : addDays(getCurrentDate(), 14);

  var bookInputs = document.querySelectorAll(".book-number-input");
  var issued = 0;
  var promises = [];

  bookInputs.forEach(function(input) {
    if (input.value) {
      promises.push(
        API.issueBook(school, {
          studentName: input.dataset.name,
          adm: input.dataset.adm,
          form: bulkBookClass ? bulkBookClass.name : "",
          stream: bulkBookClass ? bulkBookClass.stream || "" : "",
          bookTitle: bookTitle.value,
          bookNo: input.value,
          borrowDate: bDate,
          returnDate: rDate,
          issuedBy: user ? user.name : ""
        })
      );
      issued++;
    }
  });

  if (promises.length === 0) {
    showNotification("No book numbers entered", "warning");
    return;
  }

  Promise.all(promises).then(function() {
    showNotification("Issued books to " + issued + " students!", "success");
    logAction("Bulk Book Issue", issued + " students");
    closeModal("bulkBookModal");
    loadLibraryData();
  });
}

// ============ STUDENTS ============
function loadStudentsData() {
  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([API.getStudents(school), API.getClasses(school)]).then(function(results) {
    var students = results[0] || [];
    var classes = results[1] || [];

    var allStudents = [];
    var seenAdms = {};

    students.forEach(function(s) {
      if (s.adm && !seenAdms[s.adm]) {
        seenAdms[s.adm] = true;
        allStudents.push(s);
      }
    });

    classes.forEach(function(c) {
      (c.students || []).forEach(function(st) {
        var adm = st.ADM || st.adm || st["ADM No"] || "";
        var name = st.Name || st.name || st["Full Name"] || "Unknown";
        if (adm && !seenAdms[adm]) {
          seenAdms[adm] = true;
          allStudents.push({
            name: name,
            adm: adm,
            form: c.name,
            stream: c.stream || "",
            gender: st.Gender || st.gender || "",
            parentPhone: st["Parent Phone"] || ""
          });
        }
      });
    });

    allStudentsCache = allStudents;

    var tbody = document.getElementById("studentsTableBody");
    if (tbody) {
      if (allStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students found</td></tr>';
      } else {
        var html = "";
        allStudents.slice(0, 100).forEach(function(s) {
          html += "<tr><td>" + (s.name || '-') + "</td><td>" + (s.adm || '-') + "</td><td>" + (s.form || '-') + "</td><td>" + (s.stream || '-') + "</td><td>" + (s.gender || '-') + "</td><td>" + (s.parentPhone || '-') + '</td><td><button class="btn btn-sm btn-danger" onclick="deleteStudent(\'' + s.adm + '\')"><i class="fas fa-trash"></i></button></td></tr>';
        });
        tbody.innerHTML = html;
      }
    }
  }).catch(function(err) {
    console.error("Students data error:", err);
  });
}

function addStudent(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var name = document.getElementById("studentName");
  var adm = document.getElementById("studentADM");

  if (!name || !name.value || !adm || !adm.value) {
    showNotification("Name and ADM are required", "warning");
    return false;
  }

  API.addStudent(school, {
    name: name.value,
    adm: adm.value,
    form: document.getElementById("studentForm") ? document.getElementById("studentForm").value : "",
    stream: document.getElementById("studentStream") ? document.getElementById("studentStream").value : "",
    gender: document.getElementById("studentGender") ? document.getElementById("studentGender").value : "",
    dob: document.getElementById("studentDOB") ? document.getElementById("studentDOB").value : "",
    parentName: document.getElementById("studentParentName") ? document.getElementById("studentParentName").value : "",
    parentPhone: document.getElementById("studentParentPhone") ? document.getElementById("studentParentPhone").value : "",
    parentEmail: document.getElementById("studentParentEmail") ? document.getElementById("studentParentEmail").value : "",
    addedBy: user ? user.name : ""
  }).then(function(result) {
    if (result.success) {
      showNotification("Student added!", "success");
      logAction("Student Added", name.value);
      closeModal("addStudentModal");
      if (document.getElementById("addStudentForm")) document.getElementById("addStudentForm").reset();
      loadStudentsData();
    }
  });
  return false;
}

function deleteStudent(adm) {
  if (!adm) return;
  
  DialogSystem.confirm("Delete this student?", {
    title: "Delete Student",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel"
  }).then(function(confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.deleteStudent(school, adm).then(function() {
      showNotification("Student deleted!", "success");
      logAction("Student Deleted", adm);
      loadStudentsData();
    });
  });
}

// ============ FURNITURE ============
function loadFurnitureData() {
  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([API.getFurniture(school), API.getClasses(school)]).then(function(results) {
    var furniture = results[0] || [];
    var classes = results[1] || [];

    var totalEl = document.getElementById("totalFurnitureStat");
    var activeEl = document.getElementById("activeFurnitureStat");
    if (totalEl) totalEl.textContent = furniture.length;
    if (activeEl) activeEl.textContent = furniture.length;

    var activeList = document.getElementById("activeFurnitureList");
    if (activeList) {
      if (furniture.length === 0) {
        activeList.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No active allocations</p>';
      } else {
        var html = "";
        furniture.slice(0, 50).forEach(function(f) {
          html += '<div class="furniture-card">' +
            '<span class="status-badge status-active">Active</span>' +
            '<div class="furniture-icon"><i class="fas fa-chair"></i></div>' +
            '<div class="furniture-student-name">' + (f.studentName || '-') + "</div>" +
            '<div class="furniture-adm">' + (f.adm || '-') + "</div>" +
            '<div class="furniture-details">' +
            '<div class="furniture-detail-item"><div class="furniture-detail-label">Chair</div><div class="furniture-detail-value">' + (f.chairNo || '-') + "</div></div>" +
            '<div class="furniture-detail-item"><div class="furniture-detail-label">Locker</div><div class="furniture-detail-value">' + (f.lockerNo || '-') + "</div></div>" +
            "</div>" +
            '<button class="btn-return" onclick="returnFurnitureItem(\'' + f.id + '\')"><i class="fas fa-undo"></i> Return</button>' +
            "</div>";
        });
        activeList.innerHTML = html;
      }
    }

    var allList = document.getElementById("allFurnitureList");
    if (allList) allList.innerHTML = activeList ? activeList.innerHTML : "";

    var bulkClassSelect = document.getElementById("bulkFurnitureClass");
    if (bulkClassSelect) {
      var classHtml = '<option value="">Select Class</option>';
      classes.forEach(function(c) {
        classHtml += '<option value="' + c.id + '">' + (c.name || '') + " " + (c.stream || '') + " (" + (c.students ? c.students.length : 0) + ")</option>";
      });
      bulkClassSelect.innerHTML = classHtml;
    }
  }).catch(function(err) {
    console.error("Furniture data error:", err);
  });
}

function allocateFurniture(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var studentName = document.getElementById("furnitureStudentName");
  var adm = document.getElementById("furnitureADM");
  var chairNo = document.getElementById("chairNumber");

  if (!studentName || !studentName.value || !adm || !adm.value || !chairNo || !chairNo.value) {
    showNotification("Student name, ADM, and Chair number are required", "warning");
    return false;
  }

  API.allocateFurniture(school, {
    studentName: studentName.value,
    adm: adm.value,
    form: document.getElementById("furnitureForm") ? document.getElementById("furnitureForm").value : "",
    stream: document.getElementById("furnitureStream") ? document.getElementById("furnitureStream").value : "",
    chairNo: chairNo.value,
    lockerNo: document.getElementById("lockerNumber") ? document.getElementById("lockerNumber").value : "",
    allocationDate: document.getElementById("furnitureAllocationDate") ? document.getElementById("furnitureAllocationDate").value : getCurrentDate(),
    issuedBy: user ? user.name : ""
  }).then(function(result) {
    if (result.success) {
      showNotification("Furniture allocated!", "success");
      logAction("Furniture Allocated", studentName.value);
      closeModal("allocateModal");
      loadFurnitureData();
    }
  });
  return false;
}

function returnFurnitureItem(furnitureId) {
  if (!furnitureId) return;
  
  DialogSystem.confirm("Return this furniture? The record will be deleted.", {
    title: "Return Furniture",
    type: "info",
    confirmText: "Return",
    cancelText: "Cancel"
  }).then(function(confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.returnFurniture(school, furnitureId).then(function() {
      showNotification("Furniture returned!", "success");
      logAction("Furniture Returned", furnitureId);
      loadFurnitureData();
    });
  });
}

function loadClassStudentsForFurniture() {
  var school = getCurrentSchool();
  var classId = document.getElementById("bulkFurnitureClass");
  if (!classId || !classId.value) return;

  API.getClasses(school).then(function(classes) {
    var selectedClass = null;
    classes.forEach(function(c) {
      if (c.id === classId.value) selectedClass = c;
    });

    if (selectedClass && selectedClass.students) {
      bulkFurnitureClass = selectedClass;
      var container = document.getElementById("bulkFurnitureStudents");
      if (!container) return;
      
      var html = '<h4 style="color:#d4af37;margin-bottom:15px;">Students (' + selectedClass.students.length + ")</h4>";

      selectedClass.students.forEach(function(student) {
        var name = student.Name || student.name || student["Full Name"] || "Unknown";
        var adm = student.ADM || student.adm || student["ADM No"] || "";

        html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
          '<span style="flex:1;">' + name + " (" + adm + ")</span>" +
          '<input type="text" class="furniture-chair-input" placeholder="Chair No" data-adm="' + adm + '" style="width:100px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">' +
          '<input type="text" class="furniture-locker-input" placeholder="Locker No" data-adm="' + adm + '" style="width:100px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">' +
          '</div>';
      });

      html += '<button class="btn btn-primary" style="width:100%;margin-top:15px;" onclick="allocateBulkFurniture()"><i class="fas fa-chair"></i> Allocate to All</button>';
      container.innerHTML = html;
    }
  });
}

function allocateBulkFurniture() {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  var allocationDate = document.getElementById("bulkFurnitureDate");
  var allocDate = allocationDate && allocationDate.value ? allocationDate.value : getCurrentDate();

  var chairInputs = document.querySelectorAll(".furniture-chair-input");
  var lockerInputs = document.querySelectorAll(".furniture-locker-input");
  var allocated = 0;
  var promises = [];

  chairInputs.forEach(function(chairInput, index) {
    if (chairInput.value) {
      var adm = chairInput.dataset.adm;
      var lockerNo = lockerInputs[index] ? lockerInputs[index].value : "";

      var student = null;
      if (bulkFurnitureClass && bulkFurnitureClass.students) {
        bulkFurnitureClass.students.forEach(function(s) {
          var sAdm = s.ADM || s.adm || s["ADM No"] || "";
          if (sAdm === adm) student = s;
        });
      }

      if (student) {
        var name = student.Name || student.name || student["Full Name"] || "Unknown";
        promises.push(
          API.allocateFurniture(school, {
            studentName: name,
            adm: adm,
            form: bulkFurnitureClass.name,
            stream: bulkFurnitureClass.stream || "",
            chairNo: chairInput.value,
            lockerNo: lockerNo,
            allocationDate: allocDate,
            issuedBy: user ? user.name : ""
          })
        );
        allocated++;
      }
    }
  });

  if (promises.length === 0) {
    showNotification("No chair numbers entered", "warning");
    return;
  }

  Promise.all(promises).then(function() {
    showNotification("Allocated furniture to " + allocated + " students!", "success");
    logAction("Bulk Furniture Allocation", allocated + " students");
    closeModal("bulkFurnitureModal");
    loadFurnitureData();
  });
}

// ============ CHAT ============
function loadChatUsers() {
  var school = getCurrentSchool();
  if (!school) return;
  
  API.getUsers(school).then(function(users) {
    var currentUser = getCurrentUser();
    var userList = document.getElementById("chatUserList");
    if (!userList) return;

    var html = "";
    (users || []).forEach(function(u) {
      if (u.email !== currentUser.email) {
        html += '<button class="chat-user-btn" onclick="selectChatUser(\'' + u.email + "', '" + u.name + "')\">' +
          '<div style="width:35px;height:35px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#f0d060);display:flex;align-items:center;justify-content:center;font-weight:700;color:#0a0e27;">' + getInitials(u.name) + "</div>" +
          '<div style="flex:1;text-align:left;"><div style="font-weight:600;">' + (u.name || '') + '</div><small style="color:rgba(255,255,255,0.5);">' + (u.role || '') + "</small></div>" +
          "</button>";
      }
    });
    userList.innerHTML = html || '<p style="color:rgba(255,255,255,0.5);text-align:center;">No other users</p>';
  });
}

function selectChatUser(email, name) {
  currentChatUserEmail = email;
  currentChatUserName = name;
  var header = document.getElementById("chatWithName");
  if (header) header.textContent = name;
  loadChatMessages();

  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (school && user) {
    API.markMessagesAsRead(school, user.email, email).then(function() {
      checkUnreadMessages();
    });
  }
}

function loadChatMessages() {
  if (!currentChatUserEmail) return;
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  API.getChatMessages(school, user.email, currentChatUserEmail).then(function(messages) {
    var container = document.getElementById("chatMessages");
    if (!container) return;

    if (!messages || messages.length === 0) {
      container.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">No messages yet</p>';
      return;
    }

    var html = "";
    messages.forEach(function(msg) {
      var isMine = msg.fromEmail === user.email;
      var bg = isMine ? "rgba(233,69,96,0.4)" : "rgba(255,255,255,0.15)";
      var align = isMine ? "flex-end" : "flex-start";
      html += '<div style="display:flex;justify-content:' + align + ';margin:8px 0;">' +
        '<div style="background:' + bg + ';padding:10px 16px;border-radius:16px;max-width:70%;">' +
        "<strong>" + (msg.fromName || '') + ":</strong> " + (msg.message || '') +
        "<br><small>" + formatTime(msg.timestamp) + "</small>" +
        "</div></div>";
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  });
}

function sendMessage(event) {
  event.preventDefault();
  if (!currentChatUserEmail) {
    showNotification("Select a user first", "warning");
    return false;
  }

  var school = getCurrentSchool();
  var user = getCurrentUser();
  var input = document.getElementById("messageInput");
  if (!input || !input.value.trim()) return false;

  API.sendChatMessage(school, {
    fromEmail: user.email,
    fromName: user.name,
    toEmail: currentChatUserEmail,
    message: input.value.trim()
  }).then(function() {
    input.value = "";
    loadChatMessages();
  });
  return false;
}

// ============ FORUM ============
function loadForumMessages() {
  var school = getCurrentSchool();
  if (!school) return;
  
  API.getForumMessages(school).then(function(messages) {
    var container = document.getElementById("forumMessages");
    if (!container) return;

    if (!messages || messages.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No messages</p>';
      return;
    }

    var html = "";
    messages.forEach(function(msg) {
      html += '<div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:12px;margin:10px 0;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
        "<strong>" + (msg.fromName || '') + "</strong><small>" + formatDateTime(msg.timestamp) + "</small></div>" +
        '<p style="margin:0;">' + (msg.message || '') + "</p></div>";
    });
    container.innerHTML = html;
  });
}

function postForumMessage(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();
  var input = document.getElementById("forumMessageInput");
  if (!input || !input.value.trim()) return false;

  API.postForumMessage(school, {
    fromEmail: user.email,
    fromName: user.name,
    role: user.role,
    message: input.value.trim()
  }).then(function() {
    input.value = "";
    loadForumMessages();
    showNotification("Posted!", "success");
  });
  return false;
}

// ============ NOTEPAD ============
function loadNotes() {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  API.getNotes(school, user.email).then(function(notes) {
    allNotesCache = notes || [];
    var container = document.getElementById("notesList");
    if (!container) return;

    if (notes.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No notes yet</p>';
      return;
    }

    var html = "";
    notes.forEach(function(note) {
      var tempDiv = document.createElement("div");
      tempDiv.innerHTML = note.content || "";
      var preview = tempDiv.textContent.substring(0, 100) + "...";

      html += '<div class="note-card">' +
        "<h4>" + (note.title || "Untitled") + "</h4>" +
        "<p>" + preview + "</p>" +
        "<small>" + formatDateTime(note.timestamp) + "</small>" +
        '<div style="margin-top:10px;display:flex;gap:8px;">' +
        '<button class="btn btn-sm btn-primary" onclick="loadNoteForEdit(\'' + note.id + '\')"><i class="fas fa-edit"></i> Edit</button>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteNote(\'' + note.id + '\')"><i class="fas fa-trash"></i></button>' +
        "</div></div>";
    });
    container.innerHTML = html;
  });
}

function loadNoteForEdit(noteId) {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  API.getNotes(school, user.email).then(function(notes) {
    var found = null;
    notes.forEach(function(n) {
      if (n.id === noteId) found = n;
    });
    if (found) {
      currentNoteId = found.id;
      var titleEl = document.getElementById("noteTitle");
      var contentEl = document.getElementById("noteContent");
      if (titleEl) titleEl.value = found.title || "";
      if (contentEl) contentEl.innerHTML = found.content || "";
      updateWordCount();
      showNotification("Loaded: " + (found.title || "Untitled"), "success");
    }
  });
}

function saveNote(event) {
  if (event) event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  var titleEl = document.getElementById("noteTitle");
  var contentEl = document.getElementById("noteContent");
  
  var title = titleEl ? titleEl.value.trim() || "Untitled" : "Untitled";
  var content = contentEl ? contentEl.innerHTML : "";

  if (!content || content === "<br>" || content === "") {
    showNotification("Cannot save empty note", "warning");
    return false;
  }

  API.saveNote(school, {
    author: user.name,
    authorEmail: user.email,
    title: title,
    content: content,
    noteId: currentNoteId || null
  }).then(function(result) {
    if (result.success) {
      showNotification("Note saved!", "success");
      logAction("Note Saved", title);
      if (titleEl) titleEl.value = "";
      if (contentEl) contentEl.innerHTML = "";
      currentNoteId = null;
      loadNotes();
    }
  });
  return false;
}

function deleteNote(noteId) {
  if (!noteId) return;
  
  DialogSystem.confirm("Delete this note?", {
    title: "Delete Note",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel"
  }).then(function(confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.deleteNote(school, noteId).then(function() {
      showNotification("Note deleted!", "success");
      loadNotes();
    });
  });
}

function updateWordCount() {
  var content = document.getElementById("noteContent");
  if (!content) return;
  var text = content.textContent || "";
  var words = text.trim() ? text.trim().split(/\s+/).length : 0;
  var chars = text.length;
  var lines = text.split("\n").length;
  var wordEl = document.getElementById("wordCount");
  if (wordEl) wordEl.textContent = words + " words | " + chars + " characters | " + lines + " lines";
}

// ============ EVENTS ============
function loadEvents() {
  var school = getCurrentSchool();
  if (!school) return;
  
  API.getEvents(school).then(function(events) {
    var container = document.getElementById("eventsList");
    if (!container) return;

    if (!events || events.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No events</p>';
      return;
    }

    events.sort(function(a, b) {
      return new Date(a.eventDate) - new Date(b.eventDate);
    });

    var html = "";
    events.forEach(function(event) {
      html += '<div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:12px;margin:10px 0;border-left:4px solid #e94560;">' +
        '<div style="display:flex;justify-content:space-between;">' +
        "<strong>" + (event.title || '') + "</strong>" +
        '<span class="badge badge-info">' + (event.eventType || '') + "</span></div>" +
        '<p style="margin:5px 0;">' + (event.description || '') + "</p>" +
        "<small>" + formatDate(event.eventDate) + "</small></div>";
    });
    container.innerHTML = html;
  });
}

function addEvent(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var title = document.getElementById("eventTitle");
  var eventDate = document.getElementById("eventDate");

  if (!title || !title.value || !eventDate || !eventDate.value) {
    showNotification("Title and date are required", "warning");
    return false;
  }

  API.addEvent(school, {
    title: title.value,
    description: document.getElementById("eventDescription") ? document.getElementById("eventDescription").value : "",
    eventDate: eventDate.value,
    eventType: document.getElementById("eventType") ? document.getElementById("eventType").value : "Other",
    createdBy: user ? user.name : ""
  }).then(function() {
    showNotification("Event added!", "success");
    logAction("Event Added", title.value);
    closeModal("addEventModal");
    loadEvents();
  });
  return false;
}

// ============ FEES ============
function loadFeesData() {
  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([API.getStudents(school), API.getFees(school)]).then(function(results) {
    var students = results[0] || [];
    var fees = results[1] || [];

    var select = document.getElementById("feeStudent");
    if (select) {
      var selectHtml = '<option value="">Select Student</option>';
      students.forEach(function(s) {
        selectHtml += '<option value="' + s.adm + '">' + (s.name || '') + " (" + s.adm + ")</option>";
      });
      select.innerHTML = selectHtml;
    }

    var tbody = document.getElementById("feesTableBody");
    if (tbody) {
      if (fees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No fee records</td></tr>';
      } else {
        var html = "";
        fees.forEach(function(fee) {
          var badge = fee.balance <= 0 ? '<span class="badge badge-success">Completed</span>' : '<span class="badge badge-warning">Partial</span>';
          html += "<tr>" +
            "<td>" + (fee.studentName || '-') + "</td>" +
            "<td>" + (fee.studentAdm || '-') + "</td>" +
            "<td>KES " + formatNumber(fee.amount || 0) + "</td>" +
            "<td>KES " + formatNumber(fee.paid || 0) + "</td>" +
            "<td>KES " + formatNumber(fee.balance || 0) + "</td>" +
            "<td>" + (fee.term || '') + "</td>" +
            "<td>" + badge + "</td>" +
            '<td><button class="btn btn-sm btn-primary" onclick="editFee(\'' + fee.id + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteFee(\'' + fee.id + '\')"><i class="fas fa-trash"></i></button></td>' +
            "</tr>";
        });
        tbody.innerHTML = html;
      }
    }

    var totalFees = fees.reduce(function(s, f) { return s + (f.amount || 0); }, 0);
    var totalPaid = fees.reduce(function(s, f) { return s + (f.paid || 0); }, 0);
    var totalBalance = fees.reduce(function(s, f) { return s + (f.balance || 0); }, 0);

    var totalEl = document.getElementById("totalFeesAmount");
    var paidEl = document.getElementById("totalPaidAmount");
    var balanceEl = document.getElementById("totalBalanceAmount");
    if (totalEl) totalEl.textContent = formatCurrency(totalFees);
    if (paidEl) paidEl.textContent = formatCurrency(totalPaid);
    if (balanceEl) balanceEl.textContent = formatCurrency(totalBalance);
  });
}

function editFee(feeId) {
  if (!feeId) return;
  
  var school = getCurrentSchool();
  API.getFees(school).then(function(fees) {
    fees.forEach(function(fee) {
      if (fee.id === feeId) {
        currentEditingFeeId = feeId;
        var studentEl = document.getElementById("feeStudent");
        var amountEl = document.getElementById("feeAmount");
        var paidEl = document.getElementById("feePaid");
        var termEl = document.getElementById("feeTerm");
        var btnEl = document.getElementById("saveFeeBtn");
        
        if (studentEl) studentEl.value = fee.studentAdm;
        if (amountEl) amountEl.value = fee.amount;
        if (paidEl) paidEl.value = fee.paid;
        if (termEl) termEl.value = fee.term;
        if (btnEl) btnEl.innerHTML = '<i class="fas fa-save"></i> Update Fee';
      }
    });
  });
}

function saveFee(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var studentAdm = document.getElementById("feeStudent");
  if (!studentAdm || !studentAdm.value) {
    showNotification("Select a student", "warning");
    return false;
  }

  var select = document.getElementById("feeStudent");
  var studentName = select.options[select.selectedIndex].text.split(" (")[0];

  var amount = document.getElementById("feeAmount");
  var paid = document.getElementById("feePaid");
  var term = document.getElementById("feeTerm");

  API.saveFee(school, {
    id: currentEditingFeeId,
    studentAdm: studentAdm.value,
    studentName: studentName,
    amount: parseFloat(amount ? amount.value : 0) || 0,
    paid: parseFloat(paid ? paid.value : 0) || 0,
    term: term ? term.value || "Term 1" : "Term 1"
  }).then(function() {
    showNotification(currentEditingFeeId ? "Fee updated!" : "Fee saved!", "success");
    logAction(currentEditingFeeId ? "Fee Updated" : "Fee Recorded", studentName);
    currentEditingFeeId = null;
    var btn = document.getElementById("saveFeeBtn");
    if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Save Fee';
    loadFeesData();
  });
  return false;
}

function deleteFee(feeId) {
  if (!feeId) return;
  
  DialogSystem.confirm("Delete this fee record?", {
    title: "Delete Fee",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel"
  }).then(function(confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.deleteFee(school, feeId).then(function() {
      showNotification("Fee deleted!", "success");
      logAction("Fee Deleted", feeId);
      loadFeesData();
    });
  });
}

// ============ TIMETABLE ============
function loadTimetableData() {
  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([
    API.getTimetable(school),
    API.getClasses(school),
    API.getTeachers(school)
  ]).then(function(results) {
    var timetable = results[0] || [];
    var classes = results[1] || [];
    var teachers = results[2] || [];

    var tbody = document.getElementById("timetableBody");
    if (tbody) {
      if (timetable.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No entries</td></tr>';
      } else {
        var html = "";
        timetable.forEach(function(t) {
          html += "<tr><td>" + (t.day || '-') + "</td><td>" + (t.period || '-') + "</td><td>" + (t.className || '-') + "</td><td>" + (t.subject || '-') + "</td><td>" + (t.teacher || '-') + "</td><td>" + (t.room || '-') + "</td></tr>";
        });
        tbody.innerHTML = html;
      }
    }

    var classSelect = document.getElementById("ttClass");
    if (classSelect) {
      var classHtml = "";
      classes.forEach(function(c) {
        classHtml += '<option value="' + (c.name || '') + '">' + (c.name || '') + " " + (c.stream || '') + "</option>";
      });
      classSelect.innerHTML = classHtml;
    }

    var teacherSelect = document.getElementById("ttTeacher");
    if (teacherSelect) {
      var teacherHtml = "";
      teachers.forEach(function(t) {
        teacherHtml += '<option value="' + (t.name || '') + '">' + (t.name || '') + "</option>";
      });
      teacherSelect.innerHTML = teacherHtml;
    }
  });
}

function addTimetableEntry(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var className = document.getElementById("ttClass");
  var day = document.getElementById("ttDay");
  var period = document.getElementById("ttPeriod");
  var subject = document.getElementById("ttSubject");
  var teacher = document.getElementById("ttTeacher");
  var room = document.getElementById("ttRoom");

  if (!className || !className.value || !day || !day.value || !period || !period.value || !subject || !subject.value) {
    showNotification("Please fill in all required fields", "warning");
    return false;
  }

  API.addTimetableEntry(school, {
    className: className.value,
    day: day.value,
    period: period.value,
    subject: subject.value,
    teacher: teacher ? teacher.value : "",
    room: room ? room.value : "",
    createdBy: user ? user.name : ""
  }).then(function() {
    showNotification("Entry added!", "success");
    logAction("Timetable Added", subject.value);
    if (subject) subject.value = "";
    if (room) room.value = "";
    loadTimetableData();
  });
  return false;
}

// ============ TEACHERS ============
function loadTeachersData() {
  var school = getCurrentSchool();
  if (!school) return;
  
  API.getTeachers(school).then(function(teachers) {
    var tbody = document.getElementById("teachersTableBody");
    if (!tbody) return;

    if (!teachers || teachers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No teachers</td></tr>';
      return;
    }

    var html = "";
    teachers.forEach(function(t) {
      html += "<tr><td>" + (t.name || '-') + "</td><td>" + (t.email || '-') + "</td><td>" + (t.phone || '-') + "</td><td>" + (t.subjects || '-') + "</td><td>" + (t.classes || '-') + '</td><td><button class="btn btn-sm btn-danger" onclick="deleteTeacher(\'' + t.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
    });
    tbody.innerHTML = html;
  });
}

function addTeacher(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var name = document.getElementById("teacherName");
  if (!name || !name.value) {
    showNotification("Teacher name is required", "warning");
    return false;
  }

  API.addTeacher(school, {
    name: name.value,
    email: document.getElementById("teacherEmail") ? document.getElementById("teacherEmail").value : "",
    phone: document.getElementById("teacherPhone") ? document.getElementById("teacherPhone").value : "",
    subjects: document.getElementById("teacherSubjects") ? document.getElementById("teacherSubjects").value : "",
    classes: document.getElementById("teacherClasses") ? document.getElementById("teacherClasses").value : "",
    addedBy: user ? user.name : ""
  }).then(function(result) {
    if (result.success) {
      showNotification("Teacher added!", "success");
      logAction("Teacher Added", name.value);
      closeModal("addTeacherModal");
      loadTeachersData();
    }
  });
  return false;
}

function deleteTeacher(teacherId) {
  if (!teacherId) return;
  
  DialogSystem.confirm("Delete this teacher?", {
    title: "Delete Teacher",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel"
  }).then(function(confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.deleteTeacher(school, teacherId).then(function() {
      showNotification("Teacher deleted!", "success");
      logAction("Teacher Deleted", teacherId);
      loadTeachersData();
    });
  });
}

// ============ CLASSES ============
function loadClassesData() {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school) return;

  API.getClasses(school).then(function(classes) {
    var container = document.getElementById("classesList");
    if (!container) return;

    if (!classes || classes.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No classes yet</p>';
      return;
    }

    var html = "";
    classes.forEach(function(c) {
      var studentCount = c.students ? c.students.length : 0;
      var deleteBtn = "";
      if (user && user.role === "admin") {
        deleteBtn = '<button class="btn btn-sm btn-danger" onclick="deleteClass(\'' + c.id + '\')"><i class="fas fa-trash"></i> Delete</button>';
      }
      html += '<div class="class-card">' +
        "<h4>" + (c.name || '') + " " + (c.stream || '') + "</h4>" +
        "<p>" + studentCount + " students</p>" +
        "<p>Teacher: " + (c.teacher || "Not assigned") + "</p>" +
        '<div class="class-actions">' +
        '<button class="btn btn-view btn-sm" onclick="viewClassStudents(\'' + c.id + '\')"><i class="fas fa-eye"></i> View</button> ' +
        deleteBtn +
        "</div></div>";
    });
    container.innerHTML = html;
  });
}

function handleExcelUpload(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, { type: "array" });
      var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      var jsonData = XLSX.utils.sheet_to_json(firstSheet);

      var countEl = document.getElementById("excelStudentCount");
      var dataEl = document.getElementById("excelStudentsData");
      var previewEl = document.getElementById("excelPreview");
      
      if (countEl) countEl.textContent = jsonData.length + " students loaded";
      if (dataEl) {
        dataEl.value = JSON.stringify(jsonData);
        dataEl.dataset.loaded = "true";
      }

      if (jsonData.length > 0 && previewEl) {
        var columns = Object.keys(jsonData[0]);
        var previewHtml = '<div class="excel-preview-container"><table><thead><tr>';
        columns.forEach(function(col) {
          previewHtml += "<th>" + col + "</th>";
        });
        previewHtml += "</tr></thead><tbody>";
        jsonData.slice(0, 10).forEach(function(row) {
          previewHtml += "<tr>";
          columns.forEach(function(col) {
            previewHtml += "<td>" + (row[col] || "-") + "</td>";
          });
          previewHtml += "</tr>";
        });
        if (jsonData.length > 10) {
          previewHtml += '<tr><td colspan="' + columns.length + '" style="text-align:center;color:rgba(255,255,255,0.4);">... and ' + (jsonData.length - 10) + ' more</td></tr>';
        }
        previewHtml += "</tbody></table></div>";
        previewEl.innerHTML = previewHtml;
      }
    } catch(err) {
      showNotification("Error reading Excel file", "error");
      console.error(err);
    }
  };
  reader.readAsArrayBuffer(file);
}

function addClassWithExcel(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var className = document.getElementById("className");
  var classStream = document.getElementById("classStream");
  var classTeacher = document.getElementById("classTeacher");
  var studentsData = document.getElementById("excelStudentsData");

  if (!className || !className.value) {
    showNotification("Class name is required", "warning");
    return false;
  }

  var students = [];
  if (studentsData && studentsData.value && studentsData.dataset.loaded === "true") {
    try {
      students = JSON.parse(studentsData.value);
    } catch(e) {
      students = [];
    }
  }

  API.addClass(school, {
    name: className.value,
    stream: classStream ? classStream.value : "",
    teacher: classTeacher ? classTeacher.value : "",
    students: students,
    createdBy: user ? user.name : ""
  }).then(function(result) {
    if (result.success) {
      showNotification("Class added with " + students.length + " students!", "success");
      logAction("Class Added", className.value + " with " + students.length + " students");
      closeModal("addClassModal");
      loadClassesData();
    }
  });
  return false;
}

function viewClassStudents(classId) {
  if (!classId) return;
  
  var school = getCurrentSchool();
  API.getClasses(school).then(function(classes) {
    classes.forEach(function(cls) {
      if (cls.id === classId) {
        var students = cls.students || [];

        var existingModal = document.getElementById("viewStudentsModal");
        if (existingModal) existingModal.remove();

        var modal = document.createElement("div");
        modal.className = "modal active";
        modal.id = "viewStudentsModal";

        var html = '<div class="modal-content">' +
          '<div class="modal-header">' +
          '<h3><i class="fas fa-users"></i> ' + (cls.name || '') + " Students</h3>" +
          '<button class="modal-close" onclick="closeModal(\'viewStudentsModal\')"><i class="fas fa-times"></i></button>' +
          "</div>";

        if (students.length === 0) {
          html += '<p style="text-align:center;">No students in this class</p>';
        } else {
          html += '<div class="table-container"><table class="data-table"><thead><tr><th>#</th><th>Name</th><th>ADM</th><th>Gender</th></tr></thead><tbody>';
          students.forEach(function(s, i) {
            var name = s.Name || s.name || s["Full Name"] || "Unknown";
            var adm = s.ADM || s.adm || s["ADM No"] || "-";
            var gender = s.Gender || s.gender || "-";
            html += "<tr><td>" + (i + 1) + "</td><td>" + name + "</td><td>" + adm + "</td><td>" + gender + "</td></tr>";
          });
          html += "</tbody></table></div>";
        }
        html += "</div>";
        modal.innerHTML = html;
        document.body.appendChild(modal);
      }
    });
  });
}

function deleteClass(classId) {
  if (!classId) return;
  
  DialogSystem.confirm("Delete this class? All students in this class will be removed.", {
    title: "Delete Class",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel"
  }).then(function(confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.deleteClass(school, classId).then(function() {
      showNotification("Class deleted!", "success");
      logAction("Class Deleted", classId);
      loadClassesData();
    });
  });
}

// ============ TERMS ============
function loadTerms() {
  var school = getCurrentSchool();
  if (!school) return;
  
  API.getTerms(school).then(function(terms) {
    var container = document.getElementById("termsList");
    if (!container) return;

    if (!terms || terms.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">No terms</p>';
      return;
    }

    var html = "";
    terms.forEach(function(term) {
      var current = term.isCurrent ? "✅ Current" : "";
      var border = term.isCurrent ? "border-left:4px solid #28a745;" : "";
      html += '<div class="term-card" style="' + border + '">' +
        "<h4>" + (term.name || '') + " " + current + "</h4>" +
        "<p>" + (term.startDate || '') + " → " + (term.endDate || '') + "</p></div>";
    });
    container.innerHTML = html;
  });
}

function addTerm(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var name = document.getElementById("termName");
  var startDate = document.getElementById("termStartDate");
  var endDate = document.getElementById("termEndDate");

  if (!name || !name.value || !startDate || !startDate.value || !endDate || !endDate.value) {
    showNotification("All fields are required", "warning");
    return false;
  }

  API.addTerm(school, {
    name: name.value,
    startDate: startDate.value,
    endDate: endDate.value,
    createdBy: user ? user.name : ""
  }).then(function() {
    showNotification("Term added!", "success");
    logAction("Term Added", name.value);
    closeModal("addTermModal");
    loadTerms();
  });
  return false;
}

// ============ AUDIT LOG ============
function loadAuditLog() {
  var school = getCurrentSchool();
  if (!school) return;
  
  API.getAuditLog(school).then(function(logs) {
    var tbody = document.getElementById("auditLogBody");
    if (!tbody) return;

    if (!logs || logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No audit log entries</td></tr>';
      return;
    }

    var html = "";
    logs.forEach(function(log) {
      html += "<tr><td>" + formatDateTime(log.timestamp) + "</td><td>" + (log.user || '-') + "</td><td>" + (log.userEmail || '-') + "</td><td>" + (log.action || '-') + "</td><td>" + (log.details || '-') + "</td></tr>";
    });
    tbody.innerHTML = html;
  });
}

// ============ SETTINGS ============
function loadSettingsData() {
  var school = getCurrentSchool();
  if (!school) return;

  API.getSchool(school).then(function(schoolInfo) {
    if (schoolInfo) {
      var nameEl = document.getElementById("schoolNameInput");
      var addressEl = document.getElementById("schoolAddress");
      var adminNameEl = document.getElementById("adminName");
      var adminEmailEl = document.getElementById("adminEmail");
      var mottoEl = document.getElementById("schoolMotto");
      
      if (nameEl) nameEl.value = schoolInfo.name || "";
      if (addressEl) addressEl.value = schoolInfo.address || "";
      if (adminNameEl) adminNameEl.value = schoolInfo.adminName || "";
      if (adminEmailEl) adminEmailEl.value = schoolInfo.adminEmail || "";
      if (mottoEl) mottoEl.value = schoolInfo.motto || "";
    }
  });

  API.getSettings(school).then(function(settings) {
    if (settings) {
      var borrowEl = document.getElementById("maxBorrowDays");
      var maxBooksEl = document.getElementById("maxBooksPerStudent");
      var fineEl = document.getElementById("finePerDay");
      
      if (borrowEl) borrowEl.value = settings.maxBorrowDays || 14;
      if (maxBooksEl) maxBooksEl.value = settings.maxBooksPerStudent || 3;
      if (fineEl) fineEl.value = settings.finePerDay || 10;
    }
  });

  API.getUsers(school).then(function(users) {
    var tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    var currentUser = getCurrentUser();
    var html = "";

    (users || []).forEach(function(u) {
      var status = u.isActive !== false ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>';
      var roleBadge = u.role === "admin" ? '<span class="badge badge-admin">Admin</span>' : '<span class="badge badge-info">' + (u.role || '') + "</span>";

      var actions = "";
      if (u.role !== "admin") {
        actions += '<button class="btn-promote" onclick="promoteToAdmin(\'' + u.email + '\')"><i class="fas fa-arrow-up"></i> Promote</button> ';
      }
      if (u.email !== currentUser.email) {
        actions += '<button class="btn btn-sm btn-danger" onclick="deleteUser(\'' + u.email + '\')"><i class="fas fa-trash"></i></button>';
      } else {
        actions += '<span style="font-size:11px;color:rgba(255,255,255,0.4);">You</span>';
      }

      html += "<tr><td>" + (u.name || '') + "</td><td>" + (u.email || '') + "</td><td>" + roleBadge + "</td><td>" + status + "</td><td>" + actions + "</td></tr>";
    });
    tbody.innerHTML = html;
  });
}

function saveSchoolInfo(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  
  var nameEl = document.getElementById("schoolNameInput");
  var addressEl = document.getElementById("schoolAddress");
  var adminNameEl = document.getElementById("adminName");
  var adminEmailEl = document.getElementById("adminEmail");
  var mottoEl = document.getElementById("schoolMotto");

  API.updateSchool(school, {
    name: nameEl ? nameEl.value : school,
    address: addressEl ? addressEl.value : "",
    adminName: adminNameEl ? adminNameEl.value : "",
    adminEmail: adminEmailEl ? adminEmailEl.value : "",
    motto: mottoEl ? mottoEl.value : ""
  }).then(function(result) {
    if (result.success) {
      showNotification("School info saved!", "success");
      logAction("School Info Updated", "School information");
    }
  });
  return false;
}

function saveSettings(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  
  var borrowEl = document.getElementById("maxBorrowDays");
  var maxBooksEl = document.getElementById("maxBooksPerStudent");
  var fineEl = document.getElementById("finePerDay");

  API.updateSettings(school, {
    maxBorrowDays: parseInt(borrowEl ? borrowEl.value : 14) || 14,
    maxBooksPerStudent: parseInt(maxBooksEl ? maxBooksEl.value : 3) || 3,
    finePerDay: parseInt(fineEl ? fineEl.value : 10) || 10
  }).then(function(result) {
    if (result.success) {
      showNotification("Settings saved!", "success");
      logAction("Settings Updated", "Library settings");
    }
  });
  return false;
}

function addUser(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  
  var nameEl = document.getElementById("newUserName");
  var emailEl = document.getElementById("newUserEmail");
  var roleEl = document.getElementById("newUserRole");
  var passwordEl = document.getElementById("newUserPassword");

  if (!nameEl || !nameEl.value || !emailEl || !emailEl.value || !passwordEl || !passwordEl.value) {
    showNotification("All fields are required", "warning");
    return false;
  }

  API.createUser(school, {
    name: nameEl.value,
    email: emailEl.value,
    role: roleEl ? roleEl.value : "teacher",
    password: passwordEl.value
  }).then(function(result) {
    if (result.success) {
      showNotification("User added!", "success");
      logAction("User Added", nameEl.value);
      closeModal("addUserModal");
      if (document.getElementById("addUserForm")) document.getElementById("addUserForm").reset();
      loadSettingsData();
    } else {
      showNotification(result.error || "Failed to add user", "error");
    }
  });
  return false;
}

function promoteToAdmin(email) {
  if (!email) return;
  
  DialogSystem.confirm("Promote this user to admin?", {
    title: "Promote User",
    type: "success",
    confirmText: "Promote",
    cancelText: "Cancel"
  }).then(function(confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.updateUser(school, email, { role: "admin" }).then(function() {
      showNotification("User promoted!", "success");
      logAction("User Promoted", email);
      loadSettingsData();
    });
  });
}

function deleteUser(email) {
  if (!email) return;
  
  DialogSystem.confirm("Deactivate this user?", {
    title: "Delete User",
    type: "danger",
    confirmText: "Deactivate",
    cancelText: "Cancel"
  }).then(function(confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.deleteUser(school, email).then(function() {
      showNotification("User deactivated!", "success");
      logAction("User Deactivated", email);
      loadSettingsData();
    });
  });
}

// ============ REPORTS ============
function loadReports() {
  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([
    API.getBooks(school),
    API.getStudents(school),
    API.getBorrowed(school),
    API.getFurniture(school)
  ]).then(function(results) {
    var books = results[0] || [];
    var students = results[1] || [];
    var borrowed = results[2] || [];
    var furniture = results[3] || [];

    var activeLoans = borrowed.filter(function(b) { return !b.returned; });
    var overdue = activeLoans.filter(function(b) { return isOverdue(b.returnDate); });
    var returned = borrowed.filter(function(b) { return b.returned; });
    var returnRate = borrowed.length > 0 ? Math.round((returned.length / borrowed.length) * 100) : 0;

    var overdueEl = document.getElementById("overdueCount");
    var activeEl = document.getElementById("activeLoansCount");
    var rateEl = document.getElementById("returnRate");
    var furnitureEl = document.getElementById("furnitureCount");
    
    if (overdueEl) overdueEl.textContent = overdue.length;
    if (activeEl) activeEl.textContent = activeLoans.length;
    if (rateEl) rateEl.textContent = returnRate + "%";
    if (furnitureEl) furnitureEl.textContent = furniture.length;

    // Render overdue report
    renderOverdueReport(overdue);
    renderMonthlySummary(borrowed, furniture);

    if (typeof Chart !== "undefined") {
      try {
        createBooksByTypeChart(books);
        createStudentsByFormChart(students);
        createFurnitureChart(furniture);
        createBorrowingTrendChart(borrowed);
      } catch(e) {
        // Chart errors ignored
      }
    }
  });
}

function renderOverdueReport(overdue) {
  var tbody = document.getElementById("overdueReportBody");
  if (!tbody) return;
  
  if (overdue.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No overdue books 🎉</td></tr>';
    return;
  }
  
  var html = "";
  overdue.forEach(function(b) {
    html += '<tr>' +
      '<td>' + (b.studentName || '-') + '</td>' +
      '<td>' + (b.adm || '-') + '</td>' +
      '<td>' + (b.bookTitle || '-') + '</td>' +
      '<td>' + (b.bookNo || '-') + '</td>' +
      '<td>' + (b.returnDate || '-') + '</td>' +
      '<td><span class="badge badge-danger">' + daysOverdue(b.returnDate) + ' days</span></td>' +
      '</tr>';
  });
  tbody.innerHTML = html;
}

function renderMonthlySummary(borrowed, furniture) {
  var tbody = document.getElementById("monthlySummaryBody");
  if (!tbody) return;
  
  var monthlyData = {};
  
  (borrowed || []).forEach(function(b) {
    var date = new Date(b.borrowDate);
    var key = date.getFullYear() + '-' + (date.getMonth() + 1);
    if (!monthlyData[key]) monthlyData[key] = { issued: 0, returned: 0, furniture: 0 };
    monthlyData[key].issued++;
    if (b.returned) monthlyData[key].returned++;
  });
  
  (furniture || []).forEach(function(f) {
    var date = new Date(f.allocationDate);
    var key = date.getFullYear() + '-' + (date.getMonth() + 1);
    if (!monthlyData[key]) monthlyData[key] = { issued: 0, returned: 0, furniture: 0 };
    monthlyData[key].furniture++;
  });
  
  var months = Object.keys(monthlyData).sort().reverse();
  
  if (months.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No data</td></tr>';
    return;
  }
  
  var html = "";
  months.slice(0, 12).forEach(function(key) {
    var parts = key.split('-');
    var monthName = getMonthName(parseInt(parts[1]) - 1) + ' ' + parts[0];
    var data = monthlyData[key];
    html += '<tr>' +
      '<td>' + monthName + '</td>' +
      '<td>' + data.issued + '</td>' +
      '<td>' + data.returned + '</td>' +
      '<td>' + data.furniture + '</td>' +
      '</tr>';
  });
  tbody.innerHTML = html;
}

function createBooksByTypeChart(books) {
  var canvas = document.getElementById('booksByTypeChart');
  if (!canvas) return;
  
  var types = {};
  books.forEach(function(b) {
    var type = b.type || 'Other';
    types[type] = (types[type] || 0) + (b.quantity || 0);
  });
  
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
  if (!canvas) return;
  
  var forms = {};
  students.forEach(function(s) {
    var form = s.form || 'Unknown';
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
  var canvas = document.getElementById('furnitureChart');
  if (!canvas) return;
  
  new Chart(canvas, {
    type: 'pie',
    data: {
      labels: ['Allocated'],
      datasets: [{ data: [furniture.length], backgroundColor: ['#ffc107'] }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { color: 'white' } } }
    }
  });
}

function createBorrowingTrendChart(borrowed) {
  var canvas = document.getElementById('borrowingTrendChart');
  if (!canvas) return;
  
  var months = {};
  borrowed.forEach(function(b) {
    var date = new Date(b.borrowDate);
    var key = date.getFullYear() + '-' + (date.getMonth() + 1);
    months[key] = (months[key] || 0) + 1;
  });
  
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

// ============ QR CODES ============
function loadQRCodeList() {
  var school = getCurrentSchool();
  if (!school) return;
  
  API.getQRCodes(school).then(function(codes) {
    var container = document.getElementById('qrCodeList');
    if (!container) return;
    
    if (!codes || codes.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-list"></i><p>No QR codes in the system yet.</p></div>';
      return;
    }
    
    var html = '<table class="data-table"><thead><tr><th>Code</th><th>Type</th><th>Status</th><th>Assigned To</th><th>Class</th><th>ADM</th></tr></thead><tbody>';
    codes.forEach(function(qr) {
      var status = qr.returned ? 'Returned' : (qr.assigned ? 'Assigned' : 'Available');
      var badgeClass = qr.returned ? 'badge-success' : (qr.assigned ? 'badge-warning' : 'badge-info');
      html += '<tr>' +
        '<td><strong>' + (qr.code || '') + '</strong></td>' +
        '<td>' + (qr.type || '') + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + status + '</span></td>' +
        '<td>' + (qr.assignedTo || '-') + '</td>' +
        '<td>' + (qr.className || '-') + '</td>' +
        '<td>' + (qr.adm || '-') + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  });
}

function generateAndDisplayQRCodes() {
  var school = getCurrentSchool();
  if (!school) return;
  
  var type = document.getElementById('qrType');
  var start = document.getElementById('qrStart');
  var end = document.getElementById('qrEnd');
  var container = document.getElementById('qrContainer');
  
  if (!container) return;
  
  var t = type ? type.value : 'book';
  var s = start ? parseInt(start.value) || 1 : 1;
  var e = end ? parseInt(end.value) || 5 : 5;
  
  if (s > e) {
    showNotification('Start number must be less than end number', 'error');
    return;
  }
  
  if (e - s > 50) {
    showNotification('Maximum 50 codes per batch', 'warning');
    return;
  }
  
  container.innerHTML = '<div style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin fa-2x" style="color:var(--accent);"></i><p style="margin-top:10px;">Generating QR codes...</p></div>';
  
  API.generateQRCodes(school, t, s, e).then(function(result) {
    if (result.success) {
      var html = '';
      result.codes.forEach(function(code) {
        var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(code);
        html += '<div class="qr-item">' +
          '<img src="' + qrUrl + '" width="150" height="150" alt="' + code + '">' +
          '<p>' + code + '</p>' +
          '<div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">' +
          '<button class="btn btn-sm btn-primary" onclick="downloadQRCode(\'' + code + '\')"><i class="fas fa-download"></i></button>' +
          '<button class="btn btn-sm btn-secondary" onclick="copyQRCodeText(\'' + code + '\')"><i class="fas fa-copy"></i></button>' +
          '</div>' +
          '</div>';
      });
      container.innerHTML = html;
      showNotification('Generated ' + result.codes.length + ' QR codes!', 'success');
      logAction('QR Code Generated', result.codes.length + ' codes');
    } else {
      container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">Error generating QR codes</p>';
      showNotification('Error generating QR codes', 'error');
    }
  });
}

function downloadQRCode(code) {
  if (!code) return;
  var url = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + encodeURIComponent(code);
  var link = document.createElement('a');
  link.download = code + '.png';
  link.href = url;
  link.target = '_blank';
  link.click();
  showNotification('Downloading ' + code, 'success');
}

function copyQRCodeText(code) {
  if (!code) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(function() {
      showNotification('Copied: ' + code, 'success');
    });
  } else {
    var input = document.createElement('input');
    input.value = code;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showNotification('Copied: ' + code, 'success');
  }
}

// ============ DATABASE MANAGER ============
function loadDatabaseTables() {
  var tables = [
    "books", "borrowed", "students", "furniture", "teachers",
    "classes", "terms", "events", "fees", "qrcodes",
    "auditLog", "users", "chat", "forum", "notes"
  ];
  var select = document.getElementById("databaseTableSelect");
  if (!select) return;

  var html = "";
  tables.forEach(function(t) {
    html += '<option value="' + t + '">' + t.charAt(0).toUpperCase() + t.slice(1) + "</option>";
  });
  select.innerHTML = html;

  setTimeout(loadDatabaseTable, 300);
}

function loadDatabaseTable() {
  var school = getCurrentSchool();
  var select = document.getElementById("databaseTableSelect");
  if (!select || !select.value) return;
  
  var tableName = select.value;

  API.getTableData(school, tableName).then(function(data) {
    var tbody = document.getElementById("databaseTableBody");
    var thead = document.getElementById("databaseTableHead");

    if (!tbody || !thead) return;

    if (!data || data.length === 0) {
      thead.innerHTML = "";
      tbody.innerHTML = "<tr><td>No data in this table</td></tr>";
      return;
    }

    var columns = Object.keys(data[0]);
    var filteredColumns = columns.filter(function(c) { return c !== "password"; });

    var headHtml = "";
    filteredColumns.forEach(function(col) {
      headHtml += "<th>" + col + "</th>";
    });
    thead.innerHTML = headHtml;

    var bodyHtml = "";
    data.forEach(function(row) {
      bodyHtml += "<tr>";
      filteredColumns.forEach(function(col) {
        var value = row[col];
        if (typeof value === "object") value = JSON.stringify(value);
        bodyHtml += "<td>" + (value || "-") + "</td>";
      });
      bodyHtml += "</tr>";
    });
    tbody.innerHTML = bodyHtml;
  });
}

// ============ WALLPAPER ============
function loadWallpapers() {
  var grid = document.getElementById("wallpaperGrid");
  if (!grid) return;

  var currentWallpaper = localStorage.getItem("srms_wallpaper") || "library";

  var html = "";
  for (var key in WALLPAPER_DATA) {
    var wallpaper = WALLPAPER_DATA[key];
    var isActive = key === currentWallpaper ? " active" : "";

    var previewStyle = "";
    if (wallpaper.type === "gradient") {
      previewStyle = "background:" + wallpaper.css + ";";
    } else {
      var thumbUrl = wallpaper.url.replace("w=1920", "w=400&h=250&fit=crop&q=60");
      previewStyle = 'background-image:url("' + thumbUrl + '");background-size:cover;background-position:center;';
    }

    html += '<div class="wallpaper-card' + isActive + '" onclick="selectWallpaper(\'' + key + "')\">" +
      '<div class="check-badge"><i class="fas fa-check"></i></div>' +
      '<div class="wallpaper-preview" style="' + previewStyle + '"></div>' +
      '<div class="wallpaper-info"><h3>' + wallpaper.name + "</h3></div></div>";
  }
  grid.innerHTML = html;
}

function selectWallpaper(key) {
  localStorage.setItem("srms_wallpaper", key);

  var cards = document.querySelectorAll(".wallpaper-card");
  cards.forEach(function(card) {
    card.classList.remove("active");
  });
  if (event && event.target) {
    var target = event.target.closest(".wallpaper-card");
    if (target) target.classList.add("active");
  }

  var wallpaper = WALLPAPER_DATA[key];
  if (wallpaper.type === "gradient") {
    document.body.style.background = wallpaper.css;
    document.body.style.backgroundImage = "none";
  } else {
    document.body.style.backgroundImage = 'linear-gradient(rgba(10,14,39,0.55),rgba(10,14,39,0.65)),url("' + wallpaper.url + '")';
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  }

  showNotification("Wallpaper applied!", "success");
}

// ============ EXPORT ALL FUNCTIONS ============
window.loadDashboardData = loadDashboardData;
window.loadLibraryData = loadLibraryData;
window.loadStudentsData = loadStudentsData;
window.loadFurnitureData = loadFurnitureData;
window.loadChatUsers = loadChatUsers;
window.loadForumMessages = loadForumMessages;
window.loadNotes = loadNotes;
window.loadEvents = loadEvents;
window.loadFeesData = loadFeesData;
window.loadTimetableData = loadTimetableData;
window.loadTeachersData = loadTeachersData;
window.loadClassesData = loadClassesData;
window.loadTerms = loadTerms;
window.loadAuditLog = loadAuditLog;
window.loadReports = loadReports;
window.loadSettingsData = loadSettingsData;
window.loadDatabaseTables = loadDatabaseTables;
window.loadDatabaseTable = loadDatabaseTable;
window.loadWallpapers = loadWallpapers;
window.selectWallpaper = selectWallpaper;
window.loadQRCodeList = loadQRCodeList;
window.generateAndDisplayQRCodes = generateAndDisplayQRCodes;
window.downloadQRCode = downloadQRCode;
window.copyQRCodeText = copyQRCodeText;
window.initDropdownController = initDropdownController;
window.checkUnreadMessages = checkUnreadMessages;
window.logAction = logAction;
window.addBook = addBook;
window.issueBook = issueBook;
window.returnBook = returnBook;
window.deleteBook = deleteBook;
window.addStudent = addStudent;
window.deleteStudent = deleteStudent;
window.allocateFurniture = allocateFurniture;
window.returnFurnitureItem = returnFurnitureItem;
window.selectChatUser = selectChatUser;
window.sendMessage = sendMessage;
window.postForumMessage = postForumMessage;
window.saveNote = saveNote;
window.loadNoteForEdit = loadNoteForEdit;
window.deleteNote = deleteNote;
window.addEvent = addEvent;
window.saveFee = saveFee;
window.editFee = editFee;
window.deleteFee = deleteFee;
window.addTimetableEntry = addTimetableEntry;
window.addTeacher = addTeacher;
window.deleteTeacher = deleteTeacher;
window.addClassWithExcel = addClassWithExcel;
window.handleExcelUpload = handleExcelUpload;
window.viewClassStudents = viewClassStudents;
window.deleteClass = deleteClass;
window.addTerm = addTerm;
window.promoteToAdmin = promoteToAdmin;
window.deleteUser = deleteUser;
window.loadClassStudentsForBooks = loadClassStudentsForBooks;
window.issueBulkBooks = issueBulkBooks;
window.loadClassStudentsForFurniture = loadClassStudentsForFurniture;
window.allocateBulkFurniture = allocateBulkFurniture;
window.saveSchoolInfo = saveSchoolInfo;
window.saveSettings = saveSettings;
window.addUser = addUser;
window.animateNumber = animateNumber;
window.updateWordCount = updateWordCount;
window.renderOverdueReport = renderOverdueReport;
window.renderMonthlySummary = renderMonthlySummary;
window.createBooksByTypeChart = createBooksByTypeChart;
window.createStudentsByFormChart = createStudentsByFormChart;
window.createFurnitureChart = createFurnitureChart;
window.createBorrowingTrendChart = createBorrowingTrendChart;

console.log("✅ SRMS App loaded successfully!");