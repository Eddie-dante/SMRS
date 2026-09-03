// ============================================
// SRMS - Complete Application Logic
// Full Version with All Features
// ============================================

// ============ GLOBAL VARIABLES ============
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

// ============ INITIALIZATION ============
document.addEventListener("DOMContentLoaded", function () {
  var user = checkAuth();
  if (!user) return;

  var page = window.location.pathname.split("/").pop();

  // Load page data with slight delay for smooth transition
  setTimeout(function () {
    loadPageData(page);
  }, 100);

  // Start message checking
  setTimeout(function () {
    checkUnreadMessages();
    messageCheckInterval = setInterval(checkUnreadMessages, 15000);
  }, 2000);

  // Initialize dropdown controller
  initDropdownController();
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
    case "wallpaper.html":
      loadWallpapers();
      break;
  }
}

// ============ AUDIT LOGGING (Filtered) ============
function logAction(action, details) {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  var skipActions = ["Page Visit", "Message Check", "Wallpaper Applied"];
  if (skipActions.indexOf(action) !== -1) return;

  API.addAuditLog(school, {
    user: user.name,
    userEmail: user.email,
    action: action,
    details: details,
  });
}

// ============ MESSAGE NOTIFICATIONS ============
function checkUnreadMessages() {
  var school = getCurrentSchool();
  var user = getCurrentUser();
  if (!school || !user) return;

  API.getChatMessages(school, user.email, user.email).then(function (messages) {
    unreadMessagesCount = messages.length;
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
  });
}

// ============ DASHBOARD ============
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
  ]).then(function (results) {
    var books = results[0];
    var students = results[1];
    var borrowed = results[2];
    var furniture = results[3];
    var teachers = results[4];
    var classes = results[5];
    var events = results[6];
    var fees = results[7];

    // Update stats
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

    displayRecentActivity(borrowed, furniture);
  });
}

function displayRecentActivity(borrowed, furniture) {
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

// ============ LIBRARY ============
function loadLibraryData() {
  var school = getCurrentSchool();

  Promise.all([
    API.getBooks(school),
    API.getBorrowed(school),
    API.getClasses(school),
  ]).then(function (results) {
    var books = results[0];
    var borrowed = results[1];
    var classes = results[2];

    // Books table
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

      // Populate book selects
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

    // Returns table
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
            b.studentName +
            "</td><td>" +
            b.adm +
            "</td><td>" +
            b.bookTitle +
            "</td><td>" +
            b.bookNo +
            "</td><td>" +
            b.returnDate +
            "</td><td>" +
            badge +
            '</td><td><button class="btn btn-sm btn-success" onclick="returnBook(\'' +
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
          var status = b.returned
            ? '<span class="badge badge-success">Returned</span>'
            : '<span class="badge badge-warning">Active</span>';
          borrowedHtml +=
            "<tr><td>" +
            b.studentName +
            "</td><td>" +
            b.bookTitle +
            "</td><td>" +
            b.borrowDate +
            "</td><td>" +
            (b.returnDate || "-") +
            "</td><td>" +
            status +
            "</td></tr>";
        });
        borrowedTbody.innerHTML = borrowedHtml;
      }
    }

    // Bulk book classes
    var bulkClassSelect = document.getElementById("bulkBookClass");
    if (bulkClassSelect) {
      var classHtml = '<option value="">Select Class</option>';
      classes.forEach(function (c) {
        classHtml +=
          '<option value="' +
          c.id +
          '">' +
          c.name +
          " " +
          (c.stream || "") +
          " (" +
          (c.students ? c.students.length : 0) +
          ")</option>";
      });
      bulkClassSelect.innerHTML = classHtml;
    }
  });
}

async function addBook(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var result = await API.addBook(school, {
    title: document.getElementById("bookTitle").value,
    author: document.getElementById("bookAuthor").value,
    type: document.getElementById("bookType").value,
    subject: document.getElementById("bookSubject").value,
    quantity: parseInt(document.getElementById("bookQuantity").value),
    createdBy: user ? user.name : "",
  });

  if (result.success) {
    showNotification("Book added!", "success");
    logAction("Book Added", document.getElementById("bookTitle").value);
    closeModal("addBookModal");
    document.getElementById("addBookForm").reset();
    loadLibraryData();
  }
  return false;
}

async function issueBook(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var result = await API.issueBook(school, {
    studentName: document.getElementById("issueStudentName").value,
    adm: document.getElementById("issueADM").value,
    bookTitle: document.getElementById("issueBookTitle").value,
    bookNo: document.getElementById("issueBookNumber").value,
    borrowDate: document.getElementById("issueBorrowDate").value,
    returnDate: document.getElementById("issueReturnDate").value,
    issuedBy: user ? user.name : "",
  });

  if (result.success) {
    showNotification("Book issued!", "success");
    logAction("Book Issued", document.getElementById("issueBookTitle").value);
    document.getElementById("issueBookForm").reset();
    loadLibraryData();
  }
  return false;
}

