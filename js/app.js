// ============================================
// SRMS - Complete Application Logic
// Optimized Version - Super Fast
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
var bulkBookClass = null;
var bulkFurnitureClass = null;

// ============ INITIALIZATION ============
document.addEventListener("DOMContentLoaded", function () {
  if (isAppInitialized) return;
  isAppInitialized = true;

  console.log("🚀 SRMS App initializing...");

  var user = checkAuth();
  if (!user) {
    console.log("❌ No user session found");
    return;
  }

  console.log("✅ User authenticated:", user.name);

  var page = window.location.pathname.split("/").pop() || "dashboard.html";

  if (page === "") {
    page = "dashboard.html";
  }

  console.log("📄 Current page:", page);

  // Initialize dropdowns
  initDropdownController();

  // Load page data
  setTimeout(function () {
    loadPageData(page);
  }, 300);

  // Start message checking
  setTimeout(function () {
    checkUnreadMessages();
    if (messageCheckInterval) clearInterval(messageCheckInterval);
    messageCheckInterval = setInterval(checkUnreadMessages, 30000);
  }, 3000);
});

// ============ DROPDOWN CONTROLLER ============
function initDropdownController() {
  var navGroups = document.querySelectorAll(".nav-group");

  navGroups.forEach(function (group) {
    var dropdown = group.querySelector(".dropdown-menu");
    var button = group.querySelector(".classy-btn");

    if (!dropdown || !button) return;

    var closeTimeout = null;

    function openDropdown() {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      document.querySelectorAll(".dropdown-menu.open").forEach(function (d) {
        if (d !== dropdown) d.classList.remove("open");
      });
      dropdown.classList.add("open");
    }

    function closeDropdownDelayed() {
      closeTimeout = setTimeout(function () {
        dropdown.classList.remove("open");
      }, 300);
    }

    var newGroup = group.cloneNode(true);
    group.parentNode.replaceChild(newGroup, group);

    var newDropdown = newGroup.querySelector(".dropdown-menu");
    var newButton = newGroup.querySelector(".classy-btn");

    if (!newDropdown || !newButton) return;

    newGroup.addEventListener("mouseenter", openDropdown);
    newGroup.addEventListener("mouseleave", closeDropdownDelayed);
    newDropdown.addEventListener("mouseenter", openDropdown);
    newDropdown.addEventListener("mouseleave", closeDropdownDelayed);

    newButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (newDropdown.classList.contains("open")) {
        newDropdown.classList.remove("open");
      } else {
        openDropdown();
      }
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".nav-group")) {
      document.querySelectorAll(".dropdown-menu.open").forEach(function (d) {
        d.classList.remove("open");
      });
    }
  });
}

// ============ PAGE ROUTER ============
function loadPageData(page) {
  console.log("📄 Loading data for page:", page);

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
    default:
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

  var skipActions = [
    "Page Visit",
    "Message Check",
    "Wallpaper Applied",
    "Search",
    "Filter",
  ];
  if (skipActions.indexOf(action) !== -1) return;

  API.addAuditLog(school, {
    user: user.name,
    userEmail: user.email,
    action: action,
    details: details,
  }).catch(function (error) {
    console.error("Audit log error:", error);
  });
}

// ============ MESSAGE NOTIFICATIONS ============
function checkUnreadMessages() {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  API.getChatMessages(school, user.email, user.email)
    .then(function (messages) {
      unreadMessagesCount = messages ? messages.length : 0;
      var badges = document.querySelectorAll(
        ".message-badge, #communicationBadge",
      );
      badges.forEach(function (badge) {
        if (unreadMessagesCount > 0) {
          badge.textContent = unreadMessagesCount;
          badge.style.display = "flex";
        } else {
          badge.style.display = "none";
        }
      });
    })
    .catch(function (error) {
      console.error("Message check error:", error);
    });
}

