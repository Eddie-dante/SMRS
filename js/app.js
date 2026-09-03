// ============================================
// SRMS - Optimized Application Logic
// Fast Loading with Caching
// ============================================

var selectedChatUser = null;
var currentChatUserEmail = null;
var unreadMessagesCount = 0;
var messageCheckInterval = null;
var currentEditingFeeId = null;

document.addEventListener("DOMContentLoaded", function () {
  var user = checkAuth();
  if (!user) return;

  var page = window.location.pathname.split("/").pop();

  // Load page data with timeout protection
  setTimeout(function () {
    loadPageData(page);
  }, 100);

  // Start message checking (lighter interval)
  setTimeout(function () {
    checkUnreadMessages();
    messageCheckInterval = setInterval(checkUnreadMessages, 15000); // 15 seconds instead of 5
  }, 2000);

  // Initialize dropdown
  initDropdownController();
});

// ============ DROPDOWN CONTROLLER (Lightweight) ============
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

    group.addEventListener("mouseenter", openDropdown);
    group.addEventListener("mouseleave", closeDropdownDelayed);
    dropdown.addEventListener("mouseenter", openDropdown);
    dropdown.addEventListener("mouseleave", closeDropdownDelayed);

    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (dropdown.classList.contains("open")) {
        dropdown.classList.remove("open");
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

// ============ FAST PAGE ROUTER ============
function loadPageData(page) {
  switch (page) {
    case "dashboard.html":
      loadDashboardData();
      break;
    case "library.html":
      loadLibraryData();
      break;
    case "students.html":
      loadStudentsFast();
      break;
    case "furniture.html":
      loadFurnitureFast();
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
      loadFeesFast();
      break;
    case "timetable.html":
      loadTimetableFast();
      break;
    case "teachers.html":
      loadTeachersFast();
      break;
    case "classes.html":
      loadClassesFast();
      break;
    case "auditlog.html":
      loadAuditLogFast();
      break;
    case "reports.html":
      loadReportsFast();
      break;
    case "settings.html":
      loadSettingsFast();
      break;
    case "qrcodes.html":
      loadQRCodesFast();
      break;
    case "wallpaper.html":
      loadWallpapers();
      break;
  }
}

// ============ OPTIMIZED LOADERS (Parallel Loading) ============
function loadDashboardData() {
  var school = getCurrentSchool();
  if (!school) return;

  var user = getCurrentUser();
  if (user) {
    document.getElementById("welcomeUserName").textContent = user.name;
    document.getElementById("welcomeUserRole").textContent = user.role;
    document.getElementById("welcomeSchoolName").textContent = school;
    document.getElementById("dateDisplay").textContent = getDateDisplay();

    if (user.role === "admin") {
      API.getSchool(school).then(function (schoolInfo) {
        if (schoolInfo && schoolInfo.inviteCode) {
          document.getElementById("inviteCode").textContent =
            schoolInfo.inviteCode;
          document.getElementById("inviteCodeBanner").style.display = "block";
        }
      });
    }
  }

  // Load all stats in parallel
  Promise.all([
    API.getBooks(school),
    API.getStudents(school),
    API.getBorrowed(school),
    API.getFurniture(school),
    API.getTeachers(school),
    API.getClasses(school),
    API.getEvents(school),
    API.getFees(school),
  ]).then(function (results) {
    var books = results[0];
    var students = results[1];
    var borrowed = results[2];
    var furniture = results[3];
    var teachers = results[4];
    var classes = results[5];
    var events = results[6];
    var fees = results[7];

    // Update all stats at once
    animateNumber(
      "totalBooks",
      books.reduce(function (s, b) {
        return s + (b.quantity || 0);
      }, 0),
    );
    animateNumber(
      "availableBooks",
      books.reduce(function (s, b) {
        return s + (b.available || 0);
      }, 0),
    );

    var totalStudents = students.length;
    var seenAdms = {};
    students.forEach(function (s) {
      seenAdms[s.adm] = true;
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
    animateNumber(
      "overdueBooks",
      activeLoans.filter(function (b) {
        return isOverdue(b.returnDate);
      }).length,
    );
    animateNumber("activeFurniture", furniture.length);

    document.getElementById("totalTeachersStat").textContent = teachers.length;
    document.getElementById("totalClassesStat").textContent = classes.length;

    var today = new Date().toISOString().split("T")[0];
    document.getElementById("upcomingEventsStat").textContent = events.filter(
      function (e) {
        return e.eventDate >= today;
      },
    ).length;

    var totalBalance = fees.reduce(function (s, f) {
      return s + (f.balance || 0);
    }, 0);
    document.getElementById("outstandingFeesStat").textContent =
      "KES " + formatNumber(totalBalance);

    // Update activity
    displayActivities(borrowed, furniture);
  });
}

function displayActivities(borrowed, furniture) {
  var activityList = document.getElementById("recentActivity");
  if (!activityList) return;

  var activities = [];

  borrowed.forEach(function (b) {
    activities.push({
      icon: "fa-book",
      color: "rgba(233, 69, 96, 0.2)",
      text:
        "<strong>" + b.studentName + '</strong> borrowed "' + b.bookTitle + '"',
      time: b.createdAt,
    });
  });

  furniture.forEach(function (f) {
    activities.push({
      icon: "fa-chair",
      color: "rgba(255, 193, 7, 0.2)",
      text: "<strong>" + f.studentName + "</strong> allocated " + f.chairNo,
      time: f.createdAt,
    });
  });

  activities.sort(function (a, b) {
    return new Date(b.time) - new Date(a.time);
  });
  activities = activities.slice(0, 8);

  if (activities.length === 0) {
    activityList.innerHTML =
      '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:20px;">No recent activity</p>';
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

function loadLibraryData() {
  var school = getCurrentSchool();

  Promise.all([API.getBooks(school), API.getBorrowed(school)]).then(
    function (results) {
      var books = results[0];
      var borrowed = results[1];

      // Books table
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
              b.title +
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

        // Book select
        var select = document.getElementById("issueBookTitle");
        if (select) {
          var selectHtml = '<option value="">Select Book</option>';
          books.forEach(function (b) {
            if (b.available > 0)
              selectHtml +=
                '<option value="' + b.title + '">' + b.title + "</option>";
          });
          select.innerHTML = selectHtml;
        }
      }

      // Returns
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
            returnsHtml +=
              "<tr><td>" +
              b.studentName +
              "</td><td>" +
              b.adm +
              "</td><td>" +
              b.bookTitle +
              "</td><td>" +
              b.bookNo +
              "</td><td>" +
              b.returnDate +
              '</td><td><span class="badge badge-success">Active</span></td><td><button class="btn btn-sm btn-success" onclick="returnBook(\'' +
              b.id +
              '\')"><i class="fas fa-undo"></i> Return</button></td></tr>';
          });
          returnsTbody.innerHTML = returnsHtml;
        }
      }

      // Borrowed history
      var borrowedTbody = document.getElementById("borrowedTableBody");
      if (borrowedTbody) {
        if (borrowed.length === 0) {
          borrowedTbody.innerHTML =
            '<tr><td colspan="5" style="text-align:center;">No records</td></tr>';
        } else {
          var borrowedHtml = "";
          borrowed.forEach(function (b) {
            borrowedHtml +=
              "<tr><td>" +
              b.studentName +
              "</td><td>" +
              b.bookTitle +
              "</td><td>" +
              b.borrowDate +
              "</td><td>" +
              (b.returnDate || "-") +
              '</td><td><span class="badge badge-warning">Active</span></td></tr>';
          });
          borrowedTbody.innerHTML = borrowedHtml;
        }
      }
    },
  );
}