async function returnBook(borrowId) {
  var confirmed = await DialogSystem.confirm(
    "Return this book? The record will be deleted.",
    {
      title: "Return Book",
      type: "info",
      confirmText: "Return",
      cancelText: "Cancel",
    },
  );

  if (confirmed !== "confirm") return;

  var school = getCurrentSchool();
  API.returnBook(school, borrowId).then(function (result) {
    if (result.success) {
      showNotification("Book returned!", "success");
      logAction("Book Returned", borrowId);
      loadLibraryData();
    }
  });
}

async function deleteBook(bookId) {
  var confirmed = await DialogSystem.confirm("Delete this book?", {
    title: "Delete Book",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel",
  });

  if (confirmed !== "confirm") return;

  var school = getCurrentSchool();
  API.deleteBook(school, bookId).then(function () {
    showNotification("Book deleted!", "success");
    logAction("Book Deleted", bookId);
    loadLibraryData();
  });
}

// ============ BULK BOOK ISSUE ============
function loadClassStudentsForBooks() {
  var school = getCurrentSchool();
  var classId = document.getElementById("bulkBookClass").value;
  if (!classId) return;

  API.getClasses(school).then(function (classes) {
    var selectedClass = null;
    classes.forEach(function (c) {
      if (c.id === classId) selectedClass = c;
    });

    if (selectedClass && selectedClass.students) {
      bulkBookClass = selectedClass;
      var container = document.getElementById("bulkBookStudents");
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
  var bookTitle = document.getElementById("bulkBookTitle").value;
  var borrowDate =
    document.getElementById("bulkBookBorrowDate").value || getCurrentDate();
  var returnDate =
    document.getElementById("bulkBookReturnDate").value ||
    addDays(getCurrentDate(), 14);

  if (!bookTitle) {
    showNotification("Please select a book", "warning");
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
          form: bulkBookClass ? bulkBookClass.name : "",
          stream: bulkBookClass ? bulkBookClass.stream || "" : "",
          bookTitle: bookTitle,
          bookNo: input.value,
          borrowDate: borrowDate,
          returnDate: returnDate,
          issuedBy: user ? user.name : "",
        }),
      );
      issued++;
    }
  });

  Promise.all(promises).then(function () {
    showNotification("Issued books to " + issued + " students!", "success");
    logAction("Bulk Book Issue", issued + " students");
    closeModal("bulkBookModal");
    loadLibraryData();
  });
}

