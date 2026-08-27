// ============================================
// SRMS - Authentication Logic
// ============================================

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    // Get form values
    const schoolName = document.getElementById('schoolName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate inputs
    if (!schoolName || !email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    
    try {
        // Attempt login
        const result = await API.login(schoolName, email, password);
        
        if (result.success) {
            // Hide error
            hideError();
            
            // Show success notification
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showError(result.error || 'Login failed');
            
            // Reset button
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');
        
        // Reset button
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    // Get form values
    const schoolName = document.getElementById('signupSchoolName').value.trim();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validate inputs
    if (!schoolName || !name || !email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    try {
        // Create user
        const result = await API.createUser(schoolName, {
            name,
            email,
            password,
            role: 'teacher'
        });
        
        if (result.success) {
            showNotification('Account created successfully! Please login.', 'success');
            
            // Switch to login form
            setTimeout(() => {
                showLoginForm();
            }, 1500);
        } else {
            showError(result.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('An error occurred. Please try again.');
    }
}

// Handle create school form submission
async function handleCreateSchool(event) {
    event.preventDefault();
    
    // Get form values
    const schoolName = document.getElementById('createSchoolName').value.trim();
    const adminName = document.getElementById('createAdminName').value.trim();
    const adminEmail = document.getElementById('createAdminEmail').value.trim();
    const adminPhone = document.getElementById('createAdminPhone').value.trim();
    const password = document.getElementById('createPassword').value;
    
    // Validate inputs
    if (!schoolName || !adminName || !adminEmail || !password) {
        showError('Please fill in all required fields');
        return;
    }
    
    if (!validateEmail(adminEmail)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
    }
    
    try {
        // Create school
        const result = await API.createSchool({
            name: schoolName,
            adminName,
            adminEmail,
            adminPhone
        });
        
        if (result.success) {
            // Create admin user
            await API.createUser(schoolName, {
                name: adminName,
                email: adminEmail,
                password,
                role: 'admin'
            });
            
            showNotification(`School created! Invite Code: ${result.inviteCode}`, 'success');
            
            // Show invite code
            alert(`School created successfully!\n\nInvite Code: ${result.inviteCode}\n\nPlease save this code to share with staff members.`);
            
            // Redirect to login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showError(result.error || 'Failed to create school');
        }
    } catch (error) {
        console.error('Create school error:', error);
        showError('An error occurred. Please try again.');
    }
}

// Show forgot password form
function showForgotPassword(event) {
    if (event) event.preventDefault();
    
    const loginCard = document.querySelector('.login-card');
    loginCard.innerHTML = `
        <div class="logo">
            <div class="logo-icon">
                <i class="fas fa-school"></i>
            </div>
            <h1>SRMS</h1>
            <p>Reset Password</p>
        </div>
        
        <div id="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <span id="errorText"></span>
        </div>
        
        <form onsubmit="handleForgotPassword(event)">
            <div class="form-group">
                <label for="forgotSchoolName">
                    <i class="fas fa-school"></i> School Name
                </label>
                <input type="text" id="forgotSchoolName" placeholder="Enter your school name" required>
            </div>
            
            <div class="form-group">
                <label for="forgotEmail">
                    <i class="fas fa-envelope"></i> Email Address
                </label>
                <input type="email" id="forgotEmail" placeholder="Enter your email" required>
            </div>
            
            <button type="submit" class="btn-login">
                <i class="fas fa-key"></i> Reset Password
            </button>
        </form>
        
        <div class="login-footer">
            <a href="#" onclick="showLoginForm(event)">
                <i class="fas fa-arrow-left"></i> Back to Login
            </a>
        </div>
    `;
}

// Handle forgot password
async function handleForgotPassword(event) {
    event.preventDefault();
    
    const schoolName = document.getElementById('forgotSchoolName').value.trim();
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!schoolName || !email) {
        showError('Please fill in all fields');
        return;
    }
    
    // In a real app, send password reset email
    showNotification('Password reset instructions sent to your email', 'success');
    
    setTimeout(() => {
        showLoginForm();
    }, 2000);
}

// Show create school form
function showCreateSchool(event) {
    if (event) event.preventDefault();
    
    const loginCard = document.querySelector('.login-card');
    loginCard.innerHTML = `
        <div class="logo">
            <div class="logo-icon">
                <i class="fas fa-school"></i>
            </div>
            <h1>SRMS</h1>
            <p>Create New School</p>
        </div>
        
        <div id="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <span id="errorText"></span>
        </div>
        
        <form onsubmit="handleCreateSchool(event)">
            <div class="form-group">
                <label for="createSchoolName">
                    <i class="fas fa-school"></i> School Name
                </label>
                <input type="text" id="createSchoolName" placeholder="Enter school name" required>
            </div>
            
            <div class="form-group">
                <label for="createAdminName">
                    <i class="fas fa-user"></i> Admin Name
                </label>
                <input type="text" id="createAdminName" placeholder="Enter admin name" required>
            </div>
            
            <div class="form-group">
                <label for="createAdminEmail">
                    <i class="fas fa-envelope"></i> Admin Email
                </label>
                <input type="email" id="createAdminEmail" placeholder="Enter admin email" required>
            </div>
            
            <div class="form-group">
                <label for="createAdminPhone">
                    <i class="fas fa-phone"></i> Admin Phone
                </label>
                <input type="tel" id="createAdminPhone" placeholder="Enter admin phone">
            </div>
            
            <div class="form-group">
                <label for="createPassword">
                    <i class="fas fa-lock"></i> Password
                </label>
                <input type="password" id="createPassword" placeholder="Min 8 characters" required>
            </div>
            
            <button type="submit" class="btn-login">
                <i class="fas fa-plus-circle"></i> Create School
            </button>
        </form>
        
        <div class="login-footer">
            <a href="#" onclick="showLoginForm(event)">
                <i class="fas fa-arrow-left"></i> Back to Login
            </a>
        </div>
    `;
}

// Show login form
function showLoginForm(event) {
    if (event) event.preventDefault();
    window.location.reload();
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (errorMessage && errorText) {
        errorText.textContent = message;
        errorMessage.classList.add('show');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }
}

// Hide error message
function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.classList.remove('show');
    }
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const user = getCurrentUser();
    const school = getCurrentSchool();
    
    // If on dashboard pages and not logged in, redirect to login
    if (!window.location.href.includes('index.html')) {
        if (!user || !school) {
            window.location.href = 'index.html';
        }
    }
    
    // If on login page and already logged in, redirect to dashboard
    if (window.location.href.includes('index.html')) {
        if (user && school) {
            window.location.href = 'dashboard.html';
        }
    }
});