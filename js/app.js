// ============================================
// SRMS - Complete Application Logic
// Full Version - PERFORMANCE OPTIMIZED
// ============================================

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

  var user = checkAuth();
  if (!user) return;

  var page = window.location.pathname.split("/").pop() || "dashboard.html";
  if (page === "") page = "dashboard.html";

  initDropdownController();

  setTimeout(function () {
    loadPageData(page);
  }, 300);

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

    function closeDropdown() {
      closeTimeout = setTimeout(function () {
        dropdown.classList.remove("open");
      }, 150);
    }

    function cancelClose() {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
    }

    group.addEventListener("mouseenter", function () {
      cancelClose();
      openDropdown();
    });

    group.addEventListener("mouseleave", function (e) {
      var related = e.relatedTarget;
      if (related && group.contains(related)) return;
      closeDropdown();
    });

    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (dropdown.classList.contains("open")) {
        dropdown.classList.remove("open");
      } else {
        openDropdown();
      }
    });

    dropdown
      .querySelectorAll(".dropdown-item, a.dropdown-item")
      .forEach(function (item) {
        item.addEventListener("click", function () {
          dropdown.classList.remove("open");
        });
      });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".nav-group")) {
      document.querySelectorAll(".dropdown-menu.open").forEach(function (d) {
        d.classList.remove("open");
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".dropdown-menu.open").forEach(function (d) {
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
      if (document.getElementById("welcomeUserName")) loadDashboardData();
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
  }).catch(function () {});
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
    .catch(function () {});
}

// ============ DASHBOARD ============
function loadDashboardData() {
  var school = getCurrentSchool();
  if (!school) return;

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
        .catch(function () {});
    }
  }

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
          var adm = extractAdm(st);
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
      console.error("Dashboard error:", err);
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
      "</div></div></div>";
  });
  activityList.innerHTML = html;
}

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
    if (progress < 1) requestAnimationFrame(update);
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
    API.getClasses(school),
  ])
    .then(function (results) {
      var books = results[0] || [];
      var borrowed = results[1] || [];
      var classes = results[2] || [];

      var booksTbody = document.getElementById("booksTableBody");
      if (booksTbody) {
        if (books.length === 0) {
          booksTbody.innerHTML =
            '<tr><td colspan="7" style="text-align:center;">No books</td></tr>';
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
      console.error("Library error:", err);
    });
}

function addBook(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();
  var title = document.getElementById("bookTitle");
  if (!title || !title.value) {
    showNotification("Book title required", "warning");
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
        closeModal("addBookModal");
        loadLibraryData();
      }
    })
    .catch(function () {});
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
    showNotification("Please fill all required fields", "warning");
    return false;
  }

  API.issueBook(school, {
    studentName: studentName.value,
    adm: adm.value,
    bookTitle: bookTitle.value,
    bookNo: bookNo.value,
    issuedBy: user ? user.name : "",
  })
    .then(function (result) {
      if (result.success) {
        showNotification("Book issued!", "success");
        loadLibraryData();
      }
    })
    .catch(function () {});
  return false;
}

function returnBook(borrowId) {
  if (!borrowId) return;
  if (typeof DialogSystem !== "undefined" && DialogSystem.confirm) {
    DialogSystem.confirm("Return this book?", {
      title: "Return",
      type: "info",
      confirmText: "Return",
      cancelText: "Cancel",
    }).then(function (confirmed) {
      if (confirmed !== "confirm") return;
      var school = getCurrentSchool();
      API.returnBook(school, borrowId)
        .then(function () {
          showNotification("Book returned!", "success");
          loadLibraryData();
        })
        .catch(function () {});
    });
  } else {
    if (confirm("Return this book?")) {
      var school = getCurrentSchool();
      API.returnBook(school, borrowId)
        .then(function () {
          showNotification("Book returned!", "success");
          loadLibraryData();
        })
        .catch(function () {});
    }
  }
}

function deleteBook(bookId) {
  if (!bookId) return;
  if (typeof DialogSystem !== "undefined" && DialogSystem.confirm) {
    DialogSystem.confirm("Delete this book?", {
      title: "Delete",
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    }).then(function (confirmed) {
      if (confirmed !== "confirm") return;
      var school = getCurrentSchool();
      API.deleteBook(school, bookId)
        .then(function () {
          showNotification("Book deleted!", "success");
          loadLibraryData();
        })
        .catch(function () {});
    });
  } else {
    if (confirm("Delete this book?")) {
      var school = getCurrentSchool();
      API.deleteBook(school, bookId)
        .then(function () {
          showNotification("Book deleted!", "success");
          loadLibraryData();
        })
        .catch(function () {});
    }
  }
}

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
        var name = extractName(student);
        var adm = extractAdm(student);
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
          '" style="width:120px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;"></div>';
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
    showNotification("Select a book", "warning");
    return;
  }

  var bookInputs = document.querySelectorAll(".book-number-input");
  var issued = 0;
  var promises = [];

  bookInputs.forEach(function (input) {
    if (input.value) {
      promises.push(
        API.issueBook(school, {
          studentName: input.dataset.name,
          adm: input.dataset.adm,
          bookTitle: bookTitle.value,
          bookNo: input.value,
          issuedBy: user ? user.name : "",
        }),
      );
      issued++;
    }
  });

  if (promises.length === 0) return;

  Promise.all(promises)
    .then(function () {
      showNotification("Issued " + issued + " books!", "success");
      closeModal("bulkBookModal");
      loadLibraryData();
    })
    .catch(function () {});
}

