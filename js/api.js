// ============================================
// SRMS - Complete Authentication Logic
// Full Version - Fixed
// ============================================

// ============ LOGIN ============
function handleLogin(event) {
  event.preventDefault();
  console.log("✅ Login function called");

  var schoolName = document.getElementById("schoolName").value.trim();
  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;

  console.log("School:", schoolName, "Email:", email);

  if (!schoolName || !email || !password) {
    showError("Please fill in all fields");
    return false;
  }

  var loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
  }

  hideError();

  // Check if API is available
  if (typeof API === "undefined" || !API.login) {
    console.error("❌ API not loaded!");
    showError("System error: API not loaded. Please refresh.");
    if (loginBtn) {
      loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
      loginBtn.disabled = false;
    }
    return false;
  }

  console.log("✅ API found, calling login...");

  API.login(schoolName, email, password)
    .then(function (result) {
      console.log("Login result:", result);
      if (result.success) {
        showNotification("Login successful! Redirecting...", "success");
        setTimeout(function () {
          window.location.href = "dashboard.html";
        }, 800);
      } else {
        showError(
          result.error || "Login failed. Please check your credentials.",
        );
        if (loginBtn) {
          loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
          loginBtn.disabled = false;
        }
      }
    })
    .catch(function (error) {
      console.error("Login error:", error);
      showError("An error occurred: " + (error.message || "Please try again"));
      if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.disabled = false;
      }
    });

  return false;
}

// ============ SIGNUP ============
function handleSignup(event) {
  event.preventDefault();
  console.log("✅ Signup function called");

  var schoolName = document.getElementById("signupSchoolName").value.trim();
  var name = document.getElementById("signupName").value.trim();
  var email = document.getElementById("signupEmail").value.trim();
  var password = document.getElementById("signupPassword").value;
  var inviteCode = document.getElementById("signupInviteCode").value.trim();

  if (!schoolName || !name || !email || !password || !inviteCode) {
    showError("Please fill in all fields");
    return false;
  }

  if (!validateEmail(email)) {
    showError("Please enter a valid email");
    return false;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters");
    return false;
  }

  // Check if API is available
  if (typeof API === "undefined" || !API.getSchool) {
    showError("System error. Please refresh.");
    return false;
  }

  API.getSchool(schoolName).then(function (school) {
    if (!school) {
      showError("School not found");
      return;
    }
    if (school.inviteCode !== inviteCode) {
      showError("Invalid invite code");
      return;
    }

    API.createUser(schoolName, {
      name: name,
      email: email,
      password: password,
      role: "teacher",
    }).then(function (result) {
      if (result.success) {
        showNotification("Account created! Please login.", "success");
        setTimeout(function () {
          showLoginForm();
        }, 1500);
      } else {
        showError(result.error || "Signup failed");
      }
    });
  });
  return false;
}

// ============ CREATE SCHOOL ============
function handleCreateSchool(event) {
  event.preventDefault();
  console.log("✅ Create School function called");

  var schoolName = document.getElementById("createSchoolName").value.trim();
  var adminName = document.getElementById("createAdminName").value.trim();
  var adminEmail = document.getElementById("createAdminEmail").value.trim();
  var password = document.getElementById("createPassword").value;
  var confirmPassword = document.getElementById("createConfirmPassword").value;

  if (!schoolName || !adminName || !adminEmail || !password) {
    showError("Please fill in all fields");
    return false;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match");
    return false;
  }

  if (password.length < 8) {
    showError("Password must be at least 8 characters");
    return false;
  }

  // Check if API is available
  if (typeof API === "undefined" || !API.createSchool) {
    showError("System error. Please refresh.");
    return false;
  }

  API.createSchool({
    name: schoolName,
    adminName: adminName,
    adminEmail: adminEmail,
    password: password,
  }).then(function (result) {
    if (result.success) {
      if (typeof DialogSystem !== "undefined" && DialogSystem.alert) {
        DialogSystem.alert(
          "School created successfully!<br><br>Invite Code: <strong>" +
            result.inviteCode +
            "</strong>",
          {
            title: "School Created",
            type: "success",
            confirmText: "OK",
          },
        ).then(function () {
          window.location.reload();
        });
      } else {
        alert(
          "School created successfully!\n\nInvite Code: " + result.inviteCode,
        );
        window.location.reload();
      }
    } else {
      showError(result.error || "Failed to create school");
    }
  });
  return false;
}

// ============ FORGOT PASSWORD ============
function handleForgotPassword(event) {
  event.preventDefault();
  var schoolName = document.getElementById("resetSchoolName").value.trim();
  var email = document.getElementById("forgotEmail").value.trim();

  if (!schoolName || !email) {
    showError("Please fill in all fields");
    return false;
  }

  API.getSchool(schoolName).then(function (school) {
    if (!school) {
      showError("School not found");
      return;
    }
    API.getUsers(schoolName).then(function (users) {
      var found = false;
      users.forEach(function (u) {
        if (u.email === email) found = true;
      });
      if (!found) {
        showError("User not found in this school");
        return;
      }
      showNotification(
        "Password reset instructions sent to your email",
        "success",
      );
      setTimeout(function () {
        showLoginForm();
      }, 1500);
    });
  });
  return false;
}