// ============ STUDENTS ============
function loadStudentsData() {
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
            '<tr><td colspan="7" style="text-align:center;">No students found</td></tr>';
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

async function addStudent(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var result = await API.addStudent(school, {
    name: document.getElementById("studentName").value,
    adm: document.getElementById("studentADM").value,
    form: document.getElementById("studentForm").value,
    stream: document.getElementById("studentStream").value,
    gender: document.getElementById("studentGender").value,
    dob: document.getElementById("studentDOB").value,
    parentName: document.getElementById("studentParentName").value,
    parentPhone: document.getElementById("studentParentPhone").value,
    parentEmail: document.getElementById("studentParentEmail").value,
    addedBy: user ? user.name : "",
  });

  if (result.success) {
    showNotification("Student added!", "success");
    logAction("Student Added", document.getElementById("studentName").value);
    closeModal("addStudentModal");
    document.getElementById("addStudentForm").reset();
    loadStudentsData();
  }
  return false;
}

async function deleteStudent(adm) {
  var confirmed = await DialogSystem.confirm("Delete this student?", {
    title: "Delete Student",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel",
  });

  if (confirmed !== "confirm") return;

  var school = getCurrentSchool();
  API.deleteStudent(school, adm).then(function () {
    showNotification("Student deleted!", "success");
    logAction("Student Deleted", adm);
    loadStudentsData();
  });
}

// ============ FURNITURE ============
function loadFurnitureData() {
  var school = getCurrentSchool();

  Promise.all([API.getFurniture(school), API.getClasses(school)]).then(
    function (results) {
      var furniture = results[0];
      var classes = results[1];

      document.getElementById("totalFurnitureStat").textContent =
        furniture.length;
      document.getElementById("activeFurnitureStat").textContent =
        furniture.length;

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

      // Populate bulk furniture classes
      var bulkClassSelect = document.getElementById("bulkFurnitureClass");
      if (bulkClassSelect) {
        var classHtml = '<option value="">Select Class</option>';
        classes.forEach(function (c) {
          classHtml +=
            '<option value="' +
            c.id +
            '">' +
            c.name +
            " " +
            (c.stream || "") +
            " (" +
            (c.students ? c.students.length : 0) +
            ")</option>";
        });
        bulkClassSelect.innerHTML = classHtml;
      }
    },
  );
}

async function allocateFurniture(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var result = await API.allocateFurniture(school, {
    studentName: document.getElementById("furnitureStudentName").value,
    adm: document.getElementById("furnitureADM").value,
    form: document.getElementById("furnitureForm").value,
    stream: document.getElementById("furnitureStream").value,
    chairNo: document.getElementById("chairNumber").value,
    lockerNo: document.getElementById("lockerNumber").value,
    allocationDate: document.getElementById("furnitureAllocationDate").value,
    issuedBy: user ? user.name : "",
  });

  if (result.success) {
    showNotification("Furniture allocated!", "success");
    logAction(
      "Furniture Allocated",
      document.getElementById("furnitureStudentName").value,
    );
    closeModal("allocateModal");
    loadFurnitureData();
  }
  return false;
}

async function returnFurnitureItem(furnitureId) {
  var confirmed = await DialogSystem.confirm(
    "Return this furniture? The record will be deleted.",
    {
      title: "Return Furniture",
      type: "info",
      confirmText: "Return",
      cancelText: "Cancel",
    },
  );

  if (confirmed !== "confirm") return;

  var school = getCurrentSchool();
  API.returnFurniture(school, furnitureId).then(function () {
    showNotification("Furniture returned!", "success");
    logAction("Furniture Returned", furnitureId);
    loadFurnitureData();
  });
}

function loadClassStudentsForFurniture() {
  var school = getCurrentSchool();
  var classId = document.getElementById("bulkFurnitureClass").value;
  if (!classId) return;

  API.getClasses(school).then(function (classes) {
    var selectedClass = null;
    classes.forEach(function (c) {
      if (c.id === classId) selectedClass = c;
    });

    if (selectedClass && selectedClass.students) {
      bulkFurnitureClass = selectedClass;
      var container = document.getElementById("bulkFurnitureStudents");
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
  var allocationDate =
    document.getElementById("bulkFurnitureDate").value || getCurrentDate();

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
            allocationDate: allocationDate,
            issuedBy: user ? user.name : "",
          }),
        );
        allocated++;
      }
    }
  });

  Promise.all(promises).then(function () {
    showNotification(
      "Allocated furniture to " + allocated + " students!",
      "success",
    );
    logAction("Bulk Furniture Allocation", allocated + " students");
    closeModal("bulkFurnitureModal");
    loadFurnitureData();
  });
}

// ============ CHAT ============
function loadChatUsers() {
  var school = getCurrentSchool();
  API.getUsers(school).then(function (users) {
    var currentUser = getCurrentUser();
    var userList = document.getElementById("chatUserList");
    if (!userList) return;

    var html = "";
    users.forEach(function (u) {
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
          u.name +
          '</div><small style="color:rgba(255,255,255,0.5);">' +
          u.role +
          "</small></div>" +
          "</button>";
      }
    });
    userList.innerHTML =
      html ||
      '<p style="color:rgba(255,255,255,0.5);text-align:center;">No other users</p>';
  });
}

function selectChatUser(email, name) {
  currentChatUserEmail = email;
  currentChatUserName = name;
  document.getElementById("chatWithName").textContent = name;
  loadChatMessages();

  var school = getCurrentSchool();
  var user = getCurrentUser();
  API.markMessagesAsRead(school, user.email, email).then(function () {
    checkUnreadMessages();
  });
}

function loadChatMessages() {
  if (!currentChatUserEmail) return;
  var school = getCurrentSchool();
  var user = getCurrentUser();

  API.getChatMessages(school, user.email, currentChatUserEmail).then(
    function (messages) {
      var container = document.getElementById("chatMessages");
      if (!container) return;

      if (messages.length === 0) {
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
          msg.fromName +
          ":</strong> " +
          msg.message +
          "<br><small>" +
          formatTime(msg.timestamp) +
          "</small>" +
          "</div></div>";
      });
      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;
    },
  );
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

  API.sendChatMessage(school, {
    fromEmail: user.email,
    fromName: user.name,
    toEmail: currentChatUserEmail,
    message: input.value,
  }).then(function () {
    input.value = "";
    loadChatMessages();
  });
  return false;
}

// ============ FORUM ============
function loadForumMessages() {
  var school = getCurrentSchool();
  API.getForumMessages(school).then(function (messages) {
    var container = document.getElementById("forumMessages");
    if (!container) return;

    if (messages.length === 0) {
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
        msg.fromName +
        "</strong><small>" +
        formatDateTime(msg.timestamp) +
        "</small></div>" +
        '<p style="margin:0;">' +
        msg.message +
        "</p></div>";
    });
    container.innerHTML = html;
  });
}

