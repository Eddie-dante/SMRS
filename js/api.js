// ============================================
// SRMS - Firebase API
// Full Version with CACHE-FIRST PERSISTENCE
// + UNIQUE INVITE CODE per school (8 chars, safe alphabet)
// + 15s timeout (was 6s) — rules allow reads
// + null-safe failures
// ============================================

var firebaseConfig = {
  apiKey: "AIzaSyACefHWvbETo2siNZy4ETCWZVTwIrtaNMs",
  authDomain: "srms-fd318.firebaseapp.com",
  databaseURL: "https://srms-fd318-default-rtdb.firebaseio.com",
  projectId: "srms-fd318",
  storageBucket: "srms-fd318.firebasestorage.app",
  messagingSenderId: "828888967437",
  appId: "1:828888967437:web:90461f6b1bc79854ea6844",
};

var database = null;

// ⏱️ How long to wait for Firebase before giving up (ms)
var FIREBASE_TIMEOUT_MS = 15000;

function initFirebase() {
  if (typeof firebase === "undefined") {
    console.warn("⚠️ Firebase SDK not loaded yet — will retry.");
    return false;
  }
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log("✅ Firebase initialized");
    }
    database = firebase.database();
    return true;
  } catch (error) {
    console.error("❌ Firebase init error:", error);
    return false;
  }
}

if (!initFirebase()) {
  var _fbAttempts = 0;
  var _fbTimer = setInterval(function () {
    _fbAttempts++;
    if (initFirebase() || _fbAttempts > 33) {
      clearInterval(_fbTimer);
      if (!database) {
        console.error(
          "❌ Firebase SDK failed to load after 10s. Check that " +
            "firebase-app-compat.js and firebase-database-compat.js " +
            "are included BEFORE js/api.js on this page.",
        );
      }
    }
  }, 300);
}

/* ============================================================
   TIMEOUT WRAPPER
   ============================================================ */
function withTimeout(promise, ms, label) {
  ms = ms || FIREBASE_TIMEOUT_MS;
  label = label || "Firebase read";
  return new Promise(function (resolve, reject) {
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      reject(new Error(label + " timed out after " + ms + "ms"));
    }, ms);

    promise.then(
      function (v) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(v);
      },
      function (e) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/* ============================================================
   PERSISTENT CACHE SYSTEM
   ============================================================ */

var CACHE_VERSION = 3;
var CACHE_PREFIX = "srms_cache_v" + CACHE_VERSION + "_";
var META_KEY = "srms_cache_meta";
var CACHE_EXPIRY = 10 * 60 * 1000;
var MAX_CACHE_BYTES = 4 * 1024 * 1024;

var dataCache = {};

function hydrateCacheFromStorage() {
  try {
    var storedVersion = localStorage.getItem("srms_cache_version");
    if (String(storedVersion) !== String(CACHE_VERSION)) {
      var toDelete = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf("srms_cache_") === 0) toDelete.push(k);
      }
      toDelete.forEach(function (k) {
        localStorage.removeItem(k);
      });
      localStorage.setItem("srms_cache_version", String(CACHE_VERSION));
      console.log("🧹 Cache wiped (version mismatch) — now v" + CACHE_VERSION);
      return;
    }

    var count = 0;
    for (var j = 0; j < localStorage.length; j++) {
      var key = localStorage.key(j);
      if (!key || key.indexOf(CACHE_PREFIX) !== 0) continue;
      try {
        var raw = localStorage.getItem(key);
        if (!raw) continue;
        var parsed = JSON.parse(raw);
        var logicalKey = key.substring(CACHE_PREFIX.length);
        dataCache[logicalKey] = {
          timestamp: parsed.timestamp || 0,
          data: parsed.data,
        };
        count++;
      } catch (e) {}
    }
    if (count > 0) {
      console.log("💾 Cache hydrated from storage: " + count + " collections");
    }
  } catch (e) {
    console.warn("Cache hydration failed:", e);
  }
}

function persistCacheEntry(key, entry) {
  try {
    var payload = JSON.stringify({
      timestamp: entry.timestamp,
      data: entry.data,
    });
    localStorage.setItem(CACHE_PREFIX + key, payload);
  } catch (e) {
    console.warn("⚠️ Cache write failed (quota?):", e);
    pruneCacheIfTooBig();
  }
}

function pruneCacheIfTooBig() {
  try {
    var total = 0;
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k) continue;
      if (k.indexOf("srms_cache_") === 0) {
        var size = (localStorage.getItem(k) || "").length;
        total += size;
        keys.push({ key: k, size: size });
      }
    }
    if (total > MAX_CACHE_BYTES) {
      console.warn(
        "⚠️ Cache is " +
          (total / 1024 / 1024).toFixed(2) +
          "MB — pruning oldest",
      );
      keys.sort(function (a, b) {
        var aData = {};
        var bData = {};
        try {
          aData = JSON.parse(localStorage.getItem(a.key) || "{}");
        } catch (e) {}
        try {
          bData = JSON.parse(localStorage.getItem(b.key) || "{}");
        } catch (e) {}
        return (aData.timestamp || 0) - (bData.timestamp || 0);
      });
      var target = 3 * 1024 * 1024;
      for (var j = 0; j < keys.length && total > target; j++) {
        total -= keys[j].size;
        localStorage.removeItem(keys[j].key);
        var logical = keys[j].key.substring(CACHE_PREFIX.length);
        delete dataCache[logical];
      }
      console.log(
        "✅ Cache pruned to " + (total / 1024 / 1024).toFixed(2) + "MB",
      );
    }
  } catch (e) {}
}

var _inflightFetches = {};

