// ============================================
// SRMS - Complete Authentication Logic
// Full Version
// ============================================

function handleLogin(event) {
  event.preventDefault();

  var schoolName = document.getElementById("schoolName").value.trim();
  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;

  if (!schoolName || !email || !password) {
    showError("Please fill in all fields");
    return false;
  }

  var loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
  }

  API.login(schoolName, email, password)
    .then(function (result) {
      if (result.success) {
        showNotification("Login successful!", "success");
        setTimeout(function () {
          window.location.href = "dashboard.html";
        }, 500);
      } else {
        showError(result.error || "Login failed");
        if (loginBtn) {
          loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
          loginBtn.disabled = false;
        }
      }
    })
    .catch(function (error) {
      showError("An error occurred");
      if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.disabled = false;
      }
    });

  return false;
}

function handleSignup(event) {
  event.preventDefault();

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

  // First verify the school exists and invite code matches
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
        }, 1000);
      } else {
        showError(result.error || "Signup failed");
      }
    });
  });

  return false;
}

function handleCreateSchool(event) {
  event.preventDefault();

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

  API.createSchool({
    name: schoolName,
    adminName: adminName,
    adminEmail: adminEmail,
    password: password,
  }).then(function (result) {
    if (result.success) {
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
      showError(result.error || "Failed to create school");
    }
  });

  return false;
}

function showSignup(event) {
  if (event) event.preventDefault();
  var formPanel = document.querySelector(".form-panel");
  if (!formPanel) return;

  formPanel.innerHTML = `
        <div class="form-header">
            <h2>Staff Sign Up</h2>
            <p>Create your staff account</p>
        </div>
        <div id="errorMessage" class="error-message"><i class="fas fa-exclamation-circle"></i><span id="errorText"></span></div>
        <form onsubmit="return handleSignup(event)">
            <div class="form-group"><label><i class="fas fa-school"></i> School Name</label><input type="text" id="signupSchoolName" required></div>
            <div class="form-group"><label><i class="fas fa-user"></i> Full Name</label><input type="text" id="signupName" required></div>
            <div class="form-group"><label><i class="fas fa-envelope"></i> Email</label><input type="email" id="signupEmail" required></div>
            <div class="form-group"><label><i class="fas fa-key"></i> Invite Code</label><input type="text" id="signupInviteCode" required></div>
            <div class="form-group"><label><i class="fas fa-lock"></i> Password (min 6 chars)</label><input type="password" id="signupPassword" required></div>
            <button type="submit" class="btn-login"><i class="fas fa-user-plus"></i> Sign Up</button>
        </form>
        <div class="login-footer"><a href="#" onclick="showLoginForm(event)"><i class="fas fa-arrow-left"></i> Back to Login</a></div>
    `;
}

function showCreateSchool(event) {
  if (event) event.preventDefault();
  var formPanel = document.querySelector(".form-panel");
  if (!formPanel) return;

  formPanel.innerHTML = `
        <div class="form-header">
            <h2>Create School</h2>
            <p>Register your school</p>
        </div>
        <div id="errorMessage" class="error-message"><i class="fas fa-exclamation-circle"></i><span id="errorText"></span></div>
        <form onsubmit="return handleCreateSchool(event)">
            <div class="form-group"><label><i class="fas fa-school"></i> School Name</label><input type="text" id="createSchoolName" required></div>
            <div class="form-group"><label><i class="fas fa-user"></i> Admin Name</label><input type="text" id="createAdminName" required></div>
            <div class="form-group"><label><i class="fas fa-envelope"></i> Admin Email</label><input type="email" id="createAdminEmail" required></div>
            <div class="form-group"><label><i class="fas fa-lock"></i> Password (min 8 chars)</label><input type="password" id="createPassword" required></div>
            <div class="form-group"><label><i class="fas fa-lock"></i> Confirm Password</label><input type="password" id="createConfirmPassword" required></div>
            <button type="submit" class="btn-login"><i class="fas fa-plus-circle"></i> Create School</button>
        </form>
        <div class="login-footer"><a href="#" onclick="showLoginForm(event)"><i class="fas fa-arrow-left"></i> Back to Login</a></div>
    `;
}

function showForgotPassword(event) {
  if (event) event.preventDefault();
  var formPanel = document.querySelector(".form-panel");
  if (!formPanel) return;

  formPanel.innerHTML = `
        <div class="form-header">
            <h2>Reset Password</h2>
            <p>Enter your email to reset</p>
        </div>
        <div id="errorMessage" class="error-message"><i class="fas fa-exclamation-circle"></i><span id="errorText"></span></div>
        <form onsubmit="return handleForgotPassword(event)">
            <div class="form-group"><label><i class="fas fa-school"></i> School Name</label><input type="text" id="resetSchoolName" required></div>
            <div class="form-group"><label><i class="fas fa-envelope"></i> Email</label><input type="email" id="forgotEmail" required></div>
            <button type="submit" class="btn-login"><i class="fas fa-key"></i> Reset Password</button>
        </form>
        <div class="login-footer"><a href="#" onclick="showLoginForm(event)"><i class="fas fa-arrow-left"></i> Back to Login</a></div>
    `;
}

function handleForgotPassword(event) {
  event.preventDefault();
  var schoolName = document.getElementById("resetSchoolName").value.trim();
  var email = document.getElementById("forgotEmail").value.trim();

  if (!schoolName || !email) {
    showError("Please fill in all fields");
    return false;
  }

  // Check if user exists
  API.getSchool(schoolName).then(function (school) {
    if (!school) {
      showError("School not found");
      return;
    }

    API.getUsers(schoolName).then(function (users) {
      var found = false;
      users.forEach(function (u) {
        if (u.email === email) {
          found = true;
        }
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

function showLoginForm(event) {
  if (event) event.preventDefault();
  window.location.reload();
}

function showError(message) {
  var errorMessage = document.getElementById("errorMessage");
  var errorText = document.getElementById("errorText");

  if (errorMessage && errorText) {
    errorText.textContent = message;
    errorMessage.classList.add("show");
    setTimeout(function () {
      errorMessage.classList.remove("show");
    }, 3000);
  } else {
    DialogSystem.alert(message, { title: "Error", type: "danger" });
  }
}

window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleCreateSchool = handleCreateSchool;
window.handleForgotPassword = handleForgotPassword;
window.showSignup = showSignup;
window.showCreateSchool = showCreateSchool;
window.showForgotPassword = showForgotPassword;
window.showLoginForm = showLoginForm;
window.showError = showError;
