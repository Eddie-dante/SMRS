// ============================================
// SRMS - Complete Utility Functions
// ============================================

// ============ GENERATION FUNCTIONS ============
function generateInviteCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generateStaffId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'STAFF-';
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function generateCode(prefix = '', length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + code;
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ============ HASHING ============
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// ============ DATE FUNCTIONS ============
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

function getCurrentDateTime() {
    return new Date().toISOString();
}

function getDateDisplay() {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function daysOverdue(returnDate) {
    if (!returnDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(returnDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = today - dueDate;
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
}

function isOverdue(returnDate) {
    return daysOverdue(returnDate) > 0;
}

function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function subtractDays(dateString, days) {
    return addDays(dateString, -days);
}

function getMonthName(monthNumber) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber] || '';
}

function getMonthShortName(monthNumber) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber] || '';
}

function getDayName(dayNumber) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || '';
}

function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 9 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

// ============ NOTIFICATIONS ============
function showNotification(message, type = 'success', duration = 3000) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || icons.success}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ============ AUTH FUNCTIONS ============
function checkAuth() {
    const user = localStorage.getItem('srms_user');
    const school = localStorage.getItem('srms_school');
    
    if (!user || !school) {
        if (!window.location.href.includes('index.html')) {
            window.location.href = 'index.html';
        }
        return null;
    }
    
    try {
        return JSON.parse(user);
    } catch (error) {
        localStorage.removeItem('srms_user');
        localStorage.removeItem('srms_school');
        if (!window.location.href.includes('index.html')) {
            window.location.href = 'index.html';
        }
        return null;
    }
}

function getCurrentUser() {
    const user = localStorage.getItem('srms_user');
    if (!user) return null;
    try { return JSON.parse(user); } catch { return null; }
}

function getCurrentSchool() {
    return localStorage.getItem('srms_school');
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function logout() {
    localStorage.removeItem('srms_user');
    localStorage.removeItem('srms_school');
    showNotification('Logged out successfully!', 'success');
    setTimeout(() => window.location.href = 'index.html', 1000);
}

// ============ VALIDATION ============
function validateEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

function validatePhone(phone) {
    const pattern = /^\+?[\d\s-]{10,}$/;
    return pattern.test(phone);
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

// ============ FORMATTING ============
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number || 0);
}

function capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function capitalizeWords(string) {
    if (!string) return '';
    return string.replace(/\b\w/g, char => char.toUpperCase());
}

function truncateText(text, length = 50) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============ MODAL FUNCTIONS ============
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    document.body.style.overflow = 'auto';
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAllModals();
    }
});

// ============ TABLE FUNCTIONS ============
function filterTable(searchInput, tableBody) {
    if (!searchInput || !tableBody) return;
    const filter = searchInput.value.toLowerCase();
    const rows = tableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const rowText = rows[i].textContent.toLowerCase();
        rows[i].style.display = rowText.includes(filter) ? '' : 'none';
    }
}

function exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Export successful!', 'success');
}

// ============ LOADING ============
function showLoading(message = 'Loading...') {
    const existing = document.getElementById('globalLoader');
    if (existing) existing.remove();
    
    const loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); z-index: 2000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
    `;
    loader.innerHTML = `
        <div style="width:50px;height:50px;border:4px solid rgba(255,255,255,0.3);border-top:4px solid #d4af37;border-radius:50%;animation:spin 1s linear infinite;"></div>
        <p style="color:#fff;margin-top:20px;">${message}</p>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.remove();
}

// ============ MISC ============
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function generateRandomColor() {
    const colors = ['#e94560', '#0f3460', '#d4af37', '#28a745', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function isEmpty(str) {
    return !str || str.trim().length === 0;
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Copied to clipboard!', 'success');
    });
}

// Export all to window
window.generateInviteCode = generateInviteCode;
window.generateStaffId = generateStaffId;
window.generateCode = generateCode;
window.generateUniqueId = generateUniqueId;
window.hashPassword = hashPassword;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatTime = formatTime;
window.getCurrentDate = getCurrentDate;
window.getCurrentDateTime = getCurrentDateTime;
window.getDateDisplay = getDateDisplay;
window.daysBetween = daysBetween;
window.daysOverdue = daysOverdue;
window.isOverdue = isOverdue;
window.addDays = addDays;
window.subtractDays = subtractDays;
window.getMonthName = getMonthName;
window.getMonthShortName = getMonthShortName;
window.getDayName = getDayName;
window.getCurrentAcademicYear = getCurrentAcademicYear;
window.showNotification = showNotification;
window.checkAuth = checkAuth;
window.getCurrentUser = getCurrentUser;
window.getCurrentSchool = getCurrentSchool;
window.isAdmin = isAdmin;
window.logout = logout;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validateRequired = validateRequired;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.capitalizeFirst = capitalizeFirst;
window.capitalizeWords = capitalizeWords;
window.truncateText = truncateText;
window.getInitials = getInitials;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.filterTable = filterTable;
window.exportToCSV = exportToCSV;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.debounce = debounce;
window.throttle = throttle;
window.generateRandomColor = generateRandomColor;
window.isEmpty = isEmpty;
window.getQueryParam = getQueryParam;
window.copyToClipboard = copyToClipboard;