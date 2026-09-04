// ============================================
// SRMS - Complete Utility Functions
// Full Version
// ============================================

// ============ DATE FUNCTIONS ============
function getCurrentDate() {
  var today = new Date();
  var year = today.getFullYear();
  var month = String(today.getMonth() + 1).padStart(2, "0");
  var day = String(today.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function getCurrentDateTime() {
  return new Date().toISOString();
}

function getDateDisplay() {
  var now = new Date();
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("en-US", options);
}

function formatDate(dateString) {
  if (!dateString) return "-";
  var date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  var date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dateString) {
  if (!dateString) return "-";
  var date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function addDays(dateString, days) {
  var date = new Date(dateString);
  date.setDate(date.getDate() + days);
  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function subtractDays(dateString, days) {
  return addDays(dateString, -days);
}

function daysOverdue(returnDate) {
  if (!returnDate) return 0;
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var dueDate = new Date(returnDate);
  dueDate.setHours(0, 0, 0, 0);
  var diffTime = today - dueDate;
  var days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

function isOverdue(returnDate) {
  return daysOverdue(returnDate) > 0;
}

function daysBetween(date1, date2) {
  var d1 = new Date(date1);
  var d2 = new Date(date2);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  var diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getMonthName(monthNumber) {
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthNumber] || "";
}

function getMonthShortName(monthNumber) {
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[monthNumber] || "";
}

function getDayName(dayNumber) {
  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber] || "";
}

function getCurrentAcademicYear() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  if (month >= 9) {
    return year + "/" + (year + 1);
  } else {
    return year - 1 + "/" + year;
  }
}

// ============ FORMATTING FUNCTIONS ============
function formatNumber(number) {
  if (number === undefined || number === null) return "0";
  return new Intl.NumberFormat("en-US").format(number);
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null) amount = 0;
  return "KES " + new Intl.NumberFormat("en-KE").format(amount);
}

function capitalizeFirst(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function capitalizeWords(string) {
  if (!string) return "";
  return string.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}

function truncateText(text, length) {
  if (!text) return "";
  length = length || 50;
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

function getInitials(name) {
  if (!name) return "U";
  var parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============ GENERATION FUNCTIONS ============
function generateCode(prefix, length) {
  prefix = prefix || "";
  length = length || 8;
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var code = "";
  for (var i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + code;
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function generateRandomColor() {
  var colors = [
    "#e94560",
    "#0f3460",
    "#d4af37",
    "#28a745",
    "#17a2b8",
    "#6f42c1",
    "#fd7e14",
    "#20c997",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ============ VALIDATION FUNCTIONS ============
function validateEmail(email) {
  var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

function validatePhone(phone) {
  var pattern = /^\+?[\d\s-]{10,}$/;
  return pattern.test(phone);
}

function validateRequired(value) {
  return value && value.trim().length > 0;
}

function isEmpty(str) {
  return !str || str.trim().length === 0;
}

// ============ AUTH FUNCTIONS ============
function checkAuth() {
  var user = localStorage.getItem("srms_user");
  var school = localStorage.getItem("srms_school");
  if (!user || !school) {
    if (
      window.location.pathname.indexOf("index.html") === -1 &&
      window.location.pathname.indexOf("landing.html") === -1 &&
      window.location.pathname.indexOf("wallpaper.html") === -1
    ) {
      window.location.href = "index.html";
    }
    return null;
  }
  try {
    return JSON.parse(user);
  } catch (error) {
    localStorage.removeItem("srms_user");
    localStorage.removeItem("srms_school");
    return null;
  }
}

function getCurrentUser() {
  var user = localStorage.getItem("srms_user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (error) {
    return null;
  }
}

function getCurrentSchool() {
  return localStorage.getItem("srms_school");
}

function isAdmin() {
  var user = getCurrentUser();
  return user && user.role === "admin";
}

function logout() {
  localStorage.removeItem("srms_user");
  localStorage.removeItem("srms_school");
  window.location.href = "index.html";
}

// ============ NOTIFICATION FUNCTIONS ============
function showNotification(message, type) {
  type = type || "success";
  var colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  };
  var icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  var existing = document.querySelectorAll(".notification");
  existing.forEach(function (el) {
    el.remove();
  });

  var notification = document.createElement("div");
  notification.className = "notification notification-" + type;
  notification.style.cssText =
    "position:fixed;top:80px;right:20px;padding:15px 20px;background:" +
    (colors[type] || colors.info) +
    ";color:#fff;border-radius:12px;z-index:9999;max-width:350px;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.5);display:flex;align-items:center;gap:10px;transform:translateX(120%);transition:transform 0.3s ease;";
  notification.innerHTML =
    '<i class="fas ' +
    (icons[type] || icons.info) +
    '"></i><span>' +
    message +
    "</span>";
  document.body.appendChild(notification);

  setTimeout(function () {
    notification.style.transform = "translateX(0)";
  }, 100);
  setTimeout(function () {
    notification.style.transform = "translateX(120%)";
    setTimeout(function () {
      if (notification.parentNode) notification.remove();
    }, 300);
  }, 3000);
}

// ============ MODAL FUNCTIONS ============
function openModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

function closeAllModals() {
  var modals = document.querySelectorAll(".modal");
  modals.forEach(function (m) {
    m.classList.remove("active");
  });
  document.body.style.overflow = "auto";
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("modal")) {
    event.target.classList.remove("active");
    document.body.style.overflow = "auto";
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeAllModals();
  }
});

// ============ TABLE FUNCTIONS ============
function filterTable(searchInput, tableBody) {
  if (!searchInput || !tableBody) return;
  var filter = searchInput.value.toLowerCase();
  var rows = tableBody.getElementsByTagName("tr");
  for (var i = 0; i < rows.length; i++) {
    var rowText = rows[i].textContent.toLowerCase();
    rows[i].style.display = rowText.indexOf(filter) > -1 ? "" : "none";
  }
}

function exportToCSV(data, filename) {
  filename = filename || "export.csv";
  if (!data || data.length === 0) {
    showNotification("No data to export", "warning");
    return;
  }
  var headers = Object.keys(data[0]);
  var csvContent = headers.join(",") + "\n";
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var rowArray = [];
    for (var j = 0; j < headers.length; j++) {
      var value = row[headers[j]] || "";
      rowArray.push(JSON.stringify(String(value)));
    }
    csvContent += rowArray.join(",") + "\n";
  }
  var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  var link = document.createElement("a");
  var url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showNotification("Export successful!", "success");
}

// ============ EXPORT ALL ============
window.getCurrentDate = getCurrentDate;
window.getCurrentDateTime = getCurrentDateTime;
window.getDateDisplay = getDateDisplay;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatTime = formatTime;
window.addDays = addDays;
window.subtractDays = subtractDays;
window.daysOverdue = daysOverdue;
window.isOverdue = isOverdue;
window.daysBetween = daysBetween;
window.getMonthName = getMonthName;
window.getMonthShortName = getMonthShortName;
window.getDayName = getDayName;
window.getCurrentAcademicYear = getCurrentAcademicYear;
window.formatNumber = formatNumber;
window.formatCurrency = formatCurrency;
window.capitalizeFirst = capitalizeFirst;
window.capitalizeWords = capitalizeWords;
window.truncateText = truncateText;
window.getInitials = getInitials;
window.generateCode = generateCode;
window.generateUniqueId = generateUniqueId;
window.generateRandomColor = generateRandomColor;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validateRequired = validateRequired;
window.isEmpty = isEmpty;
window.checkAuth = checkAuth;
window.getCurrentUser = getCurrentUser;
window.getCurrentSchool = getCurrentSchool;
window.isAdmin = isAdmin;
window.logout = logout;
window.showNotification = showNotification;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.filterTable = filterTable;
window.exportToCSV = exportToCSV;