function getCachedData(key, fetchFunction, expiryMs) {
  expiryMs = expiryMs || CACHE_EXPIRY;
  var now = Date.now();

  if (dataCache[key] && now - dataCache[key].timestamp < expiryMs) {
    return Promise.resolve(dataCache[key].data);
  }

  try {
    var raw = localStorage.getItem(CACHE_PREFIX + key);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.data !== undefined) {
        dataCache[key] = {
          timestamp: parsed.timestamp || now,
          data: parsed.data,
        };

        if (now - (parsed.timestamp || 0) > expiryMs) {
          var refresh = withTimeout(fetchFunction(), FIREBASE_TIMEOUT_MS, key);
          refresh
            .then(function (fresh) {
              if (fresh !== null && fresh !== undefined) {
                dataCache[key] = { timestamp: Date.now(), data: fresh };
                persistCacheEntry(key, dataCache[key]);
              }
            })
            .catch(function () {});
        }
        return Promise.resolve(parsed.data);
      }
    }
  } catch (e) {}

  if (_inflightFetches[key]) {
    return _inflightFetches[key];
  }

  var p = withTimeout(fetchFunction(), FIREBASE_TIMEOUT_MS, key)
    .then(function (data) {
      delete _inflightFetches[key];
      if (data === null || data === undefined) {
        console.warn("⚠️ " + key + " returned no data");
        return null;
      }
      dataCache[key] = { timestamp: Date.now(), data: data };
      persistCacheEntry(key, dataCache[key]);
      return data;
    })
    .catch(function (error) {
      delete _inflightFetches[key];
      console.error("❌ Fetch failed for " + key + ":", error.message || error);
      return null;
    });

  _inflightFetches[key] = p;
  return p;
}

function clearCache(key) {
  if (key) {
    delete dataCache[key];
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (e) {}
  } else {
    dataCache = {};
    try {
      var toDelete = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(CACHE_PREFIX) === 0) toDelete.push(k);
      }
      toDelete.forEach(function (k) {
        localStorage.removeItem(k);
      });
    } catch (e) {}
  }
}

function wipeAllCache() {
  try {
    var toDelete = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (
        k &&
        (k.indexOf("srms_cache_") === 0 ||
          k === "srms_cache_version" ||
          k === "srms_cache_meta")
      ) {
        toDelete.push(k);
      }
    }
    toDelete.forEach(function (k) {
      localStorage.removeItem(k);
    });
    dataCache = {};
    console.log("🧹 Cache wiped");
  } catch (e) {}
}

window.wipeAllCache = wipeAllCache;

hydrateCacheFromStorage();

function snapshotToArray(snapshot) {
  var data = snapshot.val();
  if (!data) return [];
  var result = [];
  Object.keys(data).forEach(function (key) {
    result.push(Object.assign({ id: key }, data[key]));
  });
  return result;
}

/* ============================================================
   BACKGROUND SYNC
   ============================================================ */

function getServerChangeMarker(schoolName) {
  if (!database) return Promise.resolve(null);
  return withTimeout(
    database.ref("schools/" + schoolName + "/meta/updatedAt").once("value"),
    FIREBASE_TIMEOUT_MS,
    "server-change-marker",
  )
    .then(function (snap) {
      return snap.val() || null;
    })
    .catch(function () {
      return null;
    });
}

function backgroundSync() {
  if (!database) return;
  var school = getCurrentSchoolFromStorage();
  if (!school) return;

  getServerChangeMarker(school).then(function (serverMarker) {
    var localMarker = localStorage.getItem("srms_cache_meta_" + school);
    if (!serverMarker) return;
    if (serverMarker === localMarker) return;

    console.log("🔄 Server data changed — refreshing cache...");
    var keysToInvalidate = [
      "books_" + school,
      "borrowed_" + school,
      "students_" + school,
      "furniture_" + school,
      "teachers_" + school,
      "classes_" + school,
      "events_" + school,
      "fees_" + school,
      "terms_" + school,
      "qrcodes_" + school,
      "assignments_" + school,
      "users_" + school,
      "school_" + school,
    ];
    keysToInvalidate.forEach(function (k) {
      clearCache(k);
    });

    localStorage.setItem("srms_cache_meta_" + school, serverMarker);
  });
}

function getCurrentSchoolFromStorage() {
  try {
    return localStorage.getItem("srms_school");
  } catch (e) {
    return null;
  }
}

function bumpServerMarker(schoolName) {
  if (!database || !schoolName) return;
  withTimeout(
    database
      .ref("schools/" + schoolName + "/meta")
      .update({ updatedAt: new Date().toISOString() }),
    FIREBASE_TIMEOUT_MS,
    "bump-server-marker",
  ).catch(function () {});
}

setTimeout(backgroundSync, 800);

/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Unique mixed-character invite code.
 * Uses an unambiguous alphabet: no 0/O, no 1/I/L.
 * Default length: 8 characters.
 */