function postForumMessage(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();
  var input = document.getElementById("forumMessageInput");

  API.postForumMessage(school, {
    fromEmail: user.email,
    fromName: user.name,
    role: user.role,
    message: input.value,
  }).then(function () {
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

  API.getNotes(school, user.email).then(function (notes) {
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
  });
}

function saveNote(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  API.saveNote(school, {
    author: user.name,
    authorEmail: user.email,
    title: document.getElementById("noteTitle").value || "Untitled",
    content: document.getElementById("noteContent").innerHTML,
  }).then(function () {
    showNotification("Note saved!", "success");
    logAction("Note Saved", document.getElementById("noteTitle").value);
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").innerHTML = "";
    loadNotes();
  });
  return false;
}

async function deleteNote(noteId) {
  var confirmed = await DialogSystem.confirm("Delete this note?", {
    title: "Delete Note",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel",
  });

  if (confirmed !== "confirm") return;

  var school = getCurrentSchool();
  API.deleteNote(school, noteId).then(function () {
    showNotification("Note deleted!", "success");
    loadNotes();
  });
}

// ============ EVENTS ============
function loadEvents() {
  var school = getCurrentSchool();
  API.getEvents(school).then(function (events) {
    var container = document.getElementById("eventsList");
    if (!container) return;

    if (events.length === 0) {
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
        '<div style="display:flex;justify-content:space-between;">' +
        "<strong>" +
        event.title +
        "</strong>" +
        '<span class="badge badge-info">' +
        event.eventType +
        "</span></div>" +
        '<p style="margin:5px 0;">' +
        (event.description || "") +
        "</p>" +
        "<small>" +
        formatDate(event.eventDate) +
        "</small></div>";
    });
    container.innerHTML = html;
  });
}

function addEvent(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  API.addEvent(school, {
    title: document.getElementById("eventTitle").value,
    description: document.getElementById("eventDescription").value,
    eventDate: document.getElementById("eventDate").value,
    eventType: document.getElementById("eventType").value,
    createdBy: user ? user.name : "",
  }).then(function () {
    showNotification("Event added!", "success");
    logAction("Event Added", document.getElementById("eventTitle").value);
    closeModal("addEventModal");
    loadEvents();
  });
  return false;
}

// ============ FEES ============
function loadFeesData() {
  var school = getCurrentSchool();

  Promise.all([API.getStudents(school), API.getFees(school)]).then(
    function (results) {
      var students = results[0];
      var fees = results[1];

      var select = document.getElementById("feeStudent");
      if (select) {
        var selectHtml = '<option value="">Select Student</option>';
        students.forEach(function (s) {
          selectHtml +=
            '<option value="' +
            s.adm +
            '">' +
            s.name +
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
              "<tr>" +
              "<td>" +
              fee.studentName +
              "</td>" +
              "<td>" +
              fee.studentAdm +
              "</td>" +
              "<td>KES " +
              formatNumber(fee.amount) +
              "</td>" +
              "<td>KES " +
              formatNumber(fee.paid) +
              "</td>" +
              "<td>KES " +
              formatNumber(fee.balance) +
              "</td>" +
              "<td>" +
              fee.term +
              "</td>" +
              "<td>" +
              badge +
              "</td>" +
              '<td><button class="btn btn-sm btn-primary" onclick="editFee(\'' +
              fee.id +
              '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteFee(\'' +
              fee.id +
              '\')"><i class="fas fa-trash"></i></button></td>' +
              "</tr>";
          });
          tbody.innerHTML = html;
        }
      }

      var totalFees = fees.reduce(function (s, f) {
        return s + (f.amount || 0);
      }, 0);
      var totalPaid = fees.reduce(function (s, f) {
        return s + (f.paid || 0);
      }, 0);
      var totalBalance = fees.reduce(function (s, f) {
        return s + (f.balance || 0);
      }, 0);

      if (document.getElementById("totalFeesAmount"))
        document.getElementById("totalFeesAmount").textContent =
          formatCurrency(totalFees);
      if (document.getElementById("totalPaidAmount"))
        document.getElementById("totalPaidAmount").textContent =
          formatCurrency(totalPaid);
      if (document.getElementById("totalBalanceAmount"))
        document.getElementById("totalBalanceAmount").textContent =
          formatCurrency(totalBalance);
    },
  );
}

