// ============================================
// SRMS - Complete Firebase API
// Optimized Version - Super Fast
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

// Initialize Firebase with error handling
try {
  if (typeof firebase !== "undefined" && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized successfully");
  } else {
    console.log("✅ Firebase already initialized");
  }
  var database = firebase.database();
  console.log("✅ Database connected");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
}

// ============ CACHE SYSTEM ============
var dataCache = {};
var CACHE_EXPIRY = 30000; // 30 seconds

function getCachedData(key, fetchFunction, expiryMs) {
  expiryMs = expiryMs || CACHE_EXPIRY;
  var now = Date.now();

  if (dataCache[key] && now - dataCache[key].timestamp < expiryMs) {
    return Promise.resolve(dataCache[key].data);
  }

  return fetchFunction()
    .then(function (data) {
      dataCache[key] = {
        timestamp: now,
        data: data,
      };
      return data;
    })
    .catch(function (error) {
      console.error("Cache fetch error for " + key + ":", error);
      return dataCache[key] ? dataCache[key].data : [];
    });
}

function clearCache(key) {
  if (key) {
    delete dataCache[key];
  } else {
    dataCache = {};
  }
}

// ============ HELPER FUNCTIONS ============
function generateInviteCode(length) {
  length = length || 8;
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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

// ============ FAST HELPER ============
function snapshotToArray(snapshot) {
  var data = snapshot.val();
  if (!data) return [];
  var result = [];
  Object.keys(data).forEach(function (key) {
    result.push(Object.assign({ id: key }, data[key]));
  });
  return result;
}

// ============ API OBJECT ============
var API = {
  // ============ SCHOOL OPERATIONS ============
  getSchool: function (schoolName) {
    return getCachedData(
      "school_" + schoolName,
      function () {
        return database
          .ref("schools/" + schoolName)
          .once("value")
          .then(function (snapshot) {
            return snapshot.val() || null;
          });
      },
      60000,
    );
  },

  createSchool: function (schoolData) {
    var inviteCode = generateInviteCode();
    var emailKey = schoolData.adminEmail.replace(/\./g, ",");

    var updates = {};
    updates["schools/" + schoolData.name] = {
      name: schoolData.name,
      address: schoolData.address || "",
      adminName: schoolData.adminName,
      adminEmail: schoolData.adminEmail,
      adminPhone: schoolData.adminPhone || "",
      inviteCode: inviteCode,
      motto: schoolData.motto || "",
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    updates["schools/" + schoolData.name + "/settings"] = {
      maxBorrowDays: 14,
      maxBooksPerStudent: 3,
      finePerDay: 10,
    };
    updates["schools/" + schoolData.name + "/users/" + emailKey] = {
      name: schoolData.adminName,
      email: schoolData.adminEmail,
      role: "admin",
      staffId: "ADMIN-001",
      password: hashPassword(schoolData.password || "admin123"),
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    return database
      .ref()
      .update(updates)
      .then(function () {
        clearCache("school_" + schoolData.name);
        return { success: true, inviteCode: inviteCode };
      })
      .catch(function (error) {
        console.error("Create school error:", error);
        return { success: false, error: error.message };
      });
  },

  updateSchool: function (schoolName, schoolData) {
    return database
      .ref("schools/" + schoolName)
      .update(schoolData)
      .then(function () {
        clearCache("school_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ AUTHENTICATION ============
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
        console.error("Login error:", error);
        return { success: false, error: error.message };
      });
  },

  createUser: function (schoolName, userData) {
    var emailKey = userData.email.replace(/\./g, ",");
    return database
      .ref("schools/" + schoolName + "/users/" + emailKey)
      .once("value")
      .then(function (snapshot) {
        if (snapshot.exists()) {
          return { success: false, error: "User already exists" };
        }
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
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ BOOK OPERATIONS ============
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
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ BORROWING OPERATIONS ============
  issueBook: function (schoolName, borrowData) {
    var borrowRef = database.ref("schools/" + schoolName + "/borrowed").push();
    return borrowRef
      .set({
        studentName: borrowData.studentName,
        adm: borrowData.adm,
        form: borrowData.form || "",
        stream: borrowData.stream || "",
        bookTitle: borrowData.bookTitle,
        bookNo: borrowData.bookNo,
        qrId: borrowData.qrId || null,
        borrowDate: borrowData.borrowDate,
        returnDate: borrowData.returnDate,
        returned: false,
        issuedBy: borrowData.issuedBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("borrowed_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getBorrowed: function (schoolName) {
    return getCachedData("borrowed_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/borrowed")
        .once("value")
        .then(snapshotToArray);
    });
  },

  returnBook: function (schoolName, borrowId) {
    return database
      .ref("schools/" + schoolName + "/borrowed/" + borrowId)
      .once("value")
      .then(function (snapshot) {
        var borrowRecord = snapshot.val();
        if (borrowRecord && borrowRecord.qrId) {
          return API.returnQRCode(schoolName, borrowRecord.qrId);
        }
        return Promise.resolve();
      })
      .then(function () {
        return database
          .ref("schools/" + schoolName + "/borrowed/" + borrowId)
          .remove();
      })
      .then(function () {
        clearCache("borrowed_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ QR CODE OPERATIONS ============
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

  scanQRCode: function (schoolName, code) {
    return API.getQRCodes(schoolName)
      .then(function (codes) {
        var foundQR = null;
        var foundId = null;
        for (var i = 0; i < codes.length; i++) {
          if (codes[i].code === code) {
            foundQR = codes[i];
            foundId = codes[i].id;
            break;
          }
        }
        if (!foundQR) {
          return { success: false, error: "Code not found in database" };
        }
        if (foundQR.assigned && !foundQR.returned) {
          return {
            success: true,
            status: "assigned",
            qr: foundQR,
            id: foundId,
          };
        }
        return { success: true, status: "available", qr: foundQR, id: foundId };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  assignQRCode: function (schoolName, qrId, assignmentData) {
    return database
      .ref("schools/" + schoolName + "/qrcodes/" + qrId)
      .update({
        assigned: true,
        assignedTo: assignmentData.studentName,
        className: assignmentData.className || "",
        stream: assignmentData.stream || "",
        adm: assignmentData.adm || "",
        assignedAt: new Date().toISOString(),
        returned: false,
      })
      .then(function () {
        clearCache("qrcodes_" + schoolName);
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
        return database
          .ref("schools/" + schoolName + "/borrowed")
          .once("value");
      })
      .then(function (snapshot) {
        var borrowed = snapshot.val();
        if (borrowed) {
          var updates = {};
          Object.keys(borrowed).forEach(function (key) {
            if (borrowed[key].qrId === qrId) {
              updates["schools/" + schoolName + "/borrowed/" + key] = null;
            }
          });
          return database.ref().update(updates);
        }
        return Promise.resolve();
      })
      .then(function () {
        clearCache("borrowed_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  generateStudentID: function (schoolName, adm) {
    var student = null;
    return database
      .ref("schools/" + schoolName + "/students/" + adm)
      .once("value")
      .then(function (snapshot) {
        student = snapshot.val();
        if (!student) {
          return { success: false, error: "Student not found" };
        }
        return database
          .ref("schools/" + schoolName + "/qrcodes")
          .orderByChild("adm")
          .equalTo(adm)
          .once("value");
      })
      .then(function (snapshot) {
        var existingQRs = snapshot.val();
        if (existingQRs) {
          var keys = Object.keys(existingQRs);
          for (var i = 0; i < keys.length; i++) {
            if (!existingQRs[keys[i]].returned) {
              return {
                success: true,
                qrCode: existingQRs[keys[i]].code,
                student: student,
                existing: true,
              };
            }
          }
        }
        var qrRef = database.ref("schools/" + schoolName + "/qrcodes");
        return qrRef.once("value").then(function (snap) {
          var existingCodes = snap.val() || {};
          var usedCodes = {};
          Object.values(existingCodes).forEach(function (qr) {
            usedCodes[qr.code] = true;
          });
          var qrCode = generateUniqueQRCode("STUDENT", usedCodes);
          var newQRRef = qrRef.push();

          var updates = {};
          updates["schools/" + schoolName + "/qrcodes/" + newQRRef.key] = {
            code: qrCode,
            type: "student",
            assigned: true,
            assignedTo: student.name,
            className: student.form || "",
            stream: student.stream || "",
            adm: adm,
            returned: false,
            createdAt: new Date().toISOString(),
          };
          updates["schools/" + schoolName + "/students/" + adm + "/qrCode"] =
            qrCode;
          updates[
            "schools/" + schoolName + "/students/" + adm + "/idGeneratedAt"
          ] = new Date().toISOString();

          return database
            .ref()
            .update(updates)
            .then(function () {
              clearCache("qrcodes_" + schoolName);
              clearCache("students_" + schoolName);
              return { success: true, qrCode: qrCode, student: student };
            });
        });
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getStudentByQRCode: function (schoolName, qrCode) {
    return database
      .ref("schools/" + schoolName + "/students")
      .orderByChild("qrCode")
      .equalTo(qrCode)
      .once("value")
      .then(function (snapshot) {
        var students = snapshot.val();
        if (!students) {
          return {
            success: false,
            error: "No student found with this QR code",
          };
        }
        var adm = Object.keys(students)[0];
        var student = students[adm];
        return database
          .ref("schools/" + schoolName + "/qrcodes")
          .orderByChild("code")
          .equalTo(qrCode)
          .once("value")
          .then(function (qrSnapshot) {
            var qrData = qrSnapshot.val();
            var qrInfo = null;
            if (qrData) {
              var qrId = Object.keys(qrData)[0];
              qrInfo = qrData[qrId];
              qrInfo.id = qrId;
            }
            return {
              success: true,
              student: student,
              adm: adm,
              qrInfo: qrInfo,
            };
          });
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ STUDENT OPERATIONS ============
  addStudent: function (schoolName, studentData) {
    return database
      .ref("schools/" + schoolName + "/students/" + studentData.adm)
      .set({
        name: studentData.name,
        adm: studentData.adm,
        form: studentData.form || "",
        stream: studentData.stream || "",
        gender: studentData.gender || "",
        dob: studentData.dob || "",
        parentName: studentData.parentName || "",
        parentPhone: studentData.parentPhone || "",
        parentEmail: studentData.parentEmail || "",
        addedBy: studentData.addedBy || "",
        addedAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("students_" + schoolName);
        return { success: true };
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
        .then(snapshotToArray);
    });
  },

  deleteStudent: function (schoolName, adm) {
    return database
      .ref("schools/" + schoolName + "/students/" + adm)
      .remove()
      .then(function () {
        clearCache("students_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ CLASS OPERATIONS ============
  addClass: function (schoolName, classData) {
    var classRef = database.ref("schools/" + schoolName + "/classes").push();
    var classId = classRef.key;

    var updates = {};
    updates["schools/" + schoolName + "/classes/" + classId] = {
      name: classData.name,
      stream: classData.stream || "",
      teacher: classData.teacher || "",
      students: classData.students || [],
      createdBy: classData.createdBy || "",
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    var students = classData.students || [];
    for (var i = 0; i < students.length; i++) {
      var student = students[i];
      var adm = student.ADM || student.adm || student["ADM No"] || "";
      var name =
        student.Name || student.name || student["Full Name"] || "Unknown";
      if (adm) {
        updates["schools/" + schoolName + "/students/" + adm] = {
          name: name,
          adm: adm,
          form: classData.name,
          stream: classData.stream || "",
          gender: student.Gender || student.gender || "",
          dob: student.DOB || student.dob || "",
          parentName: student["Parent Name"] || "",
          parentPhone: student["Parent Phone"] || "",
          parentEmail: student["Parent Email"] || "",
          addedBy: classData.createdBy || "",
          addedAt: new Date().toISOString(),
        };
      }
    }

    return database
      .ref()
      .update(updates)
      .then(function () {
        clearCache("classes_" + schoolName);
        clearCache("students_" + schoolName);
        return { success: true, classId: classId };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getClasses: function (schoolName) {
    return getCachedData("classes_" + schoolName, function () {
      return database
        .ref("schools/" + schoolName + "/classes")
        .once("value")
        .then(snapshotToArray);
    });
  },

  deleteClass: function (schoolName, classId) {
    return database
      .ref("schools/" + schoolName + "/classes/" + classId)
      .remove()
      .then(function () {
        clearCache("classes_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ FEES OPERATIONS ============
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
          lastPaymentDate: new Date().toISOString().split("T")[0],
          status: balance <= 0 ? "completed" : "partial",
        })
        .then(function () {
          clearCache("fees_" + schoolName);
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
          lastPaymentDate: new Date().toISOString().split("T")[0],
          status: balance <= 0 ? "completed" : "partial",
          createdAt: new Date().toISOString(),
        })
        .then(function () {
          clearCache("fees_" + schoolName);
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

  deleteFee: function (schoolName, feeId) {
    return database
      .ref("schools/" + schoolName + "/fees/" + feeId)
      .remove()
      .then(function () {
        clearCache("fees_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ FURNITURE OPERATIONS ============
  allocateFurniture: function (schoolName, furnitureData) {
    var furnitureRef = database
      .ref("schools/" + schoolName + "/furniture")
      .push();
    return furnitureRef
      .set({
        studentName: furnitureData.studentName,
        adm: furnitureData.adm,
        form: furnitureData.form || "",
        stream: furnitureData.stream || "",
        chairNo: furnitureData.chairNo,
        lockerNo: furnitureData.lockerNo || "",
        allocationDate: furnitureData.allocationDate,
        issuedBy: furnitureData.issuedBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("furniture_" + schoolName);
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

  returnFurniture: function (schoolName, furnitureId) {
    return database
      .ref("schools/" + schoolName + "/furniture/" + furnitureId)
      .remove()
      .then(function () {
        clearCache("furniture_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ TEACHER OPERATIONS ============
  addTeacher: function (schoolName, teacherData) {
    var teacherRef = database.ref("schools/" + schoolName + "/teachers").push();
    return teacherRef
      .set({
        name: teacherData.name,
        email: teacherData.email || "",
        phone: teacherData.phone || "",
        subjects: teacherData.subjects || "",
        classes: teacherData.classes || "",
        addedBy: teacherData.addedBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("teachers_" + schoolName);
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
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ EVENTS OPERATIONS ============
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

  // ============ TIMETABLE OPERATIONS ============
  addTimetableEntry: function (schoolName, entryData) {
    var classEntryRef = database
      .ref(
        "schools/" + schoolName + "/timetable/classes/" + entryData.className,
      )
      .push();

    var updates = {};
    updates[
      "schools/" +
        schoolName +
        "/timetable/classes/" +
        entryData.className +
        "/" +
        classEntryRef.key
    ] = {
      day: entryData.day,
      period: entryData.period,
      subject: entryData.subject,
      teacher: entryData.teacher || "",
      room: entryData.room || "",
      createdBy: entryData.createdBy || "",
      createdAt: new Date().toISOString(),
    };

    if (entryData.teacher) {
      var teacherKey = entryData.teacher.replace(/\./g, ",");
      var teacherEntryRef = database
        .ref("schools/" + schoolName + "/timetable/teachers/" + teacherKey)
        .push();
      updates[
        "schools/" +
          schoolName +
          "/timetable/teachers/" +
          teacherKey +
          "/" +
          teacherEntryRef.key
      ] = {
        day: entryData.day,
        period: entryData.period,
        subject: entryData.subject,
        className: entryData.className,
        room: entryData.room || "",
        createdAt: new Date().toISOString(),
      };
    }

    return database
      .ref()
      .update(updates)
      .then(function () {
        clearCache("timetable_" + schoolName);
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

  // ============ TERMS OPERATIONS ============
  addTerm: function (schoolName, termData) {
    var termRef = database.ref("schools/" + schoolName + "/terms").push();
    return termRef
      .set({
        name: termData.name,
        startDate: termData.startDate,
        endDate: termData.endDate,
        isCurrent: termData.isCurrent || false,
        createdBy: termData.createdBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        clearCache("terms_" + schoolName);
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

  // ============ CHAT OPERATIONS ============
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
      "chat_" + schoolName + "_" + userEmail + "_" + otherEmail,
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
    ); // 5 second cache for chat
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

  // ============ FORUM OPERATIONS ============
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
    ); // 10 second cache
  },

  // ============ NOTEPAD OPERATIONS ============
  saveNote: function (schoolName, noteData) {
    var noteRef;
    if (noteData.noteId) {
      noteRef = database.ref(
        "schools/" + schoolName + "/notes/" + noteData.noteId,
      );
      return noteRef
        .update({
          author: noteData.author,
          authorEmail: noteData.authorEmail,
          title: noteData.title || "Untitled",
          content: noteData.content,
          timestamp: new Date().toISOString(),
        })
        .then(function () {
          clearCache("notes_" + schoolName);
          return { success: true };
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
        });
    }
  },

  getNotes: function (schoolName, userEmail) {
    return getCachedData("notes_" + schoolName + "_" + userEmail, function () {
      return database
        .ref("schools/" + schoolName + "/notes")
        .once("value")
        .then(snapshotToArray)
        .then(function (notes) {
          return notes.filter(function (note) {
            return !note.isDeleted && note.authorEmail === userEmail;
          });
        });
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
        clearCache("auditlog_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getAuditLog: function (schoolName) {
    return getCachedData(
      "auditlog_" + schoolName,
      function () {
        return database
          .ref("schools/" + schoolName + "/auditLog")
          .once("value")
          .then(snapshotToArray)
          .then(function (logs) {
            return logs.reverse().slice(0, 200);
          });
      },
      15000,
    );
  },

  // ============ SETTINGS ============
  getSettings: function (schoolName) {
    return getCachedData(
      "settings_" + schoolName,
      function () {
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
          });
      },
      60000,
    );
  },

  updateSettings: function (schoolName, settingsData) {
    return database
      .ref("schools/" + schoolName + "/settings")
      .update(settingsData)
      .then(function () {
        clearCache("settings_" + schoolName);
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ DATABASE MANAGER ============
  getTableData: function (schoolName, tableName) {
    return getCachedData(
      "table_" + schoolName + "_" + tableName,
      function () {
        return database
          .ref("schools/" + schoolName + "/" + tableName)
          .once("value")
          .then(snapshotToArray);
      },
      10000,
    );
  },

  // ============ TEST CONNECTION ============
  testConnection: function () {
    console.log("Testing Firebase connection...");
    var testRef = database.ref("test/connection");
    return testRef
      .set({
        timestamp: new Date().toISOString(),
        message: "Connection test",
      })
      .then(function () {
        console.log("✅ Write successful!");
        return testRef.once("value");
      })
      .then(function (snapshot) {
        console.log("✅ Read successful:", snapshot.val());
        return testRef.remove();
      })
      .then(function () {
        console.log("✅ Test complete - Database is working!");
        return { success: true, message: "Database connected successfully!" };
      })
      .catch(function (error) {
        console.error("❌ Database test failed:", error);
        return { success: false, error: error.message };
      });
  },
};

// Export
window.API = API;
window.dataCache = dataCache;
window.clearCache = clearCache;