function generateInviteCode(length) {
  length = length || 8;
  var chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  var code = "";
  for (var i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateStaffId() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var id = "STAFF-";
  for (var i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function hashPassword(password) {
  var hash = 0;
  for (var i = 0; i < password.length; i++) {
    var char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString();
}

function generateUniqueQRCode(type, usedCodes) {
  var code = "";
  var unique = false;
  var attempts = 0;
  while (!unique && attempts < 100) {
    var number = Math.floor(10000 + Math.random() * 90000);
    code = type.toUpperCase() + "-" + number;
    if (!usedCodes[code]) {
      unique = true;
      usedCodes[code] = true;
    }
    attempts++;
  }
  return code;
}

function generateUniqueStudentId(schoolName, adm) {
  var schoolInitials = "";
  var words = schoolName.split(/\s+/);
  for (var i = 0; i < words.length && i < 3; i++) {
    if (words[i] && words[i].length > 0) {
      schoolInitials += words[i].charAt(0).toUpperCase();
    }
  }
  if (!schoolInitials) schoolInitials = "SCH";

  var year = new Date().getFullYear().toString().slice(-2);
  var randomPart = "";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (var j = 0; j < 4; j++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return schoolInitials + "-" + year + "-" + randomPart;
}

function extractAdm(student) {
  if (!student) return "";
  var adm =
    student.ADM ||
    student.adm ||
    student["ADM No"] ||
    student["ADM No."] ||
    student["Admission No"] ||
    student["Admission Number"] ||
    student["AdmissionNo"] ||
    student.ADMNO ||
    student.admNo ||
    student["ADM NO"] ||
    student.adm_no ||
    student["adm_no"] ||
    student.AdmissionNumber ||
    student.admission_no ||
    student["ADM Number"] ||
    student["Adm No"] ||
    student["AdmNo"] ||
    "";
  return String(adm).trim();
}

function extractName(student) {
  if (!student) return "Unknown";
  return (
    student.Name ||
    student.name ||
    student["Full Name"] ||
    student["FullName"] ||
    student["Student Name"] ||
    student["StudentName"] ||
    student["NAME"] ||
    student["Student's Name"] ||
    student.Student_Name ||
    student["Name of Student"] ||
    student["Student"] ||
    "Unknown"
  );
}

/* ============================================================
   API OBJECT
   ============================================================ */

var API = {
  // ============ SCHOOL ============
  getSchool: function (schoolName) {
    if (!database) {
      return Promise.resolve(null);
    }
    var cleanSchool = String(schoolName || "").trim();
    return getCachedData(
      "school_" + cleanSchool,
      function () {
        return database
          .ref("schools/" + cleanSchool)
          .once("value")
          .then(function (s) {
            return s.val() || null;
          });
      },
      60000,
    );
  },

  getSchoolFast: function (schoolName) {
    if (!database) {
      return Promise.resolve(null);
    }
    var cleanSchool = String(schoolName || "").trim();
    return getCachedData(
      "school_" + cleanSchool,
      function () {
        return database
          .ref("schools/" + cleanSchool)
          .once("value")
          .then(function (s) {
            return s.val() || null;
          });
      },
      10 * 60 * 1000,
    ).then(function (data) {
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return null;
      }
      return data;
    });
  },

  /**
   * verifyInviteCode — reads the school's real invite code from Firebase
   * and compares it to what the user typed.
   *
   * Uses the shared cache layer, so repeat verifications are instant.
   */
  verifyInviteCode: function (schoolName, code) {
    var normalized = String(code || "")
      .trim()
      .toUpperCase();
    var cleanSchool = String(schoolName || "").trim();

    if (!cleanSchool) {
      return Promise.resolve({
        success: false,
        error: "School name is required.",
      });
    }
    if (!normalized) {
      return Promise.resolve({
        success: false,
        error: "Invite code is required.",
      });
    }
    if (!database) {
      return Promise.resolve({
        success: false,
        error: "Firebase is not ready yet. Please reload the page.",
      });
    }

    return getCachedData(
      "school_" + cleanSchool,
      function () {
        return database
          .ref("schools/" + cleanSchool)
          .once("value")
          .then(function (s) {
            return s.val() || null;
          });
      },
      10 * 60 * 1000, // cache for 10 min
    )
      .then(function (school) {
        if (!school || typeof school !== "object") {
          return {
            success: false,
            error:
              'School "' + cleanSchool + '" not found. Check the spelling.',
          };
        }
        var stored = String(school.inviteCode || "")
          .trim()
          .toUpperCase();
        if (!stored) {
          return {
            success: false,
            error: "This school has no invite code set. Ask the admin.",
          };
        }
        if (stored !== normalized) {
          return {
            success: false,
            error: "Invalid invite code. Please try again.",
          };
        }
        return { success: true, school: school };
      })
      .catch(function () {
        return {
          success: false,
          error:
            "Could not reach the server. Check your connection and try again.",
        };
      });
  },

  createSchool: function (schoolData) {
    var inviteCode = generateInviteCode(8); // unique, e.g. "QT1BH2CF"
    var emailKey = schoolData.adminEmail.replace(/\./g, ",");

    return database
      .ref("schools/" + schoolData.name)
      .set({
        name: schoolData.name,
        address: schoolData.address || "",
        adminName: schoolData.adminName,
        adminEmail: schoolData.adminEmail,
        adminPhone: schoolData.adminPhone || "",
        inviteCode: inviteCode,
        motto: schoolData.motto || "",
        createdAt: new Date().toISOString(),
        isActive: true,
      })
      .then(function () {
        return database.ref("schools/" + schoolData.name + "/settings").set({
          maxBorrowDays: 14,
          maxBooksPerStudent: 3,
          finePerDay: 10,
        });
      })
      .then(function () {
        return database
          .ref("schools/" + schoolData.name + "/users/" + emailKey)
          .set({
            name: schoolData.adminName,
            email: schoolData.adminEmail,
            role: "admin",
            staffId: "ADMIN-001",
            password: hashPassword(schoolData.password || "admin123"),
            createdAt: new Date().toISOString(),
            isActive: true,
          });
      })
      .then(function () {
        clearCache("school_" + schoolData.name);
        bumpServerMarker(schoolData.name);
        return { success: true, inviteCode: inviteCode };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  updateSchool: function (schoolName, schoolData) {
    return database
      .ref("schools/" + schoolName)
      .update(schoolData)
      .then(function () {
        clearCache("school_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ AUTH ============
  login: function (schoolName, email, password) {
    var emailKey = email.replace(/\./g, ",");
    return database
      .ref("schools/" + schoolName + "/users/" + emailKey)
      .once("value")
      .then(function (snapshot) {
        var user = snapshot.val();
        if (
          user &&
          user.password === hashPassword(password) &&
          user.isActive !== false
        ) {
          var sessionUser = {
            name: user.name,
            email: user.email,
            role: user.role,
            staffId: user.staffId,
          };
          localStorage.setItem("srms_user", JSON.stringify(sessionUser));
          localStorage.setItem("srms_school", schoolName);
          return { success: true, user: sessionUser };
        }
        return { success: false, error: "Invalid credentials" };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  createUser: function (schoolName, userData) {
    var emailKey = userData.email.replace(/\./g, ",");
    return database
      .ref("schools/" + schoolName + "/users/" + emailKey)
      .once("value")
      .then(function (snapshot) {
        if (snapshot.exists())
          return { success: false, error: "User already exists" };
        return database
          .ref("schools/" + schoolName + "/users/" + emailKey)
          .set({
            name: userData.name,
            email: userData.email,
            role: userData.role || "teacher",
            staffId: userData.staffId || generateStaffId(),
            phone: userData.phone || "",
            password: hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            isActive: true,
          });
      })
      .then(function () {
        clearCache("users_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getUsers: function (schoolName) {
    return getCachedData("users_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/users")
        .once("value")
        .then(snapshotToArray);
    });
  },

  updateUser: function (schoolName, email, userData) {
    var emailKey = email.replace(/\./g, ",");
    return database
      .ref("schools/" + schoolName + "/users/" + emailKey)
      .update(userData)
      .then(function () {
        clearCache("users_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  deleteUser: function (schoolName, email) {
    var emailKey = email.replace(/\./g, ",");
    return database
      .ref("schools/" + schoolName + "/users/" + emailKey)
      .update({ isActive: false })
      .then(function () {
        clearCache("users_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ BOOKS ============
  addBook: function (schoolName, bookData) {
    var bookRef = database.ref("schools/" + schoolName + "/books").push();
    return bookRef
      .set({
        title: bookData.title,
        author: bookData.author || "",
        type: bookData.type || "Textbook",
        subject: bookData.subject || "",
        quantity: bookData.quantity || 1,
        available: bookData.quantity || 1,
        createdBy: bookData.createdBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("books_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getBooks: function (schoolName) {
    return getCachedData("books_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/books")
        .once("value")
        .then(snapshotToArray);
    });
  },

  updateBook: function (schoolName, bookId, bookData) {
    return database
      .ref("schools/" + schoolName + "/books/" + bookId)
      .update(bookData)
      .then(function () {
        clearCache("books_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  deleteBook: function (schoolName, bookId) {
    return database
      .ref("schools/" + schoolName + "/books/" + bookId)
      .remove()
      .then(function () {
        clearCache("books_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ BORROWING ============
  issueBook: function (schoolName, borrowData) {
    if (!borrowData.studentName || !borrowData.studentName.trim()) {
      return Promise.resolve({
        success: false,
        error: "Student name is required",
      });
    }
    if (!borrowData.adm || !borrowData.adm.trim()) {
      return Promise.resolve({
        success: false,
        error: "Admission number is required",
      });
    }
    if (!borrowData.bookTitle || !borrowData.bookNo) {
      return Promise.resolve({
        success: false,
        error: "Book title and number are required",
      });
    }

    var borrowRef = database.ref("schools/" + schoolName + "/borrowed").push();
    return borrowRef
      .set({
        studentName: borrowData.studentName.trim(),
        adm: borrowData.adm.trim(),
        form: borrowData.form || "",
        stream: borrowData.stream || "",
        bookTitle: borrowData.bookTitle,
        bookNo: borrowData.bookNo,
        qrId: borrowData.qrId || null,
        borrowDate:
          borrowData.borrowDate || new Date().toISOString().split("T")[0],
        returnDate: borrowData.returnDate || "",
        returned: false,
        issuedBy: borrowData.issuedBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("borrowed_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  addBorrowed: function (schoolName, borrowData) {
    return API.issueBook(schoolName, borrowData);
  },

  getBorrowed: function (schoolName) {
    return getCachedData("borrowed_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/borrowed")
        .once("value")
        .then(snapshotToArray);
    });
  },

  getBorrowedByAdm: function (schoolName, adm) {
    return database
      .ref("schools/" + schoolName + "/borrowed")
      .orderByChild("adm")
      .equalTo(adm)
      .once("value")
      .then(snapshotToArray);
  },

  returnBook: function (schoolName, borrowId) {
    return database
      .ref("schools/" + schoolName + "/borrowed/" + borrowId)
      .update({
        returned: true,
        returnDate: new Date().toISOString().split("T")[0],
      })
      .then(function () {
        clearCache("borrowed_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ QR CODES ============
  generateQRCodes: function (schoolName, type, start, end) {
    var qrRef = database.ref("schools/" + schoolName + "/qrcodes");
    return qrRef
      .once("value")
      .then(function (snapshot) {
        var existingCodes = snapshot.val() || {};
        var usedCodes = {};
        Object.values(existingCodes).forEach(function (qr) {
          usedCodes[qr.code] = true;
        });
        var updates = {};
        var generated = [];
        for (var i = start; i <= end; i++) {
          var code = generateUniqueQRCode(type, usedCodes);
          var newKey = qrRef.push().key;
          updates["schools/" + schoolName + "/qrcodes/" + newKey] = {
            code: code,
            type: type,
            assigned: false,
            assignedTo: null,
            className: null,
            stream: null,
            adm: null,
            returned: false,
            createdAt: new Date().toISOString(),
          };
          generated.push(code);
        }
        return database
          .ref()
          .update(updates)
          .then(function () {
            clearCache("qrcodes_" + schoolName);
            bumpServerMarker(schoolName);
            return { success: true, codes: generated };
          });
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getQRCodes: function (schoolName) {
    return getCachedData("qrcodes_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/qrcodes")
        .once("value")
        .then(snapshotToArray);
    });
  },

  assignQRCode: function (schoolName, qrId, assignmentData) {
    if (!assignmentData.studentName || !assignmentData.adm) {
      return Promise.resolve({
        success: false,
        error: "Name and ADM are required",
      });
    }
    return database
      .ref("schools/" + schoolName + "/qrcodes/" + qrId)
      .update({
        assigned: true,
        assignedTo: assignmentData.studentName,
        className: assignmentData.className || "",
        stream: assignmentData.stream || "",
        adm: assignmentData.adm,
        assignedAt: new Date().toISOString(),
        returned: false,
      })
      .then(function () {
        clearCache("qrcodes_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  returnQRCode: function (schoolName, qrId) {
    return database
      .ref("schools/" + schoolName + "/qrcodes/" + qrId)
      .update({
        returned: true,
        returnedAt: new Date().toISOString(),
        assigned: false,
        assignedTo: null,
        className: null,
        stream: null,
        adm: null,
      })
      .then(function () {
        clearCache("qrcodes_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  generateStudentID: function (schoolName, adm) {
    return database
      .ref("schools/" + schoolName + "/students/" + adm)
      .once("value")
      .then(function (snapshot) {
        var student = snapshot.val();
        if (!student) return { success: false, error: "Student not found" };
        var qrCode = generateUniqueQRCode("STUDENT", {});
        return database
          .ref("schools/" + schoolName + "/qrcodes")
          .push()
          .set({
            code: qrCode,
            type: "student",
            assigned: true,
            assignedTo: student.name,
            className: student.form || "",
            stream: student.stream || "",
            adm: adm,
            returned: false,
            createdAt: new Date().toISOString(),
          })
          .then(function () {
            return database
              .ref("schools/" + schoolName + "/students/" + adm)
              .update({
                qrCode: qrCode,
                idGeneratedAt: new Date().toISOString(),
              });
          })
          .then(function () {
            clearCache("qrcodes_" + schoolName);
            clearCache("students_" + schoolName);
            bumpServerMarker(schoolName);
            return { success: true, qrCode: qrCode, student: student };
          });
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ STUDENTS ============
  addStudent: function (schoolName, studentData) {
    if (!studentData.name || !studentData.name.trim()) {
      return Promise.resolve({
        success: false,
        error: "Student name is required",
      });
    }
    if (!studentData.adm || !studentData.adm.trim()) {
      return Promise.resolve({
        success: false,
        error: "Admission number is required",
      });
    }

    var studentId = generateUniqueStudentId(schoolName, studentData.adm);

    return database
      .ref("schools/" + schoolName + "/students/" + studentData.adm)
      .set({
        name: studentData.name.trim(),
        adm: studentData.adm.trim(),
        studentId: studentId,
        form: studentData.form || "",
        stream: studentData.stream || "",
        gender: studentData.gender || "",
        dob: studentData.dob || "",
        parentName: studentData.parentName || "",
        parentPhone: studentData.parentPhone || "",
        parentEmail: studentData.parentEmail || "",
        addedBy: studentData.addedBy || "",
        addedAt: new Date().toISOString(),
        idGeneratedAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("students_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true, studentId: studentId };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getStudents: function (schoolName) {
    return getCachedData("students_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/students")
        .once("value")
        .then(function (snapshot) {
          var data = snapshot.val();
          if (!data) return [];
          var result = [];
          Object.keys(data).forEach(function (key) {
            var s = data[key];
            delete s.photo;
            delete s.idCardImage;
            result.push(Object.assign({ id: key }, s));
          });
          return result;
        });
    });
  },

  getStudentFull: function (schoolName, adm) {
    return database
      .ref("schools/" + schoolName + "/students/" + adm)
      .once("value")
      .then(function (snap) {
        return snap.val();
      });
  },

  deleteStudent: function (schoolName, adm) {
    return database
      .ref("schools/" + schoolName + "/students/" + adm)
      .remove()
      .then(function () {
        clearCache("students_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ CLASSES ============
  addClass: function (schoolName, classData) {
    var classRef = database.ref("schools/" + schoolName + "/classes").push();
    var classId = classRef.key;
    var students = classData.students || [];
    var studentIdsGenerated = 0;

    return classRef
      .set({
        name: classData.name,
        stream: classData.stream || "",
        teacher: classData.teacher || "",
        students: [],
        createdBy: classData.createdBy || "",
        createdAt: new Date().toISOString(),
        isActive: true,
      })
      .then(function () {
        var studentPromises = [];
        for (var i = 0; i < students.length; i++) {
          var student = students[i];
          var adm = extractAdm(student);
          var name = extractName(student);

          if (adm) {
            var studentId = generateUniqueStudentId(schoolName, adm);
            studentPromises.push(
              database.ref("schools/" + schoolName + "/students/" + adm).set({
                name: name,
                adm: adm,
                studentId: studentId,
                form: classData.name,
                stream: classData.stream || "",
                gender:
                  student.Gender ||
                  student.gender ||
                  student.Sex ||
                  student.sex ||
                  "",
                dob:
                  student.DOB || student.dob || student["Date of Birth"] || "",
                parentName: student["Parent Name"] || student.parentName || "",
                parentPhone:
                  student["Parent Phone"] || student.parentPhone || "",
                parentEmail:
                  student["Parent Email"] || student.parentEmail || "",
                addedBy: classData.createdBy || "",
                addedAt: new Date().toISOString(),
                idGeneratedAt: new Date().toISOString(),
              }),
            );
            students[i].studentId = studentId;
            students[i].StudentID = studentId;
            studentIdsGenerated++;
          }
        }
        return Promise.all(studentPromises);
      })
      .then(function () {
        return database
          .ref("schools/" + schoolName + "/classes/" + classId + "/students")
          .set(students);
      })
      .then(function () {
        clearCache("classes_" + schoolName);
        clearCache("students_" + schoolName);
        bumpServerMarker(schoolName);
        return {
          success: true,
          classId: classId,
          studentIdsGenerated: studentIdsGenerated,
        };
      })
      .catch(function (error) {
        console.error("Add class error:", error);
        return { success: false, error: error.message };
      });
  },

  getClasses: function (schoolName) {
    return getCachedData("classes_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/classes")
        .once("value")
        .then(function (snapshot) {
          var data = snapshot.val();
          if (!data) return [];
          var result = [];
          Object.keys(data).forEach(function (key) {
            var cls = data[key];
            if (cls.students && Array.isArray(cls.students)) {
              cls.students = cls.students.map(function (st) {
                if (st) {
                  delete st.photo;
                  delete st.idCardImage;
                }
                return st;
              });
            }
            result.push(Object.assign({ id: key }, cls));
          });
          return result;
        });
    });
  },

  deleteClass: function (schoolName, classId) {
    return database
      .ref("schools/" + schoolName + "/classes/" + classId)
      .remove()
      .then(function () {
        clearCache("classes_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  deleteClassWithStudents: function (schoolName, classId) {
    return database
      .ref("schools/" + schoolName + "/classes/" + classId)
      .once("value")
      .then(function (snapshot) {
        var classData = snapshot.val();
        if (!classData) return { success: false, error: "Class not found" };

        var students = classData.students || [];
        var studentAdms = [];

        students.forEach(function (st) {
          var adm = extractAdm(st);
          if (adm) studentAdms.push(adm);
        });

        return database
          .ref("schools/" + schoolName + "/classes/" + classId)
          .remove()
          .then(function () {
            var promises = [];
            studentAdms.forEach(function (adm) {
              promises.push(
                database
                  .ref("schools/" + schoolName + "/students/" + adm)
                  .remove(),
              );
              promises.push(
                database
                  .ref("schools/" + schoolName + "/borrowed")
                  .orderByChild("adm")
                  .equalTo(adm)
                  .once("value")
                  .then(function (snap) {
                    var data = snap.val();
                    if (data) {
                      var removes = [];
                      Object.keys(data).forEach(function (key) {
                        removes.push(
                          database
                            .ref("schools/" + schoolName + "/borrowed/" + key)
                            .remove(),
                        );
                      });
                      return Promise.all(removes);
                    }
                    return Promise.resolve();
                  }),
              );
              promises.push(
                database
                  .ref("schools/" + schoolName + "/furniture")
                  .orderByChild("adm")
                  .equalTo(adm)
                  .once("value")
                  .then(function (snap) {
                    var data = snap.val();
                    if (data) {
                      var removes = [];
                      Object.keys(data).forEach(function (key) {
                        removes.push(
                          database
                            .ref("schools/" + schoolName + "/furniture/" + key)
                            .remove(),
                        );
                      });
                      return Promise.all(removes);
                    }
                    return Promise.resolve();
                  }),
              );
              promises.push(
                database
                  .ref("schools/" + schoolName + "/fees")
                  .orderByChild("studentAdm")
                  .equalTo(adm)
                  .once("value")
                  .then(function (snap) {
                    var data = snap.val();
                    if (data) {
                      var removes = [];
                      Object.keys(data).forEach(function (key) {
                        removes.push(
                          database
                            .ref("schools/" + schoolName + "/fees/" + key)
                            .remove(),
                        );
                      });
                      return Promise.all(removes);
                    }
                    return Promise.resolve();
                  }),
              );
              promises.push(
                database
                  .ref("schools/" + schoolName + "/assignments")
                  .orderByChild("adm")
                  .equalTo(adm)
                  .once("value")
                  .then(function (snap) {
                    var data = snap.val();
                    if (data) {
                      var removes = [];
                      Object.keys(data).forEach(function (key) {
                        removes.push(
                          database
                            .ref(
                              "schools/" + schoolName + "/assignments/" + key,
                            )
                            .remove(),
                        );
                      });
                      return Promise.all(removes);
                    }
                    return Promise.resolve();
                  }),
              );
              promises.push(
                database
                  .ref("schools/" + schoolName + "/qrcodes")
                  .orderByChild("adm")
                  .equalTo(adm)
                  .once("value")
                  .then(function (snap) {
                    var data = snap.val();
                    if (data) {
                      var removes = [];
                      Object.keys(data).forEach(function (key) {
                        removes.push(
                          database
                            .ref("schools/" + schoolName + "/qrcodes/" + key)
                            .remove(),
                        );
                      });
                      return Promise.all(removes);
                    }
                    return Promise.resolve();
                  }),
              );
            });
            return Promise.all(promises);
          })
          .then(function () {
            clearCache("classes_" + schoolName);
            clearCache("students_" + schoolName);
            bumpServerMarker(schoolName);
            return { success: true, studentsDeleted: studentAdms.length };
          });
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ FEES ============
  saveFee: function (schoolName, feeData) {
    var balance = (feeData.amount || 0) - (feeData.paid || 0);
    if (feeData.id) {
      return database
        .ref("schools/" + schoolName + "/fees/" + feeData.id)
        .update({
          amount: feeData.amount || 0,
          paid: feeData.paid || 0,
          balance: balance,
          term: feeData.term || "Term 1",
          status: balance <= 0 ? "completed" : "partial",
        })
        .then(function () {
          clearCache("fees_" + schoolName);
          bumpServerMarker(schoolName);
          return { success: true };
        })
        .catch(function (error) {
          return { success: false, error: error.message };
        });
    } else {
      var feeRef = database.ref("schools/" + schoolName + "/fees").push();
      return feeRef
        .set({
          studentAdm: feeData.studentAdm,
          studentName: feeData.studentName,
          amount: feeData.amount || 0,
          paid: feeData.paid || 0,
          balance: balance,
          term: feeData.term || "Term 1",
          status: balance <= 0 ? "completed" : "partial",
          createdAt: new Date().toISOString(),
        })
        .then(function () {
          clearCache("fees_" + schoolName);
          bumpServerMarker(schoolName);
          return { success: true };
        })
        .catch(function (error) {
          return { success: false, error: error.message };
        });
    }
  },

  getFees: function (schoolName) {
    return getCachedData("fees_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/fees")
        .once("value")
        .then(snapshotToArray);
    });
  },

  getFeesByAdm: function (schoolName, adm) {
    return database
      .ref("schools/" + schoolName + "/fees")
      .orderByChild("studentAdm")
      .equalTo(adm)
      .once("value")
      .then(snapshotToArray);
  },

  deleteFee: function (schoolName, feeId) {
    return database
      .ref("schools/" + schoolName + "/fees/" + feeId)
      .remove()
      .then(function () {
        clearCache("fees_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ FURNITURE ============
  allocateFurniture: function (schoolName, furnitureData) {
    if (
      !furnitureData.studentName ||
      !furnitureData.adm ||
      !furnitureData.chairNo
    ) {
      return Promise.resolve({
        success: false,
        error: "Name, ADM, and Chair required",
      });
    }
    var furnitureRef = database
      .ref("schools/" + schoolName + "/furniture")
      .push();
    return furnitureRef
      .set({
        studentName: furnitureData.studentName,
        adm: furnitureData.adm,
        chairNo: furnitureData.chairNo,
        lockerNo: furnitureData.lockerNo || "",
        allocationDate:
          furnitureData.allocationDate ||
          new Date().toISOString().split("T")[0],
        issuedBy: furnitureData.issuedBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("furniture_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getFurniture: function (schoolName) {
    return getCachedData("furniture_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/furniture")
        .once("value")
        .then(snapshotToArray);
    });
  },

  getFurnitureByAdm: function (schoolName, adm) {
    return database
      .ref("schools/" + schoolName + "/furniture")
      .orderByChild("adm")
      .equalTo(adm)
      .once("value")
      .then(snapshotToArray);
  },

  returnFurniture: function (schoolName, furnitureId) {
    return database
      .ref("schools/" + schoolName + "/furniture/" + furnitureId)
      .remove()
      .then(function () {
        clearCache("furniture_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ TEACHERS ============
  addTeacher: function (schoolName, teacherData) {
    var teacherRef = database.ref("schools/" + schoolName + "/teachers").push();
    return teacherRef
      .set({
        name: teacherData.name,
        email: teacherData.email || "",
        phone: teacherData.phone || "",
        subjects: teacherData.subjects || "",
        classes: teacherData.classes || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("teachers_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getTeachers: function (schoolName) {
    return getCachedData("teachers_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/teachers")
        .once("value")
        .then(snapshotToArray);
    });
  },

  deleteTeacher: function (schoolName, teacherId) {
    return database
      .ref("schools/" + schoolName + "/teachers/" + teacherId)
      .remove()
      .then(function () {
        clearCache("teachers_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ EVENTS ============
  addEvent: function (schoolName, eventData) {
    var eventRef = database.ref("schools/" + schoolName + "/events").push();
    return eventRef
      .set({
        title: eventData.title,
        description: eventData.description || "",
        eventDate: eventData.eventDate,
        eventType: eventData.eventType || "Other",
        createdBy: eventData.createdBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("events_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getEvents: function (schoolName) {
    return getCachedData("events_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/events")
        .once("value")
        .then(snapshotToArray);
    });
  },

  // ============ TIMETABLE ============
  addTimetableEntry: function (schoolName, entryData) {
    var classEntryRef = database
      .ref(
        "schools/" + schoolName + "/timetable/classes/" + entryData.className,
      )
      .push();
    return classEntryRef
      .set({
        day: entryData.day,
        period: entryData.period,
        subject: entryData.subject,
        teacher: entryData.teacher || "",
        room: entryData.room || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("timetable_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getTimetable: function (schoolName) {
    return getCachedData("timetable_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/timetable/classes")
        .once("value")
        .then(function (snapshot) {
          var timetable = snapshot.val();
          var result = [];
          if (timetable) {
            Object.keys(timetable).forEach(function (className) {
              Object.keys(timetable[className]).forEach(function (entryId) {
                result.push(
                  Object.assign(
                    { className: className },
                    timetable[className][entryId],
                  ),
                );
              });
            });
          }
          return result;
        });
    });
  },

  // ============ TERMS ============
  addTerm: function (schoolName, termData) {
    var termRef = database.ref("schools/" + schoolName + "/terms").push();
    return termRef
      .set({
        name: termData.name,
        startDate: termData.startDate,
        endDate: termData.endDate,
        isCurrent: termData.isCurrent || false,
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("terms_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getTerms: function (schoolName) {
    return getCachedData("terms_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/terms")
        .once("value")
        .then(snapshotToArray);
    });
  },

  // ============ CHAT ============
  sendChatMessage: function (schoolName, messageData) {
    var msgRef = database.ref("schools/" + schoolName + "/chat").push();
    return msgRef
      .set({
        fromEmail: messageData.fromEmail,
        fromName: messageData.fromName,
        toEmail: messageData.toEmail,
        message: messageData.message,
        timestamp: new Date().toISOString(),
        readStatus: false,
      })
      .then(function () {
        clearCache("chat_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getChatMessages: function (schoolName, userEmail, otherEmail) {
    return getCachedData(
      "chat_" + schoolName,
      function () {
        return database
          .ref("schools/" + schoolName + "/chat")
          .once("value")
          .then(snapshotToArray)
          .then(function (messages) {
            if (otherEmail === userEmail) {
              return messages.filter(function (msg) {
                return msg.toEmail === userEmail && !msg.readStatus;
              });
            }
            return messages
              .filter(function (msg) {
                return (
                  (msg.fromEmail === userEmail && msg.toEmail === otherEmail) ||
                  (msg.fromEmail === otherEmail && msg.toEmail === userEmail)
                );
              })
              .sort(function (a, b) {
                return new Date(a.timestamp) - new Date(b.timestamp);
              });
          });
      },
      5000,
    );
  },

  markMessagesAsRead: function (schoolName, userEmail, otherEmail) {
    return database
      .ref("schools/" + schoolName + "/chat")
      .once("value")
      .then(function (snapshot) {
        var messages = snapshot.val();
        if (!messages) return { success: true };
        var updates = {};
        Object.keys(messages).forEach(function (key) {
          var msg = messages[key];
          if (
            msg.fromEmail === otherEmail &&
            msg.toEmail === userEmail &&
            !msg.readStatus
          ) {
            updates["schools/" + schoolName + "/chat/" + key + "/readStatus"] =
              true;
          }
        });
        return database.ref().update(updates);
      })
      .then(function () {
        clearCache("chat_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ FORUM ============
  postForumMessage: function (schoolName, messageData) {
    var msgRef = database.ref("schools/" + schoolName + "/forum").push();
    return msgRef
      .set({
        fromEmail: messageData.fromEmail,
        fromName: messageData.fromName,
        role: messageData.role || "teacher",
        message: messageData.message,
        timestamp: new Date().toISOString(),
        isDeleted: false,
      })
      .then(function () {
        clearCache("forum_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getForumMessages: function (schoolName) {
    return getCachedData(
      "forum_" + schoolName,
      function () {
        return database
          .ref("schools/" + schoolName + "/forum")
          .once("value")
          .then(snapshotToArray)
          .then(function (messages) {
            return messages.filter(function (msg) {
              return !msg.isDeleted;
            });
          });
      },
      10000,
    );
  },

  // ============ NOTES ============
  saveNote: function (schoolName, noteData) {
    var noteRef;
    if (noteData.noteId) {
      noteRef = database.ref(
        "schools/" + schoolName + "/notes/" + noteData.noteId,
      );
      return noteRef
        .update({
          title: noteData.title || "Untitled",
          content: noteData.content,
          timestamp: new Date().toISOString(),
        })
        .then(function () {
          clearCache("notes_" + schoolName);
          return { success: true };
        })
        .catch(function (error) {
          return { success: false, error: error.message };
        });
    } else {
      noteRef = database.ref("schools/" + schoolName + "/notes").push();
      return noteRef
        .set({
          author: noteData.author,
          authorEmail: noteData.authorEmail,
          title: noteData.title || "Untitled",
          content: noteData.content,
          timestamp: new Date().toISOString(),
          isPrivate: true,
          isDeleted: false,
        })
        .then(function () {
          clearCache("notes_" + schoolName);
          return { success: true };
        })
        .catch(function (error) {
          return { success: false, error: error.message };
        });
    }
  },

  getNotes: function (schoolName, userEmail) {
    return database
      .ref("schools/" + schoolName + "/notes")
      .once("value")
      .then(snapshotToArray)
      .then(function (notes) {
        return notes
          .filter(function (note) {
            return !note.isDeleted && note.authorEmail === userEmail;
          })
          .sort(function (a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
      })
      .catch(function () {
        return [];
      });
  },

  deleteNote: function (schoolName, noteId) {
    return database
      .ref("schools/" + schoolName + "/notes/" + noteId)
      .update({ isDeleted: true })
      .then(function () {
        clearCache("notes_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ AUDIT LOG ============
  addAuditLog: function (schoolName, logData) {
    var logRef = database.ref("schools/" + schoolName + "/auditLog").push();
    return logRef
      .set({
        timestamp: new Date().toISOString(),
        user: logData.user || "System",
        userEmail: logData.userEmail || "",
        action: logData.action,
        details: logData.details || "",
      })
      .then(function () {
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getAuditLog: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/auditLog")
      .once("value")
      .then(snapshotToArray)
      .then(function (logs) {
        return logs.reverse().slice(0, 200);
      })
      .catch(function () {
        return [];
      });
  },

  // ============ SETTINGS ============
  getSettings: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/settings")
      .once("value")
      .then(function (snapshot) {
        return (
          snapshot.val() || {
            maxBorrowDays: 14,
            maxBooksPerStudent: 3,
            finePerDay: 10,
          }
        );
      })
      .catch(function () {
        return null;
      });
  },

  updateSettings: function (schoolName, settingsData) {
    return database
      .ref("schools/" + schoolName + "/settings")
      .update(settingsData)
      .then(function () {
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ DATABASE MANAGER ============
  getTableData: function (schoolName, tableName) {
    return database
      .ref("schools/" + schoolName + "/" + tableName)
      .once("value")
      .then(snapshotToArray)
      .catch(function () {
        return [];
      });
  },

  // ============ UNIFIED ASSIGNMENT ============
  assignItem: function (schoolName, itemData) {
    if (
      !itemData.studentName ||
      !itemData.adm ||
      !itemData.itemType ||
      !itemData.itemNo
    ) {
      return Promise.resolve({ success: false, error: "All fields required" });
    }
    var assignmentRef = database
      .ref("schools/" + schoolName + "/assignments")
      .push();
    return assignmentRef
      .set({
        studentName: itemData.studentName,
        adm: itemData.adm,
        itemType: itemData.itemType,
        itemNo: itemData.itemNo,
        assignedDate: new Date().toISOString().split("T")[0],
        assignedBy: itemData.assignedBy || "",
        notes: itemData.notes || "",
        returned: false,
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("assignments_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getAssignments: function (schoolName, adm) {
    return database
      .ref("schools/" + schoolName + "/assignments")
      .orderByChild("adm")
      .equalTo(adm)
      .once("value")
      .then(snapshotToArray)
      .catch(function () {
        return [];
      });
  },

  getAssignmentsByAdm: function (schoolName, adm) {
    return database
      .ref("schools/" + schoolName + "/assignments")
      .orderByChild("adm")
      .equalTo(adm)
      .once("value")
      .then(snapshotToArray)
      .catch(function () {
        return [];
      });
  },

  getAllAssignments: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/assignments")
      .once("value")
      .then(snapshotToArray)
      .catch(function () {
        return [];
      });
  },

  returnAssignment: function (schoolName, assignmentId) {
    return database
      .ref("schools/" + schoolName + "/assignments/" + assignmentId)
      .update({
        returned: true,
        returnDate: new Date().toISOString().split("T")[0],
      })
      .then(function () {
        clearCache("assignments_" + schoolName);
        bumpServerMarker(schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ TEST ============
  testConnection: function () {
    var testRef = database.ref("test/connection");
    return testRef
      .set({ timestamp: new Date().toISOString() })
      .then(function () {
        return testRef.remove();
      })
      .then(function () {
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ CACHE UTILITIES ============
  wipeAllCache: wipeAllCache,
  clearCache: clearCache,
  getCacheStats: function () {
    try {
      var total = 0,
        count = 0;
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(CACHE_PREFIX) === 0) {
          total += (localStorage.getItem(k) || "").length;
          count++;
        }
      }
      return {
        collections: count,
        bytes: total,
        mb: (total / 1024 / 1024).toFixed(2),
      };
    } catch (e) {
      return { collections: 0, bytes: 0, mb: "0.00" };
    }
  },
};

/* ============================================================
   API GUARD — prevents calls before Firebase is ready
   ============================================================ */
(function guardApiCalls() {
  Object.keys(API).forEach(function (key) {
    if (typeof API[key] === "function") {
      var original = API[key];
      API[key] = function () {
        if (!database) {
          console.warn("⚠️ API." + key + " called before Firebase was ready.");
          return Promise.resolve({
            success: false,
            error: "Firebase not ready yet. Please reload the page.",
          });
        }
        return original.apply(this, arguments);
      };
    }
  });
})();

window.API = API;
window.dataCache = dataCache;
window.clearCache = clearCache;
window.wipeAllCache = wipeAllCache;
window.generateUniqueStudentId = generateUniqueStudentId;
window.generateInviteCode = generateInviteCode;
window.extractAdm = extractAdm;
window.extractName = extractName;

console.log("✅ API loaded — CACHE-FIRST + PERSISTENT + BACKGROUND SYNC");
console.log("📦 Cache version: v" + CACHE_VERSION);
console.log("⏱️ Firebase timeout: " + FIREBASE_TIMEOUT_MS + "ms");
console.log("🔑 Invite codes are UNIQUE per school (8 chars)");