function editFee(feeId) {
  var school = getCurrentSchool();
  API.getFees(school).then(function (fees) {
    fees.forEach(function (fee) {
      if (fee.id === feeId) {
        currentEditingFeeId = feeId;
        document.getElementById("feeStudent").value = fee.studentAdm;
        document.getElementById("feeAmount").value = fee.amount;
        document.getElementById("feePaid").value = fee.paid;
        document.getElementById("feeTerm").value = fee.term;

        var btn = document.getElementById("saveFeeBtn");
        if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Update Fee';
      }
    });
  });
}

function saveFee(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var studentAdm = document.getElementById("feeStudent").value;

  if (!studentAdm) {
    showNotification("Select a student", "warning");
    return false;
  }

  var select = document.getElementById("feeStudent");
  var studentName = select.options[select.selectedIndex].text.split(" (")[0];

  API.saveFee(school, {
    id: currentEditingFeeId,
    studentAdm: studentAdm,
    studentName: studentName,
    amount: parseFloat(document.getElementById("feeAmount").value) || 0,
    paid: parseFloat(document.getElementById("feePaid").value) || 0,
    term: document.getElementById("feeTerm").value || "Term 1",
  }).then(function () {
    showNotification(
      currentEditingFeeId ? "Fee updated!" : "Fee saved!",
      "success",
    );
    logAction(
      currentEditingFeeId ? "Fee Updated" : "Fee Recorded",
      studentName,
    );
    currentEditingFeeId = null;
    var btn = document.getElementById("saveFeeBtn");
    if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Save Fee';
    loadFeesData();
  });
  return false;
}

async function deleteFee(feeId) {
  var confirmed = await DialogSystem.confirm("Delete this fee record?", {
    title: "Delete Fee",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel",
  });

  if (confirmed !== "confirm") return;

  var school = getCurrentSchool();
  API.deleteFee(school, feeId).then(function () {
    showNotification("Fee deleted!", "success");
    logAction("Fee Deleted", feeId);
    loadFeesData();
  });
}

// ============ TIMETABLE ============
function loadTimetableData() {
  var school = getCurrentSchool();

  Promise.all([
    API.getTimetable(school),
    API.getClasses(school),
    API.getTeachers(school),
  ]).then(function (results) {
    var timetable = results[0];
    var classes = results[1];
    var teachers = results[2];

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
            t.day +
            "</td><td>" +
            t.period +
            "</td><td>" +
            t.className +
            "</td><td>" +
            t.subject +
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
          c.name +
          '">' +
          c.name +
          " " +
          (c.stream || "") +
          "</option>";
      });
      classSelect.innerHTML = classHtml;
    }

    var teacherSelect = document.getElementById("ttTeacher");
    if (teacherSelect) {
      var teacherHtml = "";
      teachers.forEach(function (t) {
        teacherHtml += '<option value="' + t.name + '">' + t.name + "</option>";
      });
      teacherSelect.innerHTML = teacherHtml;
    }
  });
}

function addTimetableEntry(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  API.addTimetableEntry(school, {
    className: document.getElementById("ttClass").value,
    day: document.getElementById("ttDay").value,
    period: document.getElementById("ttPeriod").value,
    subject: document.getElementById("ttSubject").value,
    teacher: document.getElementById("ttTeacher").value,
    room: document.getElementById("ttRoom").value,
    createdBy: user ? user.name : "",
  }).then(function () {
    showNotification("Entry added!", "success");
    logAction("Timetable Added", document.getElementById("ttSubject").value);
    loadTimetableData();
  });
  return false;
}