// ============ STUDENTS ============
function loadStudentsData() {
  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([API.getStudents(school), API.getClasses(school)])
    .then(function (results) {
      var dbStudents = results[0] || [];
      var classes = results[1] || [];

      var allStudents = [];
      var seenAdms = {};

      dbStudents.forEach(function (s) {
        if (s.adm && !seenAdms[s.adm]) {
          seenAdms[s.adm] = true;
          s.source = "db";
          allStudents.push(s);
        }
      });

      classes.forEach(function (cls) {
        var classStudents = cls.students || [];
        classStudents.forEach(function (st) {
          var adm = extractAdm(st);
          var name = extractName(st);
          var gender = st.Gender || st.gender || st["Sex"] || st.sex || "";
          var stream = st.Stream || st.stream || cls.stream || "";
          var dob =
            st.DOB || st.dob || st["Date of Birth"] || st["DateOfBirth"] || "";
          var parentName =
            st["Parent Name"] ||
            st.parentName ||
            st["ParentName"] ||
            st["Parent/Guardian"] ||
            "";
          var parentPhone =
            st["Parent Phone"] ||
            st.parentPhone ||
            st["ParentPhone"] ||
            st["Parent Contact"] ||
            "";
          var parentEmail =
            st["Parent Email"] || st.parentEmail || st["ParentEmail"] || "";
          var studentId =
            st.studentId ||
            st.StudentID ||
            st["Student ID"] ||
            st["StudentID"] ||
            "";

          if (adm) adm = String(adm).trim();

          if (adm && !seenAdms[adm]) {
            seenAdms[adm] = true;
            allStudents.push({
              name: name,
              adm: adm,
              studentId: studentId,
              form: cls.name || st.Form || st.form || "",
              stream: stream,
              gender: gender,
              dob: dob,
              parentName: parentName,
              parentPhone: parentPhone,
              parentEmail: parentEmail,
              source: "class",
            });
          }
        });
      });

      allStudentsCache = allStudents;

      var tbody = document.getElementById("studentsTableBody");
      if (tbody) {
        if (allStudents.length === 0) {
          tbody.innerHTML =
            '<tr><td colspan="8" style="text-align:center;">No students found.</td></tr>';
        } else {
          var html = "";
          allStudents.slice(0, 200).forEach(function (s) {
            var sourceBadge =
              s.source === "db"
                ? '<span class="source-badge source-db">DB</span>'
                : '<span class="source-badge source-class">Class</span>';

            html +=
              "<tr>" +
              "<td>" +
              (s.name || "-") +
              "</td>" +
              "<td>" +
              (s.adm || "-") +
              "</td>" +
              "<td>" +
              (s.studentId || "-") +
              "</td>" +
              "<td>" +
              (s.form || "-") +
              "</td>" +
              "<td>" +
              (s.stream || "-") +
              "</td>" +
              "<td>" +
              (s.gender || "-") +
              "</td>" +
              "<td>" +
              sourceBadge +
              "</td>" +
              '<td><button class="btn btn-sm btn-danger" onclick="deleteStudent(\'' +
              s.adm +
              '\')"><i class="fas fa-trash"></i></button></td>' +
              "</tr>";
          });
          tbody.innerHTML = html;
        }
      }

      updateStudentStats(allStudents, dbStudents, classes);
    })
    .catch(function (err) {
      console.error("Students error:", err);
    });
}

function updateStudentStats(allStudents, dbStudents, classes) {
  var totalEl = document.getElementById("statTotal");
  var dbEl = document.getElementById("statFromDB");
  var classEl = document.getElementById("statFromClasses");
  var formsEl = document.getElementById("statForms");
  var streamsEl = document.getElementById("statStreams");

  var classStudentsCount = 0;
  var forms = {};
  var streams = {};

  classes.forEach(function (c) {
    if (c.name) forms[c.name] = true;
    if (c.stream) streams[c.stream] = true;
    classStudentsCount += (c.students || []).length;
  });

  allStudents.forEach(function (s) {
    if (s.form) forms[s.form] = true;
    if (s.stream) streams[s.stream] = true;
  });

  if (totalEl) totalEl.textContent = allStudents.length;
  if (dbEl) dbEl.textContent = dbStudents.length;
  if (classEl) classEl.textContent = classStudentsCount;
  if (formsEl) formsEl.textContent = Object.keys(forms).length;
  if (streamsEl) streamsEl.textContent = Object.keys(streams).length;
}

function addStudent(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();
  var name = document.getElementById("studentName");
  var adm = document.getElementById("studentADM");

  if (!name || !name.value || !adm || !adm.value) {
    showNotification("Name and ADM required", "warning");
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
        showNotification("Student added! ID: " + result.studentId, "success");
        closeModal("addStudentModal");
        loadStudentsData();
      } else {
        showNotification(result.error || "Failed", "error");
      }
    })
    .catch(function () {});
  return false;
}

function deleteStudent(adm) {
  if (!adm) return;
  if (typeof DialogSystem !== "undefined" && DialogSystem.confirm) {
    DialogSystem.confirm("Delete this student?", {
      title: "Delete",
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    }).then(function (confirmed) {
      if (confirmed !== "confirm") return;
      var school = getCurrentSchool();
      API.deleteStudent(school, adm)
        .then(function () {
          showNotification("Student deleted!", "success");
          loadStudentsData();
        })
        .catch(function () {});
    });
  } else {
    if (confirm("Delete this student?")) {
      var school = getCurrentSchool();
      API.deleteStudent(school, adm)
        .then(function () {
          showNotification("Student deleted!", "success");
          loadStudentsData();
        })
        .catch(function () {});
    }
  }
}