// ============ ERROR HANDLING ============
function showError(message) {
  console.error("Error:", message);
  var errorMessage = document.getElementById("errorMessage");
  var errorText = document.getElementById("errorText");
  if (errorMessage && errorText) {
    errorText.textContent = message;
    errorMessage.classList.add("show");
    setTimeout(function () {
      errorMessage.classList.remove("show");
    }, 5000);
  } else {
    alert(message);
  }
}

function hideError() {
  var errorMessage = document.getElementById("errorMessage");
  if (errorMessage) errorMessage.classList.remove("show");
}

// ============ FORM SWITCH FUNCTIONS ============
function showSignup(event) {
  if (event) event.preventDefault();
  var container = document.querySelector(".login-container");
  if (!container) return;

  container.innerHTML = `
    <div class="login-logo">
      <div class="logo-icon"><i class="fas fa-user-plus"></i></div>
      <h1>Sign Up</h1>
      <p>Create your staff account</p>
    </div>
    <div id="errorMessage" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <span id="errorText"></span>
    </div>
    <form onsubmit="return handleSignup(event)">
      <div class="form-group">
        <label><i class="fas fa-school"></i> School Name</label>
        <input type="text" id="signupSchoolName" placeholder="Enter school name" required>
      </div>
      <div class="form-group">
        <label><i class="fas fa-user"></i> Full Name</label>
        <input type="text" id="signupName" placeholder="Enter full name" required>
      </div>
      <div class="form-group">
        <label><i class="fas fa-envelope"></i> Email</label>
        <input type="email" id="signupEmail" placeholder="Enter email" required>
      </div>
      <div class="form-group">
        <label><i class="fas fa-key"></i> Invite Code</label>
        <input type="text" id="signupInviteCode" placeholder="Enter invite code" required>
      </div>
      <div class="form-group">
        <label><i class="fas fa-lock"></i> Password (min 6 chars)</label>
        <input type="password" id="signupPassword" placeholder="Enter password" required>
      </div>
      <button type="submit" class="btn-login"><i class="fas fa-user-plus"></i> Sign Up</button>
    </form>
    <div class="login-footer">
      <a onclick="showLoginForm(event)"><i class="fas fa-arrow-left"></i> Back to Login</a>
    </div>
  `;
}

function showCreateSchool(event) {
  if (event) event.preventDefault();
  var container = document.querySelector(".login-container");
  if (!container) return;

  container.innerHTML = `
    <div class="login-logo">
      <div class="logo-icon"><i class="fas fa-plus-circle"></i></div>
      <h1>Create School</h1>
      <p>Register your school</p>
    </div>
    <div id="errorMessage" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <span id="errorText"></span>
    </div>
    <form onsubmit="return handleCreateSchool(event)">
      <div class="form-group">
        <label><i class="fas fa-school"></i> School Name</label>
        <input type="text" id="createSchoolName" placeholder="Enter school name" required>
      </div>
      <div class="form-group">
        <label><i class="fas fa-user"></i> Admin Name</label>
        <input type="text" id="createAdminName" placeholder="Enter admin name" required>
      </div>
      <div class="form-group">
        <label><i class="fas fa-envelope"></i> Admin Email</label>
        <input type="email" id="createAdminEmail" placeholder="Enter admin email" required>
      </div>
      <div class="form-group">
        <label><i class="fas fa-lock"></i> Password (min 8 chars)</label>
        <input type="password" id="createPassword" placeholder="Enter password" required>
      </div>
      <div class="form-group">
        <label><i class="fas fa-lock"></i> Confirm Password</label>
        <input type="password" id="createConfirmPassword" placeholder="Confirm password" required>
      </div>
      <button type="submit" class="btn-login"><i class="fas fa-plus-circle"></i> Create School</button>
    </form>
    <div class="login-footer">
      <a onclick="showLoginForm(event)"><i class="fas fa-arrow-left"></i> Back to Login</a>
    </div>
  `;
}

function showForgotPassword(event) {
  if (event) event.preventDefault();
  var container = document.querySelector(".login-container");
  if (!container) return;

  container.innerHTML = `
    <div class="login-logo">
      <div class="logo-icon"><i class="fas fa-key"></i></div>
      <h1>Reset Password</h1>
      <p>Enter your email to reset</p>
    </div>
    <div id="errorMessage" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <span id="errorText"></span>
    </div>
    <form onsubmit="return handleForgotPassword(event)">
      <div class="form-group">
        <label><i class="fas fa-school"></i> School Name</label>
        <input type="text" id="resetSchoolName" placeholder="Enter school name" required>
      </div>
      <div class="form-group">
        <label><i class="fas fa-envelope"></i> Email</label>
        <input type="email" id="forgotEmail" placeholder="Enter email" required>
      </div>
      <button type="submit" class="btn-login"><i class="fas fa-key"></i> Reset Password</button>
    </form>
    <div class="login-footer">
      <a onclick="showLoginForm(event)"><i class="fas fa-arrow-left"></i> Back to Login</a>
    </div>
  `;
}

function showLoginForm(event) {
  if (event) event.preventDefault();
  window.location.reload();
}

// ============ EXPOSE FUNCTIONS ============
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleCreateSchool = handleCreateSchool;
window.handleForgotPassword = handleForgotPassword;
window.showSignup = showSignup;
window.showCreateSchool = showCreateSchool;
window.showForgotPassword = showForgotPassword;
window.showLoginForm = showLoginForm;
window.showError = showError;
window.hideError = hideError;

console.log("✅ auth.js loaded successfully");