// ============ DASHBOARD ============
function loadDashboardData() {
  console.log("📊 Loading dashboard data...");

  var school = getCurrentSchool();
  if (!school) {
    console.error("❌ No school found in session");
    return;
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
      API.getSchool(school)
        .then(function (schoolInfo) {
          if (schoolInfo && schoolInfo.inviteCode) {
            var codeEl = document.getElementById("inviteCode");
            var bannerEl = document.getElementById("inviteCodeBanner");
            if (codeEl) codeEl.textContent = schoolInfo.inviteCode;
            if (bannerEl) bannerEl.style.display = "block";
          }
        })
        .catch(function (error) {
          console.error("School info error:", error);
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
    API.getFees(school),
  ])
    .then(function (results) {
      console.log("✅ Dashboard data loaded successfully");

      var books = results[0] || [];
      var students = results[1] || [];
      var borrowed = results[2] || [];
      var furniture = results[3] || [];
      var teachers = results[4] || [];
      var classes = results[5] || [];
      var events = results[6] || [];
      var fees = results[7] || [];

      var totalBooks = books.reduce(function (s, b) {
        return s + (b.quantity || 0);
      }, 0);
      var availableBooks = books.reduce(function (s, b) {
        return s + (b.available || 0);
      }, 0);
      animateNumber("totalBooks", totalBooks);
      animateNumber("availableBooks", availableBooks);

      var totalStudents = students.length;
      var seenAdms = {};
      students.forEach(function (s) {
        if (s.adm) seenAdms[s.adm] = true;
      });
      classes.forEach(function (c) {
        (c.students || []).forEach(function (st) {
          var adm = st.ADM || st.adm || "";
          if (adm && !seenAdms[adm]) {
            seenAdms[adm] = true;
            totalStudents++;
          }
        });
      });
      animateNumber("totalStudents", totalStudents);

      var activeLoans = borrowed.filter(function (b) {
        return !b.returned;
      });
      animateNumber("activeLoans", activeLoans.length);

      var overdue = activeLoans.filter(function (b) {
        return isOverdue(b.returnDate);
      });
      animateNumber("overdueBooks", overdue.length);
      animateNumber("activeFurniture", furniture.length);

      var teachersStat = document.getElementById("totalTeachersStat");
      var classesStat = document.getElementById("totalClassesStat");
      if (teachersStat) teachersStat.textContent = teachers.length;
      if (classesStat) classesStat.textContent = classes.length;

      var today = new Date().toISOString().split("T")[0];
      var upcomingEvents = events.filter(function (e) {
        return e.eventDate >= today;
      });
      var upcomingEl = document.getElementById("upcomingEventsStat");
      if (upcomingEl) upcomingEl.textContent = upcomingEvents.length;

      var totalBalance = fees.reduce(function (s, f) {
        return s + (f.balance || 0);
      }, 0);
      var outstandingEl = document.getElementById("outstandingFeesStat");
      if (outstandingEl)
        outstandingEl.textContent = "KES " + formatNumber(totalBalance);

      // Calculate return rate
      var returned = borrowed.filter(function (b) {
        return b.returned;
      });
      var returnRate =
        borrowed.length > 0
          ? Math.round((returned.length / borrowed.length) * 100)
          : 0;
      var rateEl = document.getElementById("returnRateStat");
      if (rateEl) rateEl.textContent = returnRate + "%";

      displayRecentActivity(borrowed, furniture);
    })
    .catch(function (err) {
      console.error("❌ Dashboard data error:", err);
      var recentEl = document.getElementById("recentActivity");
      if (recentEl) {
        recentEl.innerHTML =
          '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Could not load activity</p></div>';
      }
    });
}

function displayRecentActivity(borrowed, furniture) {
  var activityList = document.getElementById("recentActivity");
  if (!activityList) return;

  var activities = [];

  (borrowed || []).slice(0, 10).forEach(function (b) {
    activities.push({
      icon: "fa-book",
      color: "rgba(233, 69, 96, 0.2)",
      text:
        "<strong>" +
        (b.studentName || "Unknown") +
        '</strong> borrowed "' +
        (b.bookTitle || "") +
        '"',
      time: b.createdAt || new Date().toISOString(),
    });
  });

  (furniture || []).slice(0, 10).forEach(function (f) {
    activities.push({
      icon: "fa-chair",
      color: "rgba(255, 193, 7, 0.2)",
      text:
        "<strong>" +
        (f.studentName || "Unknown") +
        "</strong> allocated " +
        (f.chairNo || ""),
      time: f.createdAt || new Date().toISOString(),
    });
  });

  activities.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  activities = activities.slice(0, 8);

  if (activities.length === 0) {
    activityList.innerHTML =
      '<div class="empty-state"><i class="fas fa-inbox"></i><p>No recent activity</p></div>';
    return;
  }

  var html = "";
  activities.forEach(function (a) {
    html +=
      '<div class="activity-item">' +
      '<div class="activity-icon" style="background:' +
      a.color +
      ';"><i class="fas ' +
      a.icon +
      '"></i></div>' +
      '<div><div class="activity-text">' +
      a.text +
      "</div>" +
      '<div class="activity-time">' +
      formatDateTime(a.time) +
      "</div></div>" +
      "</div>";
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
    var currentValue = Math.round(
      startValue + (targetValue - startValue) * eased,
    );
    element.textContent = currentValue;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ============ LIBRARY ============
function loadLibraryData() {
  console.log("📚 Loading library data...");

  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([
    API.getBooks(school),
    API.getBorrowed(school),
    API.getClasses(school),
  ])
    .then(function (results) {
      console.log("✅ Library data loaded");

      var books = results[0] || [];
      var borrowed = results[1] || [];
      var classes = results[2] || [];

      var booksTbody = document.getElementById("booksTableBody");
      if (booksTbody) {
        if (books.length === 0) {
          booksTbody.innerHTML =
            '<tr><td colspan="7" style="text-align:center;">No books in catalog</td></tr>';
        } else {
          var booksHtml = "";
          books.forEach(function (b) {
            booksHtml +=
              "<tr><td>" +
              (b.title || "-") +
              "</td><td>" +
              (b.author || "-") +
              "</td><td>" +
              (b.type || "-") +
              "</td><td>" +
              (b.subject || "-") +
              "</td><td>" +
              (b.quantity || 0) +
              "</td><td>" +
              (b.available || 0) +
              '</td><td><button class="btn btn-sm btn-danger" onclick="deleteBook(\'' +
              b.id +
              '\')"><i class="fas fa-trash"></i></button></td></tr>';
          });
          booksTbody.innerHTML = booksHtml;
        }

        var select = document.getElementById("issueBookTitle");
        if (select) {
          var selectHtml = '<option value="">Select Book</option>';
          books.forEach(function (b) {
            if (b.available > 0)
              selectHtml +=
                '<option value="' +
                b.title +
                '">' +
                b.title +
                " (" +
                b.available +
                ")</option>";
          });
          select.innerHTML = selectHtml;
        }

        var bulkSelect = document.getElementById("bulkBookTitle");
        if (bulkSelect) {
          var bulkHtml = '<option value="">Select Book</option>';
          books.forEach(function (b) {
            if (b.available > 0)
              bulkHtml +=
                '<option value="' +
                b.title +
                '">' +
                b.title +
                " (" +
                b.available +
                ")</option>";
          });
          bulkSelect.innerHTML = bulkHtml;
        }
      }

      var returnsTbody = document.getElementById("returnsTableBody");
      if (returnsTbody) {
        var active = borrowed.filter(function (b) {
          return !b.returned;
        });
        if (active.length === 0) {
          returnsTbody.innerHTML =
            '<tr><td colspan="7" style="text-align:center;">No active loans</td></tr>';
        } else {
          var returnsHtml = "";
          active.forEach(function (b) {
            var overdue = isOverdue(b.returnDate);
            var badge = overdue
              ? '<span class="badge badge-danger">Overdue</span>'
              : '<span class="badge badge-success">Active</span>';
            returnsHtml +=
              "<tr><td>" +
              (b.studentName || "-") +
              "</td><td>" +
              (b.adm || "-") +
              "</td><td>" +
              (b.bookTitle || "-") +
              "</td><td>" +
              (b.bookNo || "-") +
              "</td><td>" +
              (b.returnDate || "-") +
              "</td><td>" +
              badge +
              '</td><td><button class="btn btn-sm btn-success" onclick="returnBook(\'' +
              b.id +
              '\')"><i class="fas fa-undo"></i> Return</button></td></tr>';
          });
          returnsTbody.innerHTML = returnsHtml;
        }
      }

      var borrowedTbody = document.getElementById("borrowedTableBody");
      if (borrowedTbody) {
        if (borrowed.length === 0) {
          borrowedTbody.innerHTML =
            '<tr><td colspan="5" style="text-align:center;">No records</td></tr>';
        } else {
          var borrowedHtml = "";
          borrowed.forEach(function (b) {
            var status = b.returned
              ? '<span class="badge badge-success">Returned</span>'
              : '<span class="badge badge-warning">Active</span>';
            borrowedHtml +=
              "<tr><td>" +
              (b.studentName || "-") +
              "</td><td>" +
              (b.bookTitle || "-") +
              "</td><td>" +
              (b.borrowDate || "-") +
              "</td><td>" +
              (b.returnDate || "-") +
              "</td><td>" +
              status +
              "</td></tr>";
          });
          borrowedTbody.innerHTML = borrowedHtml;
        }
      }

      var bulkClassSelect = document.getElementById("bulkBookClass");
      if (bulkClassSelect) {
        var classHtml = '<option value="">Select Class</option>';
        classes.forEach(function (c) {
          classHtml +=
            '<option value="' +
            c.id +
            '">' +
            (c.name || "") +
            " " +
            (c.stream || "") +
            " (" +
            (c.students ? c.students.length : 0) +
            ")</option>";
        });
        bulkClassSelect.innerHTML = classHtml;
      }
    })
    .catch(function (err) {
      console.error("❌ Library data error:", err);
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
    author: document.getElementById("bookAuthor")
      ? document.getElementById("bookAuthor").value
      : "",
    type: document.getElementById("bookType")
      ? document.getElementById("bookType").value
      : "Textbook",
    subject: document.getElementById("bookSubject")
      ? document.getElementById("bookSubject").value
      : "",
    quantity: parseInt(
      document.getElementById("bookQuantity")
        ? document.getElementById("bookQuantity").value
        : 1,
    ),
    createdBy: user ? user.name : "",
  })
    .then(function (result) {
      if (result.success) {
        showNotification("Book added!", "success");
        logAction("Book Added", title.value);
        closeModal("addBookModal");
        if (document.getElementById("addBookForm"))
          document.getElementById("addBookForm").reset();
        loadLibraryData();
      } else {
        showNotification("Error: " + result.error, "error");
      }
    })
    .catch(function (error) {
      console.error("Add book error:", error);
      showNotification("Failed to add book", "error");
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

  if (
    !studentName ||
    !studentName.value ||
    !adm ||
    !adm.value ||
    !bookTitle ||
    !bookTitle.value ||
    !bookNo ||
    !bookNo.value
  ) {
    showNotification("Please fill in all required fields", "warning");
    return false;
  }

  API.issueBook(school, {
    studentName: studentName.value,
    adm: adm.value,
    bookTitle: bookTitle.value,
    bookNo: bookNo.value,
    borrowDate: document.getElementById("issueBorrowDate")
      ? document.getElementById("issueBorrowDate").value
      : getCurrentDate(),
    returnDate: document.getElementById("issueReturnDate")
      ? document.getElementById("issueReturnDate").value
      : addDays(getCurrentDate(), 14),
    issuedBy: user ? user.name : "",
  })
    .then(function (result) {
      if (result.success) {
        showNotification("Book issued!", "success");
        logAction("Book Issued", bookTitle.value);
        if (document.getElementById("issueBookForm"))
          document.getElementById("issueBookForm").reset();
        loadLibraryData();
      } else {
        showNotification("Error: " + result.error, "error");
      }
    })
    .catch(function (error) {
      console.error("Issue book error:", error);
      showNotification("Failed to issue book", "error");
    });
  return false;
}

function returnBook(borrowId) {
  if (!borrowId) return;

  DialogSystem.confirm("Return this book? The record will be deleted.", {
    title: "Return Book",
    type: "info",
    confirmText: "Return",
    cancelText: "Cancel",
  }).then(function (confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.returnBook(school, borrowId)
      .then(function (result) {
        if (result.success) {
          showNotification("Book returned!", "success");
          logAction("Book Returned", borrowId);
          loadLibraryData();
        } else {
          showNotification("Error: " + result.error, "error");
        }
      })
      .catch(function (error) {
        console.error("Return book error:", error);
        showNotification("Failed to return book", "error");
      });
  });
}

function deleteBook(bookId) {
  if (!bookId) return;

  DialogSystem.confirm("Delete this book?", {
    title: "Delete Book",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel",
  }).then(function (confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.deleteBook(school, bookId)
      .then(function (result) {
        if (result.success) {
          showNotification("Book deleted!", "success");
          logAction("Book Deleted", bookId);
          loadLibraryData();
        } else {
          showNotification("Error: " + result.error, "error");
        }
      })
      .catch(function (error) {
        console.error("Delete book error:", error);
        showNotification("Failed to delete book", "error");
      });
  });
}

// ============ BULK BOOK ISSUE ============
function loadClassStudentsForBooks() {
  var school = getCurrentSchool();
  var classId = document.getElementById("bulkBookClass");
  if (!classId || !classId.value) return;

  API.getClasses(school).then(function (classes) {
    var selectedClass = null;
    classes.forEach(function (c) {
      if (c.id === classId.value) selectedClass = c;
    });

    if (selectedClass && selectedClass.students) {
      bulkBookClass = selectedClass;
      var container = document.getElementById("bulkBookStudents");
      if (!container) return;

      var html =
        '<h4 style="color:#d4af37;margin-bottom:15px;">Students (' +
        selectedClass.students.length +
        ")</h4>";

      selectedClass.students.forEach(function (student) {
        var name =
          student.Name || student.name || student["Full Name"] || "Unknown";
        var adm = student.ADM || student.adm || student["ADM No"] || "";

        html +=
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
          '<span style="flex:1;">' +
          name +
          " (" +
          adm +
          ")</span>" +
          '<input type="text" class="book-number-input" placeholder="Book No" data-adm="' +
          adm +
          '" data-name="' +
          name +
          '" style="width:120px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">' +
          "</div>";
      });

      html +=
        '<button class="btn btn-primary" style="width:100%;margin-top:15px;" onclick="issueBulkBooks()"><i class="fas fa-book"></i> Issue to All</button>';
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
  var bDate =
    borrowDate && borrowDate.value ? borrowDate.value : getCurrentDate();
  var rDate =
    returnDate && returnDate.value
      ? returnDate.value
      : addDays(getCurrentDate(), 14);

  var bookInputs = document.querySelectorAll(".book-number-input");
  var issued = 0;
  var promises = [];

  bookInputs.forEach(function (input) {
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
          issuedBy: user ? user.name : "",
        }),
      );
      issued++;
    }
  });

  if (promises.length === 0) {
    showNotification("No book numbers entered", "warning");
    return;
  }

  Promise.all(promises)
    .then(function () {
      showNotification("Issued books to " + issued + " students!", "success");
      logAction("Bulk Book Issue", issued + " students");
      closeModal("bulkBookModal");
      loadLibraryData();
    })
    .catch(function (error) {
      console.error("Bulk issue error:", error);
      showNotification("Failed to issue books", "error");
    });
}

// ============ STUDENTS ============
function loadStudentsData() {
  console.log("👥 Loading students data...");

  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([API.getStudents(school), API.getClasses(school)])
    .then(function (results) {
      console.log("✅ Students data loaded");

      var students = results[0] || [];
      var classes = results[1] || [];

      var allStudents = [];
      var seenAdms = {};

      students.forEach(function (s) {
        if (s.adm && !seenAdms[s.adm]) {
          seenAdms[s.adm] = true;
          allStudents.push(s);
        }
      });

      classes.forEach(function (c) {
        (c.students || []).forEach(function (st) {
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
              parentPhone: st["Parent Phone"] || "",
            });
          }
        });
      });

      allStudentsCache = allStudents;

      var tbody = document.getElementById("studentsTableBody");
      if (tbody) {
        if (allStudents.length === 0) {
          tbody.innerHTML =
            '<tr><td colspan="7" style="text-align:center;">No students found</td></tr>';
        } else {
          var html = "";
          allStudents.slice(0, 100).forEach(function (s) {
            var hasQR = s.qrCode ? "✅" : "❌";
            html +=
              "<tr><td>" +
              (s.name || "-") +
              "</td><td>" +
              (s.adm || "-") +
              "</td><td>" +
              (s.form || "-") +
              "</td><td>" +
              (s.stream || "-") +
              "</td><td>" +
              (s.gender || "-") +
              "</td><td>" +
              hasQR +
              '</td><td><button class="btn btn-sm btn-danger" onclick="deleteStudent(\'' +
              s.adm +
              '\')"><i class="fas fa-trash"></i></button></td></tr>';
          });
          tbody.innerHTML = html;
        }
      }
    })
    .catch(function (err) {
      console.error("❌ Students data error:", err);
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
    form: document.getElementById("studentForm")
      ? document.getElementById("studentForm").value
      : "",
    stream: document.getElementById("studentStream")
      ? document.getElementById("studentStream").value
      : "",
    gender: document.getElementById("studentGender")
      ? document.getElementById("studentGender").value
      : "",
    dob: document.getElementById("studentDOB")
      ? document.getElementById("studentDOB").value
      : "",
    parentName: document.getElementById("studentParentName")
      ? document.getElementById("studentParentName").value
      : "",
    parentPhone: document.getElementById("studentParentPhone")
      ? document.getElementById("studentParentPhone").value
      : "",
    parentEmail: document.getElementById("studentParentEmail")
      ? document.getElementById("studentParentEmail").value
      : "",
    addedBy: user ? user.name : "",
  })
    .then(function (result) {
      if (result.success) {
        showNotification("Student added!", "success");
        logAction("Student Added", name.value);
        closeModal("addStudentModal");
        if (document.getElementById("addStudentForm"))
          document.getElementById("addStudentForm").reset();
        loadStudentsData();
      } else {
        showNotification("Error: " + result.error, "error");
      }
    })
    .catch(function (error) {
      console.error("Add student error:", error);
      showNotification("Failed to add student", "error");
    });
  return false;
}

function deleteStudent(adm) {
  if (!adm) return;

  DialogSystem.confirm("Delete this student?", {
    title: "Delete Student",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel",
  }).then(function (confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.deleteStudent(school, adm)
      .then(function (result) {
        if (result.success) {
          showNotification("Student deleted!", "success");
          logAction("Student Deleted", adm);
          loadStudentsData();
        } else {
          showNotification("Error: " + result.error, "error");
        }
      })
      .catch(function (error) {
        console.error("Delete student error:", error);
        showNotification("Failed to delete student", "error");
      });
  });
}

// ============ FURNITURE ============
function loadFurnitureData() {
  console.log("🪑 Loading furniture data...");

  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([API.getFurniture(school), API.getClasses(school)])
    .then(function (results) {
      console.log("✅ Furniture data loaded");

      var furniture = results[0] || [];
      var classes = results[1] || [];

      var totalEl = document.getElementById("totalFurnitureStat");
      var activeEl = document.getElementById("activeFurnitureStat");
      if (totalEl) totalEl.textContent = furniture.length;
      if (activeEl) activeEl.textContent = furniture.length;

      var activeList = document.getElementById("activeFurnitureList");
      if (activeList) {
        if (furniture.length === 0) {
          activeList.innerHTML =
            '<p style="text-align:center;color:rgba(255,255,255,0.5);">No active allocations</p>';
        } else {
          var html = "";
          furniture.slice(0, 50).forEach(function (f) {
            html +=
              '<div class="furniture-card">' +
              '<span class="status-badge status-active">Active</span>' +
              '<div class="furniture-icon"><i class="fas fa-chair"></i></div>' +
              '<div class="furniture-student-name">' +
              (f.studentName || "-") +
              "</div>" +
              '<div class="furniture-adm">' +
              (f.adm || "-") +
              "</div>" +
              '<div class="furniture-details">' +
              '<div class="furniture-detail-item"><div class="furniture-detail-label">Chair</div><div class="furniture-detail-value">' +
              (f.chairNo || "-") +
              "</div></div>" +
              '<div class="furniture-detail-item"><div class="furniture-detail-label">Locker</div><div class="furniture-detail-value">' +
              (f.lockerNo || "-") +
              "</div></div>" +
              "</div>" +
              '<button class="btn-return" onclick="returnFurnitureItem(\'' +
              f.id +
              '\')"><i class="fas fa-undo"></i> Return</button>' +
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
        classes.forEach(function (c) {
          classHtml +=
            '<option value="' +
            c.id +
            '">' +
            (c.name || "") +
            " " +
            (c.stream || "") +
            " (" +
            (c.students ? c.students.length : 0) +
            ")</option>";
        });
        bulkClassSelect.innerHTML = classHtml;
      }
    })
    .catch(function (err) {
      console.error("❌ Furniture data error:", err);
    });
}

function allocateFurniture(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var studentName = document.getElementById("furnitureStudentName");
  var adm = document.getElementById("furnitureADM");
  var chairNo = document.getElementById("chairNumber");

  if (
    !studentName ||
    !studentName.value ||
    !adm ||
    !adm.value ||
    !chairNo ||
    !chairNo.value
  ) {
    showNotification(
      "Student name, ADM, and Chair number are required",
      "warning",
    );
    return false;
  }

  API.allocateFurniture(school, {
    studentName: studentName.value,
    adm: adm.value,
    form: document.getElementById("furnitureForm")
      ? document.getElementById("furnitureForm").value
      : "",
    stream: document.getElementById("furnitureStream")
      ? document.getElementById("furnitureStream").value
      : "",
    chairNo: chairNo.value,
    lockerNo: document.getElementById("lockerNumber")
      ? document.getElementById("lockerNumber").value
      : "",
    allocationDate: document.getElementById("furnitureAllocationDate")
      ? document.getElementById("furnitureAllocationDate").value
      : getCurrentDate(),
    issuedBy: user ? user.name : "",
  })
    .then(function (result) {
      if (result.success) {
        showNotification("Furniture allocated!", "success");
        logAction("Furniture Allocated", studentName.value);
        closeModal("allocateModal");
        loadFurnitureData();
      } else {
        showNotification("Error: " + result.error, "error");
      }
    })
    .catch(function (error) {
      console.error("Allocate furniture error:", error);
      showNotification("Failed to allocate furniture", "error");
    });
  return false;
}

function returnFurnitureItem(furnitureId) {
  if (!furnitureId) return;

  DialogSystem.confirm("Return this furniture? The record will be deleted.", {
    title: "Return Furniture",
    type: "info",
    confirmText: "Return",
    cancelText: "Cancel",
  }).then(function (confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.returnFurniture(school, furnitureId)
      .then(function (result) {
        if (result.success) {
          showNotification("Furniture returned!", "success");
          logAction("Furniture Returned", furnitureId);
          loadFurnitureData();
        } else {
          showNotification("Error: " + result.error, "error");
        }
      })
      .catch(function (error) {
        console.error("Return furniture error:", error);
        showNotification("Failed to return furniture", "error");
      });
  });
}

function loadClassStudentsForFurniture() {
  var school = getCurrentSchool();
  var classId = document.getElementById("bulkFurnitureClass");
  if (!classId || !classId.value) return;

  API.getClasses(school).then(function (classes) {
    var selectedClass = null;
    classes.forEach(function (c) {
      if (c.id === classId.value) selectedClass = c;
    });

    if (selectedClass && selectedClass.students) {
      bulkFurnitureClass = selectedClass;
      var container = document.getElementById("bulkFurnitureStudents");
      if (!container) return;

      var html =
        '<h4 style="color:#d4af37;margin-bottom:15px;">Students (' +
        selectedClass.students.length +
        ")</h4>";

      selectedClass.students.forEach(function (student) {
        var name =
          student.Name || student.name || student["Full Name"] || "Unknown";
        var adm = student.ADM || student.adm || student["ADM No"] || "";

        html +=
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
          '<span style="flex:1;">' +
          name +
          " (" +
          adm +
          ")</span>" +
          '<input type="text" class="furniture-chair-input" placeholder="Chair No" data-adm="' +
          adm +
          '" style="width:100px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">' +
          '<input type="text" class="furniture-locker-input" placeholder="Locker No" data-adm="' +
          adm +
          '" style="width:100px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;">' +
          "</div>";
      });

      html +=
        '<button class="btn btn-primary" style="width:100%;margin-top:15px;" onclick="allocateBulkFurniture()"><i class="fas fa-chair"></i> Allocate to All</button>';
      container.innerHTML = html;
    }
  });
}

function allocateBulkFurniture() {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  var allocationDate = document.getElementById("bulkFurnitureDate");
  var allocDate =
    allocationDate && allocationDate.value
      ? allocationDate.value
      : getCurrentDate();

  var chairInputs = document.querySelectorAll(".furniture-chair-input");
  var lockerInputs = document.querySelectorAll(".furniture-locker-input");
  var allocated = 0;
  var promises = [];

  chairInputs.forEach(function (chairInput, index) {
    if (chairInput.value) {
      var adm = chairInput.dataset.adm;
      var lockerNo = lockerInputs[index] ? lockerInputs[index].value : "";

      var student = null;
      if (bulkFurnitureClass && bulkFurnitureClass.students) {
        bulkFurnitureClass.students.forEach(function (s) {
          var sAdm = s.ADM || s.adm || s["ADM No"] || "";
          if (sAdm === adm) student = s;
        });
      }

      if (student) {
        var name =
          student.Name || student.name || student["Full Name"] || "Unknown";
        promises.push(
          API.allocateFurniture(school, {
            studentName: name,
            adm: adm,
            form: bulkFurnitureClass.name,
            stream: bulkFurnitureClass.stream || "",
            chairNo: chairInput.value,
            lockerNo: lockerNo,
            allocationDate: allocDate,
            issuedBy: user ? user.name : "",
          }),
        );
        allocated++;
      }
    }
  });

  if (promises.length === 0) {
    showNotification("No chair numbers entered", "warning");
    return;
  }

  Promise.all(promises)
    .then(function () {
      showNotification(
        "Allocated furniture to " + allocated + " students!",
        "success",
      );
      logAction("Bulk Furniture Allocation", allocated + " students");
      closeModal("bulkFurnitureModal");
      loadFurnitureData();
    })
    .catch(function (error) {
      console.error("Bulk furniture error:", error);
      showNotification("Failed to allocate furniture", "error");
    });
}

// ============ CHAT ============
function loadChatUsers() {
  var school = getCurrentSchool();
  if (!school) return;

  API.getUsers(school)
    .then(function (users) {
      var currentUser = getCurrentUser();
      var userList = document.getElementById("chatUserList");
      if (!userList) return;

      var html = "";
      (users || []).forEach(function (u) {
        if (u.email !== currentUser.email) {
          html +=
            '<button class="chat-user-btn" onclick="selectChatUser(\'' +
            u.email +
            "', '" +
            u.name +
            "')\">" +
            '<div style="width:35px;height:35px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#f0d060);display:flex;align-items:center;justify-content:center;font-weight:700;color:#0a0e27;">' +
            getInitials(u.name) +
            "</div>" +
            '<div style="flex:1;text-align:left;"><div style="font-weight:600;">' +
            (u.name || "") +
            '</div><small style="color:rgba(255,255,255,0.5);">' +
            (u.role || "") +
            "</small></div>" +
            "</button>";
        }
      });
      userList.innerHTML =
        html ||
        '<p style="color:rgba(255,255,255,0.5);text-align:center;">No other users</p>';
    })
    .catch(function (error) {
      console.error("Load chat users error:", error);
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
    API.markMessagesAsRead(school, user.email, email)
      .then(function () {
        checkUnreadMessages();
      })
      .catch(function (error) {
        console.error("Mark read error:", error);
      });
  }
}

function loadChatMessages() {
  if (!currentChatUserEmail) return;
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  API.getChatMessages(school, user.email, currentChatUserEmail)
    .then(function (messages) {
      var container = document.getElementById("chatMessages");
      if (!container) return;

      if (!messages || messages.length === 0) {
        container.innerHTML =
          '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">No messages yet</p>';
        return;
      }

      var html = "";
      messages.forEach(function (msg) {
        var isMine = msg.fromEmail === user.email;
        var bg = isMine ? "rgba(233,69,96,0.4)" : "rgba(255,255,255,0.15)";
        var align = isMine ? "flex-end" : "flex-start";
        html +=
          '<div style="display:flex;justify-content:' +
          align +
          ';margin:8px 0;">' +
          '<div style="background:' +
          bg +
          ';padding:10px 16px;border-radius:16px;max-width:70%;">' +
          "<strong>" +
          (msg.fromName || "") +
          ":</strong> " +
          (msg.message || "") +
          "<br><small>" +
          formatTime(msg.timestamp) +
          "</small>" +
          "</div></div>";
      });
      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    })
    .catch(function (error) {
      console.error("Load messages error:", error);
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
    message: input.value.trim(),
  })
    .then(function (result) {
      if (result.success) {
        input.value = "";
        loadChatMessages();
      } else {
        showNotification("Error: " + result.error, "error");
      }
    })
    .catch(function (error) {
      console.error("Send message error:", error);
      showNotification("Failed to send message", "error");
    });
  return false;
}

// ============ FORUM ============
function loadForumMessages() {
  var school = getCurrentSchool();
  if (!school) return;

  API.getForumMessages(school)
    .then(function (messages) {
      var container = document.getElementById("forumMessages");
      if (!container) return;

      if (!messages || messages.length === 0) {
        container.innerHTML =
          '<p style="text-align:center;color:rgba(255,255,255,0.5);">No messages</p>';
        return;
      }

      var html = "";
      messages.forEach(function (msg) {
        html +=
          '<div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:12px;margin:10px 0;">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
          "<strong>" +
          (msg.fromName || "") +
          "</strong><small>" +
          formatDateTime(msg.timestamp) +
          "</small></div>" +
          '<p style="margin:0;">' +
          (msg.message || "") +
          "</p></div>";
      });
      container.innerHTML = html;
    })
    .catch(function (error) {
      console.error("Load forum error:", error);
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
    message: input.value.trim(),
  })
    .then(function (result) {
      if (result.success) {
        input.value = "";
        loadForumMessages();
        showNotification("Posted!", "success");
      } else {
        showNotification("Error: " + result.error, "error");
      }
    })
    .catch(function (error) {
      console.error("Post forum error:", error);
      showNotification("Failed to post", "error");
    });
  return false;
}

// ============ NOTEPAD ============
function loadNotes() {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  API.getNotes(school, user.email)
    .then(function (notes) {
      allNotesCache = notes || [];
      var container = document.getElementById("notesList");
      if (!container) return;

      if (notes.length === 0) {
        container.innerHTML =
          '<p style="text-align:center;color:rgba(255,255,255,0.5);">No notes yet</p>';
        return;
      }

      var html = "";
      notes.forEach(function (note) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = note.content || "";
        var preview = tempDiv.textContent.substring(0, 100) + "...";

        html +=
          '<div class="note-card">' +
          "<h4>" +
          (note.title || "Untitled") +
          "</h4>" +
          "<p>" +
          preview +
          "</p>" +
          "<small>" +
          formatDateTime(note.timestamp) +
          "</small>" +
          '<div style="margin-top:10px;display:flex;gap:8px;">' +
          '<button class="btn btn-sm btn-primary" onclick="loadNoteForEdit(\'' +
          note.id +
          '\')"><i class="fas fa-edit"></i> Edit</button>' +
          '<button class="btn btn-sm btn-danger" onclick="deleteNote(\'' +
          note.id +
          '\')"><i class="fas fa-trash"></i></button>' +
          "</div></div>";
      });
      container.innerHTML = html;
    })
    .catch(function (error) {
      console.error("Load notes error:", error);
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
    noteId: currentNoteId || null,
  })
    .then(function (result) {
      if (result.success) {
        showNotification("Note saved!", "success");
        logAction("Note Saved", title);
        if (titleEl) titleEl.value = "";
        if (contentEl) contentEl.innerHTML = "";
        currentNoteId = null;
        loadNotes();
      } else {
        showNotification("Error: " + result.error, "error");
      }
    })
    .catch(function (error) {
      console.error("Save note error:", error);
      showNotification("Failed to save note", "error");
    });
  return false;
}

function deleteNote(noteId) {
  if (!noteId) return;

  DialogSystem.confirm("Delete this note?", {
    title: "Delete Note",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel",
  }).then(function (confirmed) {
    if (confirmed !== "confirm") return;

    var school = getCurrentSchool();
    API.deleteNote(school, noteId)
      .then(function (result) {
        if (result.success) {
          showNotification("Note deleted!", "success");
          loadNotes();
        } else {
          showNotification("Error: " + result.error, "error");
        }
      })
      .catch(function (error) {
        console.error("Delete note error:", error);
        showNotification("Failed to delete note", "error");
      });
  });
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