// ============ FURNITURE ============
function loadFurnitureData() {
  var school = getCurrentSchool();
  if (!school) return;

  Promise.all([API.getFurniture(school), API.getClasses(school)])
    .then(function (results) {
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
            '<p style="text-align:center;">No active allocations</p>';
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
              '\')"><i class="fas fa-undo"></i> Return</button></div>';
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
      console.error("Furniture error:", err);
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
    showNotification("Name, ADM, and Chair required", "warning");
    return false;
  }

  API.allocateFurniture(school, {
    studentName: studentName.value,
    adm: adm.value,
    chairNo: chairNo.value,
    lockerNo: document.getElementById("lockerNumber")
      ? document.getElementById("lockerNumber").value
      : "",
    issuedBy: user ? user.name : "",
  })
    .then(function (result) {
      if (result.success) {
        showNotification("Furniture allocated!", "success");
        closeModal("allocateModal");
        loadFurnitureData();
      }
    })
    .catch(function () {});
  return false;
}

function returnFurnitureItem(furnitureId) {
  if (!furnitureId) return;
  if (typeof DialogSystem !== "undefined" && DialogSystem.confirm) {
    DialogSystem.confirm("Return this furniture?", {
      title: "Return",
      type: "info",
      confirmText: "Return",
      cancelText: "Cancel",
    }).then(function (confirmed) {
      if (confirmed !== "confirm") return;
      var school = getCurrentSchool();
      API.returnFurniture(school, furnitureId)
        .then(function () {
          showNotification("Furniture returned!", "success");
          loadFurnitureData();
        })
        .catch(function () {});
    });
  } else {
    if (confirm("Return this furniture?")) {
      var school = getCurrentSchool();
      API.returnFurniture(school, furnitureId)
        .then(function () {
          showNotification("Furniture returned!", "success");
          loadFurnitureData();
        })
        .catch(function () {});
    }
  }
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
        '<h4 style="color:#d4af37;">Students (' +
        selectedClass.students.length +
        ")</h4>";
      selectedClass.students.forEach(function (student) {
        var name = extractName(student);
        var adm = extractAdm(student);
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
          '" style="width:100px;padding:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;"></div>';
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
          var sAdm = extractAdm(s);
          if (sAdm === adm) student = s;
        });
      }

      if (student) {
        var name = extractName(student);
        promises.push(
          API.allocateFurniture(school, {
            studentName: name,
            adm: adm,
            chairNo: chairInput.value,
            lockerNo: lockerNo,
            issuedBy: user ? user.name : "",
          }),
        );
        allocated++;
      }
    }
  });

  if (promises.length === 0) return;

  Promise.all(promises)
    .then(function () {
      showNotification("Allocated to " + allocated + " students!", "success");
      closeModal("bulkFurnitureModal");
      loadFurnitureData();
    })
    .catch(function () {});
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
            "</small></div></button>";
        }
      });
      userList.innerHTML =
        html ||
        '<p style="text-align:center;color:rgba(255,255,255,0.5);">No other users</p>';
    })
    .catch(function () {});
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
      .catch(function () {});
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
          '<p style="text-align:center;color:rgba(255,255,255,0.4);padding:20px;">No messages yet</p>';
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
          "</small></div></div>";
      });
      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    })
    .catch(function () {});
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
    .then(function () {
      input.value = "";
      loadChatMessages();
    })
    .catch(function () {});
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
    .catch(function () {});
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
    .then(function () {
      input.value = "";
      loadForumMessages();
      showNotification("Posted!", "success");
    })
    .catch(function () {});
  return false;
}

// ============ NOTES ============
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
          '<div class="note-card"><h4>' +
          (note.title || "Untitled") +
          "</h4><p>" +
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
          '\')"><i class="fas fa-trash"></i></button></div></div>';
      });
      container.innerHTML = html;
    })
    .catch(function () {});
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

  if (!content || content === "<br>") {
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
    .then(function () {
      showNotification("Note saved!", "success");
      if (titleEl) titleEl.value = "";
      if (contentEl) contentEl.innerHTML = "";
      currentNoteId = null;
      loadNotes();
    })
    .catch(function () {});
  return false;
}

function loadNoteForEdit(noteId) {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;
  API.getNotes(school, user.email).then(function (notes) {
    var found = null;
    notes.forEach(function (n) {
      if (n.id === noteId) found = n;
    });
    if (found) {
      currentNoteId = found.id;
      var titleEl = document.getElementById("noteTitle");
      var contentEl = document.getElementById("noteContent");
      if (titleEl) titleEl.value = found.title || "";
      if (contentEl) contentEl.innerHTML = found.content || "";
      showNotification("Loaded: " + (found.title || "Untitled"), "success");
    }
  });
}

function deleteNote(noteId) {
  if (!noteId) return;
  if (typeof DialogSystem !== "undefined" && DialogSystem.confirm) {
    DialogSystem.confirm("Delete this note?", {
      title: "Delete",
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    }).then(function (confirmed) {
      if (confirmed !== "confirm") return;
      var school = getCurrentSchool();
      API.deleteNote(school, noteId)
        .then(function () {
          showNotification("Note deleted!", "success");
          loadNotes();
        })
        .catch(function () {});
    });
  } else {
    if (confirm("Delete this note?")) {
      var school = getCurrentSchool();
      API.deleteNote(school, noteId)
        .then(function () {
          showNotification("Note deleted!", "success");
          loadNotes();
        })
        .catch(function () {});
    }
  }
}

