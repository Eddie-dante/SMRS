// ============================================
// SRMS - Complete Utility Functions
// Version 2.0 - Full Featured
// ============================================

// ============ GENERATION FUNCTIONS ============

// Generate random invite code
function generateInviteCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Generate staff ID
function generateStaffId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'STAFF-';
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Generate random code
function generateCode(prefix = '', length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + code;
}

// Generate unique ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ============ HASHING FUNCTIONS ============

// Simple password hash
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

// Format date to readable string
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date and time
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format time only
function formatTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Get current date and time
function getCurrentDateTime() {
    return new Date().toISOString();
}

// Get date display for top bar
function getDateDisplay() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
}

// Calculate days between two dates
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate days overdue
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

// Check if date is overdue
function isOverdue(returnDate) {
    return daysOverdue(returnDate) > 0;
}

// Add days to date
function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// Subtract days from date
function subtractDays(dateString, days) {
    return addDays(dateString, -days);
}

// Get month name
function getMonthName(monthNumber) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber] || '';
}

// Get month short name
function getMonthShortName(monthNumber) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber] || '';
}

// Get day name
function getDayName(dayNumber) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || '';
}

// Get current academic year
function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 9 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

// ============ NOTIFICATION FUNCTIONS ============

// Show notification
function showNotification(message, type = 'success', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
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
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ============ AUTH FUNCTIONS ============

// Check if user is authenticated
function checkAuth() {
    const user = localStorage.getItem('srms_user');
    const school = localStorage.getItem('srms_school');
    
    if (!user || !school) {
        window.location.href = 'index.html';
        return null;
    }
    
    try {
        return JSON.parse(user);
    } catch (error) {
        localStorage.removeItem('srms_user');
        localStorage.removeItem('srms_school');
        window.location.href = 'index.html';
        return null;
    }
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('srms_user');
    if (!user) return null;
    
    try {
        return JSON.parse(user);
    } catch (error) {
        return null;
    }
}

// Get current school
function getCurrentSchool() {
    return localStorage.getItem('srms_school');
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Logout user
function logout() {
    localStorage.removeItem('srms_user');
    localStorage.removeItem('srms_school');
    showNotification('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ============ VALIDATION FUNCTIONS ============

// Validate email
function validateEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

// Validate phone number
function validatePhone(phone) {
    const pattern = /^\+?[\d\s-]{10,}$/;
    return pattern.test(phone);
}

// Validate required field
function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Validate password strength
function validatePassword(password) {
    if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
    if (password.length > 50) return { valid: false, message: 'Password must be less than 50 characters' };
    return { valid: true, message: '' };
}

// ============ FORMATTING FUNCTIONS ============

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
    }).format(amount || 0);
}

// Format number with commas
function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number || 0);
}

// Capitalize first letter
function capitalizeFirst(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Capitalize all words
function capitalizeWords(string) {
    if (!string) return '';
    return string.replace(/\b\w/g, char => char.toUpperCase());
}

// Truncate text
function truncateText(text, length = 50) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// Get initials from name
function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============ MODAL FUNCTIONS ============

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

// Close modal on outside click
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAllModals();
    }
});

// ============ TABLE FUNCTIONS ============

// Filter table rows
function filterTable(searchInput, tableBody) {
    if (!searchInput || !tableBody) return;
    const filter = searchInput.value.toLowerCase();
    const rows = tableBody.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const rowText = rows[i].textContent.toLowerCase();
        rows[i].style.display = rowText.includes(filter) ? '' : 'none';
    }
}

// Export table to CSV
function exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => 
                JSON.stringify(row[header] || '')
            ).join(',')
        )
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

// ============ LOADING FUNCTIONS ============

// Show loading spinner
function showLoading(message = 'Loading...') {
    const existingLoader = document.getElementById('globalLoader');
    if (existingLoader) existingLoader.remove();
    
    const loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 2000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    loader.innerHTML = `
        <div style="width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid #d4af37; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="color: #ffffff; margin-top: 20px; font-size: 16px;">${message}</p>
    `;
    document.body.appendChild(loader);
}

// Hide loading spinner
function hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.remove();
    }
}

// ============ MISC FUNCTIONS ============

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
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

// Generate random color
function generateRandomColor() {
    const colors = [
        '#e94560', '#0f3460', '#d4af37', '#28a745',
        '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Check if string is empty
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

// Get query parameter from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set query parameter in URL
function setQueryParam(param, value) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set(param, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Copied to clipboard!', 'success');
    });
}

// Scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Get file extension
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// Check if file is image
function isImageFile(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    return imageExtensions.includes(getFileExtension(filename));
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Export all functions to window
window.utils = {
    generateInviteCode,
    generateStaffId,
    generateCode,
    generateUniqueId,
    hashPassword,
    formatDate,
    formatDateTime,
    formatTime,
    getCurrentDate,
    getCurrentDateTime,
    getDateDisplay,
    daysBetween,
    daysOverdue,
    isOverdue,
    addDays,
    subtractDays,
    getMonthName,
    getMonthShortName,
    getDayName,
    getCurrentAcademicYear,
    showNotification,
    checkAuth,
    getCurrentUser,
    getCurrentSchool,
    isAdmin,
    logout,
    validateEmail,
    validatePhone,
    validateRequired,
    validatePassword,
    formatCurrency,
    formatNumber,
    capitalizeFirst,
    capitalizeWords,
    truncateText,
    getInitials,
    openModal,
    closeModal,
    closeAllModals,
    filterTable,
    exportToCSV,
    showLoading,
    hideLoading,
    debounce,
    throttle,
    generateRandomColor,
    isEmpty,
    getQueryParam,
    setQueryParam,
    copyToClipboard,
    scrollToElement,
    getFileExtension,
    isImageFile,
    fileToBase64
};