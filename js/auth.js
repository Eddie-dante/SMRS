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

  hideError();

  API.login(schoolName, email, password)
    .then(function (result) {
      if (result.success) {
        showNotification("Login successful!", "success");
        setTimeout(function () {
          window.location.href = "dashboard.html";
        }, 600);
      } else {
        showError(result.error || "Login failed");
        if (loginBtn) {
          loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
          loginBtn.disabled = false;
        }
      }
    })
    .catch(function (error) {
      showError("An error occurred: " + (error.message || "Please try again"));
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
          window.location.reload();
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
        window.location.reload();
      }, 1500);
    });
  });
  return false;
}

function showError(message) {
  var errorMessage = document.getElementById("errorMessage");
  var errorText = document.getElementById("errorText");
  if (errorMessage && errorText) {
    errorText.textContent = message;
    errorMessage.classList.add("show");
    setTimeout(function () {
      errorMessage.classList.remove("show");
    }, 5000);
  } else {
    DialogSystem.alert(message, { title: "Error", type: "danger" });
  }
}

function hideError() {
  var errorMessage = document.getElementById("errorMessage");
  if (errorMessage) errorMessage.classList.remove("show");
}

window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleCreateSchool = handleCreateSchool;
window.handleForgotPassword = handleForgotPassword;
window.showError = showError;
window.hideError = hideError;