// ============ EVENTS ============
function loadEvents() {
  var school = getCurrentSchool();
  if (!school) return;
  API.getEvents(school)
    .then(function (events) {
      var container = document.getElementById("eventsList");
      if (!container) return;

      if (!events || events.length === 0) {
        container.innerHTML =
          '<p style="text-align:center;color:rgba(255,255,255,0.5);">No events</p>';
        return;
      }

      events.sort(function (a, b) {
        return new Date(a.eventDate) - new Date(b.eventDate);
      });
      var html = "";
      events.forEach(function (event) {
        html +=
          '<div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:12px;margin:10px 0;border-left:4px solid #e94560;">' +
          '<div style="display:flex;justify-content:space-between;"><strong>' +
          (event.title || "") +
          "</strong>" +
          '<span class="badge badge-info">' +
          (event.eventType || "") +
          "</span></div>" +
          '<p style="margin:5px 0;">' +
          (event.description || "") +
          "</p>" +
          "<small>" +
          formatDate(event.eventDate) +
          "</small></div>";
      });
      container.innerHTML = html;
    })
    .catch(function () {});
}

function addEvent(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();
  var title = document.getElementById("eventTitle");
  var eventDate = document.getElementById("eventDate");

  if (!title || !title.value || !eventDate || !eventDate.value) {
    showNotification("Title and date required", "warning");
    return false;
  }

  API.addEvent(school, {
    title: title.value,
    description: document.getElementById("eventDescription")
      ? document.getElementById("eventDescription").value
      : "",
    eventDate: eventDate.value,
    eventType: document.getElementById("eventType")
      ? document.getElementById("eventType").value
      : "Other",
    createdBy: user ? user.name : "",
  })
    .then(function () {
      showNotification("Event added!", "success");
      closeModal("addEventModal");
      loadEvents();
    })
    .catch(function () {});
  return false;
}

// ============ FEES ============
function loadFeesData() {
  var school = getCurrentSchool();
  if (!school) return;
  Promise.all([API.getStudents(school), API.getFees(school)])
    .then(function (results) {
      var students = results[0] || [];
      var fees = results[1] || [];

      var select = document.getElementById("feeStudent");
      if (select) {
        var selectHtml = '<option value="">Select Student</option>';
        students.forEach(function (s) {
          selectHtml +=
            '<option value="' +
            s.adm +
            '">' +
            (s.name || "") +
            " (" +
            s.adm +
            ")</option>";
        });
        select.innerHTML = selectHtml;
      }

      var tbody = document.getElementById("feesTableBody");
      if (tbody) {
        if (fees.length === 0) {
          tbody.innerHTML =
            '<tr><td colspan="8" style="text-align:center;">No fee records</td></tr>';
        } else {
          var html = "";
          fees.forEach(function (fee) {
            var badge =
              fee.balance <= 0
                ? '<span class="badge badge-success">Completed</span>'
                : '<span class="badge badge-warning">Partial</span>';
            html +=
              "<tr><td>" +
              (fee.studentName || "-") +
              "</td><td>" +
              (fee.studentAdm || "-") +
              "</td>" +
              "<td>KES " +
              formatNumber(fee.amount || 0) +
              "</td><td>KES " +
              formatNumber(fee.paid || 0) +
              "</td>" +
              "<td>KES " +
              formatNumber(fee.balance || 0) +
              "</td><td>" +
              (fee.term || "") +
              "</td><td>" +
              badge +
              "</td>" +
              '<td><button class="btn btn-sm btn-primary" onclick="editFee(\'' +
              fee.id +
              '\')"><i class="fas fa-edit"></i></button> ' +
              '<button class="btn btn-sm btn-danger" onclick="deleteFee(\'' +
              fee.id +
              '\')"><i class="fas fa-trash"></i></button></td></tr>';
          });
          tbody.innerHTML = html;
        }
      }

      var totalEl = document.getElementById("totalFeesAmount");
      var paidEl = document.getElementById("totalPaidAmount");
      var balanceEl = document.getElementById("totalBalanceAmount");
      if (totalEl)
        totalEl.textContent = formatCurrency(
          fees.reduce(function (s, f) {
            return s + (f.amount || 0);
          }, 0),
        );
      if (paidEl)
        paidEl.textContent = formatCurrency(
          fees.reduce(function (s, f) {
            return s + (f.paid || 0);
          }, 0),
        );
      if (balanceEl)
        balanceEl.textContent = formatCurrency(
          fees.reduce(function (s, f) {
            return s + (f.balance || 0);
          }, 0),
        );
    })
    .catch(function () {});
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
    term: term ? term.value || "Term 1" : "Term 1",
  })
    .then(function () {
      showNotification(
        currentEditingFeeId ? "Fee updated!" : "Fee saved!",
        "success",
      );
      currentEditingFeeId = null;
      loadFeesData();
    })
    .catch(function () {});
  return false;
}

function editFee(feeId) {
  if (!feeId) return;
  var school = getCurrentSchool();
  API.getFees(school).then(function (fees) {
    fees.forEach(function (fee) {
      if (fee.id === feeId) {
        currentEditingFeeId = feeId;
        document.getElementById("feeStudent").value = fee.studentAdm;
        document.getElementById("feeAmount").value = fee.amount;
        document.getElementById("feePaid").value = fee.paid;
        document.getElementById("feeTerm").value = fee.term;
      }
    });
  });
}

function deleteFee(feeId) {
  if (!feeId) return;
  if (confirm("Delete this fee?")) {
    var school = getCurrentSchool();
    API.deleteFee(school, feeId)
      .then(function () {
        showNotification("Fee deleted!", "success");
        loadFeesData();
      })
      .catch(function () {});
  }
}

