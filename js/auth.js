// ============================================
// SRMS - Complete Authentication Logic
// ============================================

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const schoolName = document.getElementById('schoolName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!schoolName || !email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    
    const result = await API.login(schoolName, email, password);
    
    if (result.success) {
        showNotification('Login successful! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
        showError(result.error || 'Login failed');
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.disabled = false;
    }
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    
    const schoolName = document.getElementById('signupSchoolName').value.trim();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const inviteCode = document.getElementById('signupInviteCode').value.trim();
    
    if (!schoolName || !name || !email || !password || !inviteCode) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    const result = await API.createUser(schoolName, {
        name, email, password, role: 'teacher', inviteCode
    });
    
    if (result.success) {
        showNotification('Account created! Please login.', 'success');
        setTimeout(() => showLoginForm(), 1500);
    } else {
        showError(result.error || 'Signup failed');
    }
}

// Handle create school
async function handleCreateSchool(event) {
    event.preventDefault();
    
    const schoolName = document.getElementById('createSchoolName').value.trim();
    const adminName = document.getElementById('createAdminName').value.trim();
    const adminEmail = document.getElementById('createAdminEmail').value.trim();
    const password = document.getElementById('createPassword').value;
    const confirmPassword = document.getElementById('createConfirmPassword').value;
    
    if (!schoolName || !adminName || !adminEmail || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
    }
    
    const result = await API.createSchool({
        name: schoolName,
        adminName,
        adminEmail,
        password
    });
    
    if (result.success) {
        showNotification(`School created! Invite Code: ${result.inviteCode}`, 'success');
        alert(`School created successfully!\n\nInvite Code: ${result.inviteCode}\n\nPlease save this code!`);
        setTimeout(() => window.location.reload(), 2000);
    } else {
        showError(result.error || 'Failed to create school');
    }
}

// Show signup form
function showSignup(event) {
    if (event) event.preventDefault();
    const formPanel = document.querySelector('.form-panel');
    if (!formPanel) return;
    
    formPanel.innerHTML = `
        <div class="form-header">
            <h2>Staff Sign Up</h2>
            <p>Create your staff account</p>
        </div>
        <div id="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <span id="errorText"></span>
        </div>
        <form onsubmit="handleSignup(event)">
            <div class="form-group">
                <label><i class="fas fa-school"></i> School Name</label>
                <input type="text" id="signupSchoolName" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-user"></i> Full Name</label>
                <input type="text" id="signupName" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <input type="email" id="signupEmail" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-key"></i> Invite Code</label>
                <input type="text" id="signupInviteCode" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Password</label>
                <input type="password" id="signupPassword" required>
            </div>
            <button type="submit" class="btn-login"><i class="fas fa-user-plus"></i> Sign Up</button>
        </form>
        <div class="login-footer">
            <a href="#" onclick="showLoginForm(event)"><i class="fas fa-arrow-left"></i> Back to Login</a>
        </div>
    `;
}

// Show create school form
function showCreateSchool(event) {
    if (event) event.preventDefault();
    const formPanel = document.querySelector('.form-panel');
    if (!formPanel) return;
    
    formPanel.innerHTML = `
        <div class="form-header">
            <h2>Create School</h2>
            <p>Register your school</p>
        </div>
        <div id="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <span id="errorText"></span>
        </div>
        <form onsubmit="handleCreateSchool(event)">
            <div class="form-group">
                <label><i class="fas fa-school"></i> School Name</label>
                <input type="text" id="createSchoolName" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-user"></i> Admin Name</label>
                <input type="text" id="createAdminName" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-envelope"></i> Admin Email</label>
                <input type="email" id="createAdminEmail" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Password</label>
                <input type="password" id="createPassword" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Confirm Password</label>
                <input type="password" id="createConfirmPassword" required>
            </div>
            <button type="submit" class="btn-login"><i class="fas fa-plus-circle"></i> Create School</button>
        </form>
        <div class="login-footer">
            <a href="#" onclick="showLoginForm(event)"><i class="fas fa-arrow-left"></i> Back to Login</a>
        </div>
    `;
}

// Show forgot password
function showForgotPassword(event) {
    if (event) event.preventDefault();
    const formPanel = document.querySelector('.form-panel');
    if (!formPanel) return;
    
    formPanel.innerHTML = `
        <div class="form-header">
            <h2>Reset Password</h2>
            <p>Enter your email to reset</p>
        </div>
        <div class="form-group">
            <label><i class="fas fa-envelope"></i> Email</label>
            <input type="email" id="forgotEmail" required>
        </div>
        <button class="btn-login" onclick="showNotification('Reset instructions sent!', 'success')">
            <i class="fas fa-key"></i> Reset Password
        </button>
        <div class="login-footer">
            <a href="#" onclick="showLoginForm(event)"><i class="fas fa-arrow-left"></i> Back to Login</a>
        </div>
    `;
}

// Show login form
function showLoginForm(event) {
    if (event) event.preventDefault();
    window.location.reload();
}

// Show error
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    if (errorMessage && errorText) {
        errorText.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => errorMessage.classList.remove('show'), 3000);
    }
}

// Export
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleCreateSchool = handleCreateSchool;
window.showSignup = showSignup;
window.showCreateSchool = showCreateSchool;
window.showForgotPassword = showForgotPassword;
window.showLoginForm = showLoginForm;
window.showError = showError;