function loadStudentsFast() {
  var school = getCurrentSchool();

  Promise.all([API.getStudents(school), API.getClasses(school)]).then(
    function (results) {
      var students = results[0];
      var classes = results[1];

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

      var tbody = document.getElementById("studentsTableBody");
      if (tbody) {
        if (allStudents.length === 0) {
          tbody.innerHTML =
            '<tr><td colspan="7" style="text-align:center;">No students</td></tr>';
        } else {
          var html = "";
          allStudents.slice(0, 100).forEach(function (s) {
            html +=
              "<tr><td>" +
              s.name +
              "</td><td>" +
              s.adm +
              "</td><td>" +
              (s.form || "-") +
              "</td><td>" +
              (s.stream || "-") +
              "</td><td>" +
              (s.gender || "-") +
              "</td><td>" +
              (s.parentPhone || "-") +
              '</td><td><button class="btn btn-sm btn-danger" onclick="deleteStudent(\'' +
              s.adm +
              '\')"><i class="fas fa-trash"></i></button></td></tr>';
          });
          tbody.innerHTML = html;
        }
      }
    },
  );
}

function loadFurnitureFast() {
  var school = getCurrentSchool();

  API.getFurniture(school).then(function (furniture) {
    var totalEl = document.getElementById("totalFurnitureStat");
    var activeEl = document.getElementById("activeFurnitureStat");

    if (totalEl) totalEl.textContent = furniture.length;
    if (activeEl) activeEl.textContent = furniture.length;

    var activeList = document.getElementById("activeFurnitureList");
    if (activeList) {
      if (furniture.length === 0) {
        activeList.innerHTML =
          '<p style="text-align:center;color:rgba(255,255,255,0.5);">No records</p>';
      } else {
        var html = "";
        furniture.slice(0, 50).forEach(function (f) {
          html +=
            '<div class="furniture-card">' +
            '<span class="status-badge status-active">Active</span>' +
            '<div class="furniture-icon"><i class="fas fa-chair"></i></div>' +
            '<div class="furniture-student-name">' +
            f.studentName +
            "</div>" +
            '<div class="furniture-adm">' +
            f.adm +
            "</div>" +
            '<div class="furniture-details">' +
            '<div class="furniture-detail-item"><div class="furniture-detail-label">Chair</div><div class="furniture-detail-value">' +
            f.chairNo +
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
    if (allList) allList.innerHTML = activeList.innerHTML;
  });
}

// Export all functions
window.loadDashboardData = loadDashboardData;
window.loadLibraryData = loadLibraryData;
window.loadStudentsFast = loadStudentsFast;
window.loadFurnitureFast = loadFurnitureFast;
window.initDropdownController = initDropdownController;
window.checkUnreadMessages = checkUnreadMessages;
window.returnBook = returnBook;
window.deleteBook = deleteBook;
window.deleteStudent = deleteStudent;
window.returnFurnitureItem = returnFurnitureItem;
window.logAction = logAction;

// Keep other functions from previous app.js referenced
function logAction(action, details) {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  var skipActions = ["Page Visit", "Message Check", "Wallpaper Applied"];
  if (skipActions.indexOf(action) !== -1) return;

  API.addAuditLog(school, {
    user: user.name,
    action: action,
    details: details,
  });
}

function checkUnreadMessages() {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  API.getChatMessages(school, user.email, user.email).then(function (messages) {
    var badges = document.querySelectorAll(
      ".message-badge, #communicationBadge",
    );
    badges.forEach(function (badge) {
      if (messages.length > 0) {
        badge.textContent = messages.length;
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    });
  });
}

function returnBook(borrowId) {
  if (!confirm("Return this book? The record will be deleted.")) return;
  var school = getCurrentSchool();
  API.returnBook(school, borrowId).then(function (result) {
    if (result.success) {
      showNotification("Book returned!", "success");
      loadLibraryData();
    }
  });
}

function deleteBook(bookId) {
  if (!confirm("Delete this book?")) return;
  var school = getCurrentSchool();
  API.deleteBook(school, bookId).then(function () {
    showNotification("Book deleted!", "success");
    loadLibraryData();
  });
}

function deleteStudent(adm) {
  if (!confirm("Delete this student?")) return;
  var school = getCurrentSchool();
  API.deleteStudent(school, adm).then(function () {
    showNotification("Student deleted!", "success");
    loadStudentsFast();
  });
}

function returnFurnitureItem(furnitureId) {
  if (!confirm("Return this furniture?")) return;
  var school = getCurrentSchool();
  API.returnFurniture(school, furnitureId).then(function () {
    showNotification("Furniture returned!", "success");
    loadFurnitureFast();
  });
}

// Keep references to other functions
window.loadFeesFast = loadFeesFast;
window.loadTimetableFast = loadTimetableFast;
window.loadTeachersFast = loadTeachersFast;
window.loadClassesFast = loadClassesFast;
window.loadAuditLogFast = loadAuditLogFast;
window.loadReportsFast = loadReportsFast;
window.loadSettingsFast = loadSettingsFast;
window.loadQRCodesFast = loadQRCodesFast;
window.loadWallpapers = loadWallpapers;
window.loadChatUsers = loadChatUsers;
window.loadForumMessages = loadForumMessages;
window.loadNotes = loadNotes;
window.loadEvents = loadEvents;