// ============ TIMETABLE ============
function loadTimetableData() {
  var school = getCurrentSchool();
  if (!school) return;
  Promise.all([
    API.getTimetable(school),
    API.getClasses(school),
    API.getTeachers(school),
  ])
    .then(function (results) {
      var timetable = results[0] || [];
      var classes = results[1] || [];
      var teachers = results[2] || [];

      var tbody = document.getElementById("timetableBody");
      if (tbody) {
        if (timetable.length === 0) {
          tbody.innerHTML =
            '<tr><td colspan="6" style="text-align:center;">No entries</td></tr>';
        } else {
          var html = "";
          timetable.forEach(function (t) {
            html +=
              "<tr><td>" +
              (t.day || "-") +
              "</td><td>" +
              (t.period || "-") +
              "</td><td>" +
              (t.className || "-") +
              "</td><td>" +
              (t.subject || "-") +
              "</td><td>" +
              (t.teacher || "-") +
              "</td><td>" +
              (t.room || "-") +
              "</td></tr>";
          });
          tbody.innerHTML = html;
        }
      }

      var classSelect = document.getElementById("ttClass");
      if (classSelect) {
        var classHtml = "";
        classes.forEach(function (c) {
          classHtml +=
            '<option value="' +
            (c.name || "") +
            '">' +
            (c.name || "") +
            "</option>";
        });
        classSelect.innerHTML = classHtml;
      }

      var teacherSelect = document.getElementById("ttTeacher");
      if (teacherSelect) {
        var teacherHtml = "";
        teachers.forEach(function (t) {
          teacherHtml +=
            '<option value="' +
            (t.name || "") +
            '">' +
            (t.name || "") +
            "</option>";
        });
        teacherSelect.innerHTML = teacherHtml;
      }
    })
    .catch(function () {});
}

function addTimetableEntry(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var className = document.getElementById("ttClass").value;
  var day = document.getElementById("ttDay").value;
  var period = document.getElementById("ttPeriod").value;
  var subject = document.getElementById("ttSubject").value;
  var teacher = document.getElementById("ttTeacher")
    ? document.getElementById("ttTeacher").value
    : "";
  var room = document.getElementById("ttRoom")
    ? document.getElementById("ttRoom").value
    : "";

  if (!className || !day || !period || !subject) {
    showNotification("Fill all required fields", "warning");
    return false;
  }

  API.addTimetableEntry(school, {
    className: className,
    day: day,
    period: period,
    subject: subject,
    teacher: teacher,
    room: room,
  })
    .then(function () {
      showNotification("Entry added!", "success");
      loadTimetableData();
    })
    .catch(function () {});
  return false;
}

// ============ TEACHERS ============
function loadTeachersData() {
  var school = getCurrentSchool();
  if (!school) return;
  API.getTeachers(school)
    .then(function (teachers) {
      var tbody = document.getElementById("teachersTableBody");
      if (!tbody) return;

      if (!teachers || teachers.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" style="text-align:center;">No teachers</td></tr>';
        return;
      }

      var html = "";
      teachers.forEach(function (t) {
        html +=
          "<tr><td>" +
          (t.name || "-") +
          "</td><td>" +
          (t.email || "-") +
          "</td><td>" +
          (t.phone || "-") +
          "</td><td>" +
          (t.subjects || "-") +
          "</td><td>" +
          (t.classes || "-") +
          '</td><td><button class="btn btn-sm btn-danger" onclick="deleteTeacher(\'' +
          t.id +
          '\')"><i class="fas fa-trash"></i></button></td></tr>';
      });
      tbody.innerHTML = html;
    })
    .catch(function () {});
}

function addTeacher(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var name = document.getElementById("teacherName").value;
  if (!name) {
    showNotification("Teacher name required", "warning");
    return false;
  }

  API.addTeacher(school, {
    name: name,
    email: document.getElementById("teacherEmail")
      ? document.getElementById("teacherEmail").value
      : "",
    phone: document.getElementById("teacherPhone")
      ? document.getElementById("teacherPhone").value
      : "",
    subjects: document.getElementById("teacherSubjects")
      ? document.getElementById("teacherSubjects").value
      : "",
    classes: document.getElementById("teacherClasses")
      ? document.getElementById("teacherClasses").value
      : "",
  })
    .then(function () {
      showNotification("Teacher added!", "success");
      closeModal("addTeacherModal");
      loadTeachersData();
    })
    .catch(function () {});
  return false;
}

function deleteTeacher(teacherId) {
  if (!teacherId) return;
  if (confirm("Delete this teacher?")) {
    var school = getCurrentSchool();
    API.deleteTeacher(school, teacherId)
      .then(function () {
        showNotification("Teacher deleted!", "success");
        loadTeachersData();
      })
      .catch(function () {});
  }
}

// ============ CLASSES ============
function loadClassesData() {
  var school = getCurrentSchool();
  if (!school) return;
  API.getClasses(school)
    .then(function (classes) {
      var container = document.getElementById("classesList");
      if (!container) return;

      if (!classes || classes.length === 0) {
        container.innerHTML =
          '<p style="text-align:center;">No classes yet</p>';
        return;
      }

      var html = "";
      classes.forEach(function (c) {
        var studentCount = c.students ? c.students.length : 0;
        html +=
          '<div class="class-card"><h4>' +
          (c.name || "") +
          " " +
          (c.stream || "") +
          "</h4>" +
          "<p>" +
          studentCount +
          " students</p><p>Teacher: " +
          (c.teacher || "Not assigned") +
          "</p>" +
          '<div class="class-actions"><button class="btn btn-sm btn-primary" onclick="viewClassStudents(\'' +
          c.id +
          '\')"><i class="fas fa-eye"></i> View</button> ' +
          '<button class="btn btn-sm btn-danger" onclick="deleteClass(\'' +
          c.id +
          '\')"><i class="fas fa-trash"></i> Delete</button></div></div>';
      });
      container.innerHTML = html;
    })
    .catch(function () {});
}

function handleExcelUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
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
        var previewHtml = "<table><thead><tr>";
        columns.forEach(function (col) {
          previewHtml += "<th>" + col + "</th>";
        });
        previewHtml += "</tr></thead><tbody>";
        jsonData.slice(0, 5).forEach(function (row) {
          previewHtml += "<tr>";
          columns.forEach(function (col) {
            previewHtml += "<td>" + (row[col] || "-") + "</td>";
          });
          previewHtml += "</tr>";
        });
        previewHtml += "</tbody></table>";
        previewEl.innerHTML = previewHtml;
        previewEl.style.display = "block";
      }
    } catch (err) {
      showNotification("Error reading Excel file", "error");
    }
  };
  reader.readAsArrayBuffer(file);
}

function addClassWithExcel(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();
  var className = document.getElementById("className").value;
  var classStream = document.getElementById("classStream")
    ? document.getElementById("classStream").value
    : "";
  var classTeacher = document.getElementById("classTeacher")
    ? document.getElementById("classTeacher").value
    : "";
  var studentsData = document.getElementById("excelStudentsData");

  if (!className) {
    showNotification("Class name required", "warning");
    return false;
  }

  var students = [];
  if (
    studentsData &&
    studentsData.value &&
    studentsData.dataset.loaded === "true"
  ) {
    try {
      students = JSON.parse(studentsData.value);
    } catch (e) {
      students = [];
    }
  }

  API.addClass(school, {
    name: className,
    stream: classStream,
    teacher: classTeacher,
    students: students,
    createdBy: user ? user.name : "",
  })
    .then(function (result) {
      if (result.success) {
        showNotification(
          "Class added with " + result.studentIdsGenerated + " students!",
          "success",
        );
        closeModal("addClassModal");
        loadClassesData();
      } else {
        showNotification(result.error || "Failed", "error");
      }
    })
    .catch(function () {});
  return false;
}

function viewClassStudents(classId) {
  if (!classId) return;
  var school = getCurrentSchool();
  API.getClasses(school).then(function (classes) {
    classes.forEach(function (cls) {
      if (cls.id === classId) {
        var students = cls.students || [];
        var modal = document.createElement("div");
        modal.className = "modal active";
        modal.id = "viewStudentsModal";
        var html =
          '<div class="modal-content"><div class="modal-header"><h3>' +
          (cls.name || "") +
          " Students</h3>" +
          '<button class="modal-close" onclick="closeModal(\'viewStudentsModal\')"><i class="fas fa-times"></i></button></div>';
        html +=
          '<table class="data-table"><thead><tr><th>#</th><th>Name</th><th>ADM</th><th>Gender</th></tr></thead><tbody>';
        students.forEach(function (s, i) {
          var name = extractName(s);
          var adm = extractAdm(s) || "-";
          var gender = s.Gender || s.gender || "-";
          html +=
            "<tr><td>" +
            (i + 1) +
            "</td><td>" +
            name +
            "</td><td>" +
            adm +
            "</td><td>" +
            gender +
            "</td></tr>";
        });
        html += "</tbody></table></div>";
        modal.innerHTML = html;
        document.body.appendChild(modal);
      }
    });
  });
}

function deleteClass(classId) {
  if (!classId) return;
  if (confirm("Delete this class and ALL its students?")) {
    var school = getCurrentSchool();
    if (typeof API.deleteClassWithStudents === "function") {
      API.deleteClassWithStudents(school, classId)
        .then(function (result) {
          showNotification(
            "Class deleted with " + result.studentsDeleted + " students!",
            "success",
          );
          loadClassesData();
        })
        .catch(function () {});
    } else {
      API.deleteClass(school, classId)
        .then(function () {
          showNotification("Class deleted!", "success");
          loadClassesData();
        })
        .catch(function () {});
    }
  }
}

// ============ TERMS ============
function loadTerms() {
  var school = getCurrentSchool();
  if (!school) return;
  API.getTerms(school)
    .then(function (terms) {
      var container = document.getElementById("termsList");
      if (!container) return;
      if (!terms || terms.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No terms</p>';
        return;
      }
      var html = "";
      terms.forEach(function (term) {
        var current = term.isCurrent ? " ✅ Current" : "";
        html +=
          '<div class="term-card"><h4>' +
          (term.name || "") +
          current +
          "</h4>" +
          "<p>" +
          (term.startDate || "") +
          " → " +
          (term.endDate || "") +
          "</p></div>";
      });
      container.innerHTML = html;
    })
    .catch(function () {});
}

function addTerm(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var name = document.getElementById("termName").value;
  var startDate = document.getElementById("termStartDate").value;
  var endDate = document.getElementById("termEndDate").value;

  if (!name || !startDate || !endDate) {
    showNotification("All fields required", "warning");
    return false;
  }

  API.addTerm(school, { name: name, startDate: startDate, endDate: endDate })
    .then(function () {
      showNotification("Term added!", "success");
      closeModal("addTermModal");
      loadTerms();
    })
    .catch(function () {});
  return false;
}

// ============ AUDIT LOG ============
function loadAuditLog() {
  var school = getCurrentSchool();
  if (!school) return;
  API.getAuditLog(school)
    .then(function (logs) {
      var tbody = document.getElementById("auditLogBody");
      if (!tbody) return;
      if (!logs || logs.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="5" style="text-align:center;">No entries</td></tr>';
        return;
      }
      var html = "";
      logs.forEach(function (log) {
        html +=
          "<tr><td>" +
          formatDateTime(log.timestamp) +
          "</td><td>" +
          (log.user || "-") +
          "</td><td>" +
          (log.action || "-") +
          "</td><td>" +
          (log.details || "-") +
          "</td></tr>";
      });
      tbody.innerHTML = html;
    })
    .catch(function () {});
}