// ============ TEACHERS ============
function loadTeachersData() {
  var school = getCurrentSchool();
  API.getTeachers(school).then(function (teachers) {
    var tbody = document.getElementById("teachersTableBody");
    if (!tbody) return;

    if (teachers.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;">No teachers</td></tr>';
      return;
    }

    var html = "";
    teachers.forEach(function (t) {
      html +=
        "<tr><td>" +
        t.name +
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
  });
}

async function addTeacher(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var result = await API.addTeacher(school, {
    name: document.getElementById("teacherName").value,
    email: document.getElementById("teacherEmail").value,
    phone: document.getElementById("teacherPhone").value,
    subjects: document.getElementById("teacherSubjects").value,
    classes: document.getElementById("teacherClasses").value,
    addedBy: user ? user.name : "",
  });

  if (result.success) {
    showNotification("Teacher added!", "success");
    logAction("Teacher Added", document.getElementById("teacherName").value);
    closeModal("addTeacherModal");
    loadTeachersData();
  }
  return false;
}

async function deleteTeacher(teacherId) {
  var confirmed = await DialogSystem.confirm("Delete this teacher?", {
    title: "Delete Teacher",
    type: "danger",
    confirmText: "Delete",
    cancelText: "Cancel",
  });

  if (confirmed !== "confirm") return;

  var school = getCurrentSchool();
  API.deleteTeacher(school, teacherId).then(function () {
    showNotification("Teacher deleted!", "success");
    logAction("Teacher Deleted", teacherId);
    loadTeachersData();
  });
}

// ============ CLASSES ============
function loadClassesData() {
  var school = getCurrentSchool();
  var user = getCurrentUser();

  API.getClasses(school).then(function (classes) {
    var container = document.getElementById("classesList");
    if (!container) return;

    if (classes.length === 0) {
      container.innerHTML =
        '<p style="text-align:center;color:rgba(255,255,255,0.5);">No classes yet</p>';
      return;
    }

    var html = "";
    classes.forEach(function (c) {
      var studentCount = c.students ? c.students.length : 0;
      var deleteBtn = "";
      if (user && user.role === "admin") {
        deleteBtn =
          '<button class="btn btn-sm btn-danger" onclick="deleteClass(\'' +
          c.id +
          '\')"><i class="fas fa-trash"></i> Delete</button>';
      }
      html +=
        '<div class="class-card">' +
        "<h4>" +
        c.name +
        " " +
        (c.stream || "") +
        "</h4>" +
        "<p>" +
        studentCount +
        " students</p>" +
        "<p>Teacher: " +
        (c.teacher || "Not assigned") +
        "</p>" +
        '<div style="display:flex;gap:8px;margin-top:10px;">' +
        '<button class="btn btn-sm btn-primary" onclick="viewClassStudents(\'' +
        c.id +
        '\')"><i class="fas fa-eye"></i> View</button> ' +
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
  reader.onload = function (e) {
    var data = e.target.result;
    var workbook = XLSX.read(data, { type: "binary" });
    var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    var jsonData = XLSX.utils.sheet_to_json(firstSheet);

    document.getElementById("excelStudentCount").textContent =
      jsonData.length + " students loaded";
    document.getElementById("excelStudentsData").value =
      JSON.stringify(jsonData);
    document.getElementById("excelStudentsData").dataset.loaded = "true";

    if (jsonData.length > 0) {
      var columns = Object.keys(jsonData[0]);
      var previewHtml = '<table class="data-table"><thead><tr>';
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
      document.getElementById("excelPreview").innerHTML = previewHtml;
    }
  };
  reader.readAsBinaryString(file);
}

function addClassWithExcel(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  var className = document.getElementById("className").value;
  var classStream = document.getElementById("classStream").value;
  var classTeacher = document.getElementById("classTeacher").value;
  var studentsData = document.getElementById("excelStudentsData").value;

  var students = [];
  if (
    studentsData &&
    document.getElementById("excelStudentsData").dataset.loaded === "true"
  ) {
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
    createdBy: user ? user.name : "",
  }).then(function () {
    showNotification(
      "Class added with " + students.length + " students!",
      "success",
    );
    logAction(
      "Class Added",
      className + " with " + students.length + " students",
    );
    closeModal("addClassModal");
    loadClassesData();
  });
  return false;
}

function viewClassStudents(classId) {
  var school = getCurrentSchool();
  API.getClasses(school).then(function (classes) {
    classes.forEach(function (cls) {
      if (cls.id === classId) {
        var students = cls.students || [];

        var existingModal = document.getElementById("viewStudentsModal");
        if (existingModal) existingModal.remove();

        var modal = document.createElement("div");
        modal.className = "modal active";
        modal.id = "viewStudentsModal";

        var html =
          '<div class="modal-content">' +
          '<div class="modal-header">' +
          '<h3><i class="fas fa-users"></i> ' +
          cls.name +
          " Students</h3>" +
          '<button class="modal-close" onclick="closeModal(\'viewStudentsModal\')"><i class="fas fa-times"></i></button>' +
          "</div>";

        if (students.length === 0) {
          html += '<p style="text-align:center;">No students in this class</p>';
        } else {
          html +=
            '<table class="data-table"><thead><tr><th>#</th><th>Name</th><th>ADM</th><th>Gender</th></tr></thead><tbody>';
          students.forEach(function (s, i) {
            var name = s.Name || s.name || s["Full Name"] || "Unknown";
            var adm = s.ADM || s.adm || s["ADM No"] || "-";
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
          html += "</tbody></table>";
        }
        html += "</div>";
        modal.innerHTML = html;
        document.body.appendChild(modal);
      }
    });
  });
}

async function deleteClass(classId) {
  var confirmed = await DialogSystem.confirm(
    "Delete this class? All students in this class will be removed.",
    {
      title: "Delete Class",
      type: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    },
  );

  if (confirmed !== "confirm") return;

  var school = getCurrentSchool();
  API.deleteClass(school, classId).then(function () {
    showNotification("Class deleted!", "success");
    logAction("Class Deleted", classId);
    loadClassesData();
  });
}

// ============ TERMS ============
function loadTerms() {
  var school = getCurrentSchool();
  API.getTerms(school).then(function (terms) {
    var container = document.getElementById("termsList");
    if (!container) return;

    if (terms.length === 0) {
      container.innerHTML =
        '<p style="text-align:center;color:rgba(255,255,255,0.5);">No terms</p>';
      return;
    }

    var html = "";
    terms.forEach(function (term) {
      var current = term.isCurrent ? "✅ Current" : "";
      var border = term.isCurrent ? "border-left:4px solid #28a745;" : "";
      html +=
        '<div class="term-card" style="' +
        border +
        '">' +
        "<h4>" +
        term.name +
        " " +
        current +
        "</h4>" +
        "<p>" +
        term.startDate +
        " → " +
        term.endDate +
        "</p></div>";
    });
    container.innerHTML = html;
  });
}

function addTerm(event) {
  event.preventDefault();
  var school = getCurrentSchool();
  var user = getCurrentUser();

  API.addTerm(school, {
    name: document.getElementById("termName").value,
    startDate: document.getElementById("termStartDate").value,
    endDate: document.getElementById("termEndDate").value,
    createdBy: user ? user.name : "",
  }).then(function () {
    showNotification("Term added!", "success");
    logAction("Term Added", document.getElementById("termName").value);
    closeModal("addTermModal");
    loadTerms();
  });
  return false;
}

// ============ AUDIT LOG ============
function loadAuditLog() {
  var school = getCurrentSchool();
  API.getAuditLog(school).then(function (logs) {
    var tbody = document.getElementById("auditLogBody");
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">No audit log entries</td></tr>';
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
        (log.userEmail || "-") +
        "</td><td>" +
        (log.action || "-") +
        "</td><td>" +
        (log.details || "-") +
        "</td></tr>";
    });
    tbody.innerHTML = html;
  });
}

// ============ SETTINGS ============
function loadSettingsData() {
  var school = getCurrentSchool();

  API.getSchool(school).then(function (schoolInfo) {
    if (schoolInfo) {
      document.getElementById("schoolNameInput").value = schoolInfo.name || "";
      document.getElementById("schoolAddress").value = schoolInfo.address || "";
      document.getElementById("adminName").value = schoolInfo.adminName || "";
      document.getElementById("adminEmail").value = schoolInfo.adminEmail || "";
      document.getElementById("schoolMotto").value = schoolInfo.motto || "";
    }
  });

  API.getSettings(school).then(function (settings) {
    if (settings) {
      document.getElementById("maxBorrowDays").value =
        settings.maxBorrowDays || 14;
      document.getElementById("maxBooksPerStudent").value =
        settings.maxBooksPerStudent || 3;
      document.getElementById("finePerDay").value = settings.finePerDay || 10;
    }
  });

  API.getUsers(school).then(function (users) {
    var tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    var currentUser = getCurrentUser();
    var html = "";

    users.forEach(function (u) {
      var status =
        u.isActive !== false
          ? '<span class="badge badge-success">Active</span>'
          : '<span class="badge badge-danger">Inactive</span>';
      var roleBadge =
        u.role === "admin"
          ? '<span class="badge badge-admin">Admin</span>'
          : '<span class="badge badge-info">' + u.role + "</span>";

      var actions = "";
      if (u.role !== "admin") {
        actions +=
          '<button class="btn-promote" onclick="promoteToAdmin(\'' +
          u.email +
          '\')"><i class="fas fa-arrow-up"></i> Promote</button> ';
      }
      if (u.email !== currentUser.email) {
        actions +=
          '<button class="btn btn-sm btn-danger" onclick="deleteUser(\'' +
          u.email +
          '\')"><i class="fas fa-trash"></i></button>';
      } else {
        actions +=
          '<span style="font-size:11px;color:rgba(255,255,255,0.4);">You</span>';
      }

      html +=
        "<tr><td>" +
        u.name +
        "</td><td>" +
        u.email +
        "</td><td>" +
        roleBadge +
        "</td><td>" +
        status +
        "</td><td>" +
        actions +
        "</td></tr>";
    });
    tbody.innerHTML = html;
  });
}

async function promoteToAdmin(email) {
  var confirmed = await DialogSystem.confirm("Promote this user to admin?", {
    title: "Promote User",
    type: "success",
    confirmText: "Promote",
    cancelText: "Cancel",
  });

  if (confirmed !== "confirm") return;

  var school = getCurrentSchool();
  API.updateUser(school, email, { role: "admin" }).then(function () {
    showNotification("User promoted!", "success");
    logAction("User Promoted", email);
    loadSettingsData();
  });
}

// ============ REPORTS ============
function loadReports() {
  var school = getCurrentSchool();

  Promise.all([
    API.getBooks(school),
    API.getStudents(school),
    API.getBorrowed(school),
    API.getFurniture(school),
  ]).then(function (results) {
    var books = results[0];
    var students = results[1];
    var borrowed = results[2];
    var furniture = results[3];

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

    document.getElementById("overdueCount").textContent = overdue.length;
    document.getElementById("activeLoansCount").textContent =
      activeLoans.length;
    document.getElementById("returnRate").textContent = returnRate + "%";
    document.getElementById("furnitureCount").textContent = furniture.length;

    if (typeof Chart !== "undefined") {
      createBooksByTypeChart(books);
      createStudentsByFormChart(students);
      createFurnitureChart(furniture);
      createBorrowingTrendChart(borrowed);
    }
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
      var thumbUrl = wallpaper.url.replace(
        "w=1920",
        "w=400&h=250&fit=crop&q=60",
      );
      previewStyle =
        'background-image:url("' +
        thumbUrl +
        '");background-size:cover;background-position:center;';
    }

    html +=
      '<div class="wallpaper-card' +
      isActive +
      '" onclick="selectWallpaper(\'' +
      key +
      "')\">" +
      '<div class="check-badge"><i class="fas fa-check"></i></div>' +
      '<div class="wallpaper-preview" style="' +
      previewStyle +
      '"></div>' +
      '<div class="wallpaper-info"><h3>' +
      wallpaper.name +
      "</h3></div></div>";
  }
  grid.innerHTML = html;
}

function selectWallpaper(key) {
  localStorage.setItem("srms_wallpaper", key);

  var cards = document.querySelectorAll(".wallpaper-card");
  cards.forEach(function (card) {
    card.classList.remove("active");
  });
  event.target.closest(".wallpaper-card").classList.add("active");

  var wallpaper = WALLPAPER_DATA[key];
  if (wallpaper.type === "gradient") {
    document.body.style.background = wallpaper.css;
    document.body.style.backgroundImage = "none";
  } else {
    document.body.style.backgroundImage =
      'linear-gradient(rgba(10,14,39,0.55),rgba(10,14,39,0.65)),url("' +
      wallpaper.url +
      '")';
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  }

  showNotification("Wallpaper applied!", "success");
}

// ============ QR CODES ============
function loadQRCodeList() {
  var school = getCurrentSchool();
  API.getQRCodes(school).then(function (codes) {
    var container = document.getElementById("qrCodeList");
    if (!container) return;

    if (codes.length === 0) {
      container.innerHTML =
        '<p style="text-align:center;">No QR codes generated yet</p>';
      return;
    }

    var html =
      '<table class="data-table"><thead><tr><th>Code</th><th>Type</th><th>Status</th><th>Assigned To</th><th>Class</th></tr></thead><tbody>';
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
        qr.code +
        "</strong></td><td>" +
        qr.type +
        '</td><td><span class="badge ' +
        badgeClass +
        '">' +
        status +
        "</span></td><td>" +
        (qr.assignedTo || "-") +
        "</td><td>" +
        (qr.className || "-") +
        "</td></tr>";
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  });
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
    "auditLog",
    "users",
    "chat",
    "forum",
    "notes",
  ];
  var select = document.getElementById("databaseTableSelect");
  if (!select) return;

  var html = "";
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

  setTimeout(loadDatabaseTable, 300);
}

function loadDatabaseTable() {
  var school = getCurrentSchool();
  var tableName = document.getElementById("databaseTableSelect").value;

  API.getTableData(school, tableName).then(function (data) {
    var tbody = document.getElementById("databaseTableBody");
    var thead = document.getElementById("databaseTableHead");

    if (!tbody || !thead) return;

    if (data.length === 0) {
      thead.innerHTML = "";
      tbody.innerHTML = "<tr><td>No data in this table</td></tr>";
      return;
    }

    var columns = Object.keys(data[0]);
    var filteredColumns = columns.filter(function (c) {
      return c !== "password";
    });

    var headHtml = "";
    filteredColumns.forEach(function (col) {
      headHtml += "<th>" + col + "</th>";
    });
    thead.innerHTML = headHtml;

    var bodyHtml = "";
    data.forEach(function (row) {
      bodyHtml += "<tr>";
      filteredColumns.forEach(function (col) {
        var value = row[col];
        if (typeof value === "object") value = JSON.stringify(value);
        bodyHtml += "<td>" + (value || "-") + "</td>";
      });
      bodyHtml += "</tr>";
    });
    tbody.innerHTML = bodyHtml;
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