// ============ REPORTS ============
function loadReports() {
  var school = getCurrentSchool();
  if (!school) return;
  Promise.all([API.getBorrowed(school), API.getFurniture(school)])
    .then(function (results) {
      var borrowed = results[0] || [];
      var furniture = results[1] || [];
      var activeLoans = borrowed.filter(function (b) {
        return !b.returned;
      });
      var overdue = activeLoans.filter(function (b) {
        return isOverdue(b.returnDate);
      });
      var returned = borrowed.filter(function (b) {
        return b.returned;
      });
      var returnRate =
        borrowed.length > 0
          ? Math.round((returned.length / borrowed.length) * 100)
          : 0;

      var ocEl = document.getElementById("overdueCount");
      var alEl = document.getElementById("activeLoansCount");
      var rrEl = document.getElementById("returnRate");
      var fcEl = document.getElementById("furnitureCount");
      if (ocEl) ocEl.textContent = overdue.length;
      if (alEl) alEl.textContent = activeLoans.length;
      if (rrEl) rrEl.textContent = returnRate + "%";
      if (fcEl) fcEl.textContent = furniture.length;

      renderOverdueReport(overdue);
      renderMonthlySummary(borrowed, furniture);
    })
    .catch(function () {});
}

function renderOverdueReport(overdue) {
  var tbody = document.getElementById("overdueReportBody");
  if (!tbody) return;
  if (overdue.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;">No overdue books 🎉</td></tr>';
    return;
  }
  var html = "";
  overdue.forEach(function (b) {
    html +=
      "<tr><td>" +
      (b.studentName || "-") +
      "</td><td>" +
      (b.adm || "-") +
      "</td><td>" +
      (b.bookTitle || "-") +
      "</td><td>" +
      (b.returnDate || "-") +
      "</td><td>" +
      daysOverdue(b.returnDate) +
      " days</td></tr>";
  });
  tbody.innerHTML = html;
}

function renderMonthlySummary(borrowed, furniture) {
  var tbody = document.getElementById("monthlySummaryBody");
  if (!tbody) return;
  var monthlyData = {};
  borrowed.forEach(function (b) {
    var date = new Date(b.borrowDate);
    var key = date.getFullYear() + "-" + (date.getMonth() + 1);
    if (!monthlyData[key])
      monthlyData[key] = { issued: 0, returned: 0, furniture: 0 };
    monthlyData[key].issued++;
    if (b.returned) monthlyData[key].returned++;
  });
  furniture.forEach(function (f) {
    var date = new Date(f.allocationDate);
    var key = date.getFullYear() + "-" + (date.getMonth() + 1);
    if (!monthlyData[key])
      monthlyData[key] = { issued: 0, returned: 0, furniture: 0 };
    monthlyData[key].furniture++;
  });
  var months = Object.keys(monthlyData).sort().reverse();
  if (months.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align:center;">No data</td></tr>';
    return;
  }
  var html = "";
  months.slice(0, 12).forEach(function (key) {
    var parts = key.split("-");
    var monthName = getMonthName(parseInt(parts[1]) - 1) + " " + parts[0];
    var data = monthlyData[key];
    html +=
      "<tr><td>" +
      monthName +
      "</td><td>" +
      data.issued +
      "</td><td>" +
      data.returned +
      "</td><td>" +
      data.furniture +
      "</td></tr>";
  });
  tbody.innerHTML = html;
}

// ============ SETTINGS ============
function loadSettingsData() {
  var school = getCurrentSchool();
  if (!school) return;
  API.getSchool(school)
    .then(function (schoolInfo) {
      if (schoolInfo) {
        var nameEl = document.getElementById("schoolNameInput");
        var addrEl = document.getElementById("schoolAddress");
        var admNameEl = document.getElementById("adminName");
        var admEmailEl = document.getElementById("adminEmail");
        var mottoEl = document.getElementById("schoolMotto");
        if (nameEl) nameEl.value = schoolInfo.name || "";
        if (addrEl) addrEl.value = schoolInfo.address || "";
        if (admNameEl) admNameEl.value = schoolInfo.adminName || "";
        if (admEmailEl) admEmailEl.value = schoolInfo.adminEmail || "";
        if (mottoEl) mottoEl.value = schoolInfo.motto || "";
      }
    })
    .catch(function () {});

  API.getSettings(school)
    .then(function (settings) {
      if (settings) {
        var mbEl = document.getElementById("maxBorrowDays");
        var mbpsEl = document.getElementById("maxBooksPerStudent");
        var fpdEl = document.getElementById("finePerDay");
        if (mbEl) mbEl.value = settings.maxBorrowDays || 14;
        if (mbpsEl) mbpsEl.value = settings.maxBooksPerStudent || 3;
        if (fpdEl) fpdEl.value = settings.finePerDay || 10;
      }
    })
    .catch(function () {});

  API.getUsers(school)
    .then(function (users) {
      var tbody = document.getElementById("usersTableBody");
      if (!tbody) return;
      var html = "";
      users.forEach(function (u) {
        var status =
          u.isActive !== false
            ? '<span class="badge badge-success">Active</span>'
            : '<span class="badge badge-danger">Inactive</span>';
        html +=
          "<tr><td>" +
          (u.name || "") +
          "</td><td>" +
          (u.email || "") +
          "</td><td>" +
          (u.role || "") +
          "</td><td>" +
          status +
          "</td></tr>";
      });
      tbody.innerHTML = html;
    })
    .catch(function () {});
}

function saveSchoolInfo(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  API.updateSchool(school, {
    name: document.getElementById("schoolNameInput").value,
    address: document.getElementById("schoolAddress").value,
    adminName: document.getElementById("adminName").value,
    adminEmail: document.getElementById("adminEmail").value,
    motto: document.getElementById("schoolMotto").value,
  })
    .then(function () {
      showNotification("School info saved!", "success");
    })
    .catch(function () {});
  return false;
}

function saveSettings(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  API.updateSettings(school, {
    maxBorrowDays:
      parseInt(document.getElementById("maxBorrowDays").value) || 14,
    maxBooksPerStudent:
      parseInt(document.getElementById("maxBooksPerStudent").value) || 3,
    finePerDay: parseInt(document.getElementById("finePerDay").value) || 10,
  })
    .then(function () {
      showNotification("Settings saved!", "success");
    })
    .catch(function () {});
  return false;
}

function addUser(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  API.createUser(school, {
    name: document.getElementById("newUserName").value,
    email: document.getElementById("newUserEmail").value,
    role: document.getElementById("newUserRole").value,
    password: document.getElementById("newUserPassword").value,
  })
    .then(function (result) {
      if (result.success) {
        showNotification("User added!", "success");
        closeModal("addUserModal");
        loadSettingsData();
      } else {
        showNotification(result.error || "Failed", "error");
      }
    })
    .catch(function () {});
  return false;
}

function promoteToAdmin(email) {
  if (!email) return;
  var school = getCurrentSchool();
  API.updateUser(school, email, { role: "admin" })
    .then(function () {
      showNotification("User promoted!", "success");
      loadSettingsData();
    })
    .catch(function () {});
}

function deleteUser(email) {
  if (!email) return;
  var school = getCurrentSchool();
  API.deleteUser(school, email)
    .then(function () {
      showNotification("User deactivated!", "success");
      loadSettingsData();
    })
    .catch(function () {});
}

// ============ DATABASE MANAGER ============
function loadDatabaseTables() {
  var tables = [
    "books",
    "borrowed",
    "students",
    "furniture",
    "teachers",
    "classes",
    "terms",
    "events",
    "fees",
    "qrcodes",
    "assignments",
    "auditLog",
    "users",
    "chat",
    "forum",
    "notes",
  ];
  var select = document.getElementById("databaseTableSelect");
  if (!select) return;
  var html = '<option value="">-- Select a table --</option>';
  tables.forEach(function (t) {
    html +=
      '<option value="' +
      t +
      '">' +
      t.charAt(0).toUpperCase() +
      t.slice(1) +
      "</option>";
  });
  select.innerHTML = html;
}

function loadDatabaseTable() {
  var school = getCurrentSchool();
  var select = document.getElementById("databaseTableSelect");
  if (!select || !select.value) return;
  var tableName = select.value;
  API.getTableData(school, tableName)
    .then(function (data) {
      var tbody = document.getElementById("databaseTableBody");
      var thead = document.getElementById("databaseTableHead");
      if (!tbody || !thead) return;
      if (!data || data.length === 0) {
        thead.innerHTML = "";
        tbody.innerHTML = "<tr><td>No data</td></tr>";
        return;
      }
      var columns = Object.keys(data[0]);
      var filteredColumns = columns.filter(function (c) {
        return c !== "password";
      });
      var headHtml = "<tr>";
      filteredColumns.forEach(function (col) {
        headHtml += "<th>" + col + "</th>";
      });
      headHtml += "</tr>";
      thead.innerHTML = headHtml;
      var bodyHtml = "";
      data.slice(0, 100).forEach(function (row) {
        bodyHtml += "<tr>";
        filteredColumns.forEach(function (col) {
          var value = row[col];
          if (typeof value === "object") value = JSON.stringify(value);
          bodyHtml += "<td>" + (value || "-") + "</td>";
        });
        bodyHtml += "</tr>";
      });
      tbody.innerHTML = bodyHtml;
    })
    .catch(function () {});
}

// ============ QR CODE LIST ============
function loadQRCodeList() {
  var school = getCurrentSchool();
  if (!school) return;
  API.getQRCodes(school)
    .then(function (codes) {
      var container = document.getElementById("qrCodeList");
      if (!container) return;
      if (!codes || codes.length === 0) {
        container.innerHTML =
          '<div class="empty-state"><i class="fas fa-list"></i><p>No QR codes yet</p></div>';
        return;
      }
      var html =
        '<table class="data-table"><thead><tr><th>Code</th><th>Type</th><th>Status</th><th>Assigned To</th><th>ADM</th></tr></thead><tbody>';
      codes.forEach(function (qr) {
        var status = qr.returned
          ? "Returned"
          : qr.assigned
            ? "Assigned"
            : "Available";
        var badgeClass = qr.returned
          ? "badge-success"
          : qr.assigned
            ? "badge-warning"
            : "badge-info";
        html +=
          "<tr><td><strong>" +
          (qr.code || "") +
          "</strong></td><td>" +
          (qr.type || "") +
          "</td>" +
          '<td><span class="badge ' +
          badgeClass +
          '">' +
          status +
          "</span></td>" +
          "<td>" +
          (qr.assignedTo || "-") +
          "</td><td>" +
          (qr.adm || "-") +
          "</td></tr>";
      });
      html += "</tbody></table>";
      container.innerHTML = html;
    })
    .catch(function () {});
}

// ============ EXPORTS ============
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
window.loadQRCodeList = loadQRCodeList;
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
window.saveSchoolInfo = saveSchoolInfo;
window.saveSettings = saveSettings;
window.addUser = addUser;
window.animateNumber = animateNumber;
window.renderOverdueReport = renderOverdueReport;
window.renderMonthlySummary = renderMonthlySummary;
window.loadClassStudentsForBooks = loadClassStudentsForBooks;
window.issueBulkBooks = issueBulkBooks;
window.loadClassStudentsForFurniture = loadClassStudentsForFurniture;
window.allocateBulkFurniture = allocateBulkFurniture;
window.updateStudentStats = updateStudentStats;

console.log("✅ SRMS App loaded - PERFORMANCE OPTIMIZED");
