// ============================================
// SRMS - Optimized Firebase API
// With Caching for Super Fast Performance
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyACefHWvbETo2siNZy4ETCWZVTwIrtaNMs",
  authDomain: "srms-fd318.firebaseapp.com",
  databaseURL: "https://srms-fd318-default-rtdb.firebaseio.com",
  projectId: "srms-fd318",
  storageBucket: "srms-fd318.firebasestorage.app",
  messagingSenderId: "828888967437",
  appId: "1:828888967437:web:90461f6b1bc79854ea6844",
};

if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

// ============ CACHE SYSTEM ============
const CacheManager = {
  cache: {},
  timestamps: {},

  // Cache duration in milliseconds (30 seconds)
  DEFAULT_TTL: 30000,

  get(key) {
    var entry = this.cache[key];
    if (!entry) return null;

    var now = Date.now();
    if (now - this.timestamps[key] > this.DEFAULT_TTL) {
      delete this.cache[key];
      delete this.timestamps[key];
      return null;
    }

    return entry;
  },

  set(key, value) {
    this.cache[key] = value;
    this.timestamps[key] = Date.now();
  },

  clear() {
    this.cache = {};
    this.timestamps = {};
  },
};

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

// ============ API OBJECT WITH CACHING ============
const API = {
  // ============ SCHOOL ============
  async getSchool(schoolName) {
    var cacheKey = "school_" + schoolName;
    var cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const snapshot = await database
        .ref("schools/" + schoolName)
        .once("value");
      var data = snapshot.val();
      CacheManager.set(cacheKey, data);
      return data;
    } catch (error) {
      return null;
    }
  },

  async createSchool(schoolData) {
    try {
      const inviteCode = generateInviteCode();
      const emailKey = schoolData.adminEmail.replace(/\./g, ",");

      await database.ref("schools/" + schoolData.name).set({
        name: schoolData.name,
        address: schoolData.address || "",
        adminName: schoolData.adminName,
        adminEmail: schoolData.adminEmail,
        inviteCode: inviteCode,
        createdAt: new Date().toISOString(),
        isActive: true,
      });

      await database.ref("schools/" + schoolData.name + "/settings").set({
        maxBorrowDays: 14,
        maxBooksPerStudent: 3,
        finePerDay: 10,
      });

      await database
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

      return { success: true, inviteCode: inviteCode };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ AUTH ============
  async login(schoolName, email, password) {
    try {
      const emailKey = email.replace(/\./g, ",");
      const snapshot = await database
        .ref("schools/" + schoolName + "/users/" + emailKey)
        .once("value");
      const user = snapshot.val();

      if (
        user &&
        user.password === hashPassword(password) &&
        user.isActive !== false
      ) {
        const sessionUser = {
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
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createUser(schoolName, userData) {
    try {
      const emailKey = userData.email.replace(/\./g, ",");
      await database.ref("schools/" + schoolName + "/users/" + emailKey).set({
        name: userData.name,
        email: userData.email,
        role: userData.role || "teacher",
        staffId: userData.staffId || generateStaffId(),
        password: hashPassword(userData.password),
        createdAt: new Date().toISOString(),
        isActive: true,
      });
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUsers(schoolName) {
    var cacheKey = "users_" + schoolName;
    var cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/users")
        .once("value");
      const users = snapshot.val();
      var result = users
        ? Object.entries(users).map(function (entry) {
            return Object.assign({ id: entry[0] }, entry[1]);
          })
        : [];
      CacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      return [];
    }
  },

  async updateUser(schoolName, email, userData) {
    try {
      const emailKey = email.replace(/\./g, ",");
      await database
        .ref("schools/" + schoolName + "/users/" + emailKey)
        .update(userData);
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteUser(schoolName, email) {
    try {
      const emailKey = email.replace(/\./g, ",");
      await database
        .ref("schools/" + schoolName + "/users/" + emailKey)
        .update({ isActive: false });
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ BOOKS ============
  async addBook(schoolName, bookData) {
    try {
      const bookRef = database.ref("schools/" + schoolName + "/books").push();
      await bookRef.set({
        title: bookData.title,
        author: bookData.author || "",
        type: bookData.type || "Textbook",
        subject: bookData.subject || "",
        quantity: bookData.quantity || 1,
        available: bookData.quantity || 1,
        createdBy: bookData.createdBy || "",
        createdAt: new Date().toISOString(),
      });
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBooks(schoolName) {
    var cacheKey = "books_" + schoolName;
    var cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/books")
        .once("value");
      const books = snapshot.val();
      var result = books
        ? Object.entries(books).map(function (entry) {
            return Object.assign({ id: entry[0] }, entry[1]);
          })
        : [];
      CacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      return [];
    }
  },

  async deleteBook(schoolName, bookId) {
    try {
      await database.ref("schools/" + schoolName + "/books/" + bookId).remove();
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ BORROWING ============
  async issueBook(schoolName, borrowData) {
    try {
      const borrowRef = database
        .ref("schools/" + schoolName + "/borrowed")
        .push();
      await borrowRef.set({
        studentName: borrowData.studentName,
        adm: borrowData.adm,
        form: borrowData.form || "",
        stream: borrowData.stream || "",
        bookTitle: borrowData.bookTitle,
        bookNo: borrowData.bookNo,
        borrowDate: borrowData.borrowDate,
        returnDate: borrowData.returnDate,
        returned: false,
        issuedBy: borrowData.issuedBy || "",
        createdAt: new Date().toISOString(),
      });
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBorrowed(schoolName) {
    var cacheKey = "borrowed_" + schoolName;
    var cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/borrowed")
        .once("value");
      const borrowed = snapshot.val();
      var result = borrowed
        ? Object.entries(borrowed).map(function (entry) {
            return Object.assign({ id: entry[0] }, entry[1]);
          })
        : [];
      CacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      return [];
    }
  },

  async returnBook(schoolName, borrowId) {
    try {
      await database
        .ref("schools/" + schoolName + "/borrowed/" + borrowId)
        .remove();
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ STUDENTS ============
  async addStudent(schoolName, studentData) {
    try {
      await database
        .ref("schools/" + schoolName + "/students/" + studentData.adm)
        .set({
          name: studentData.name,
          adm: studentData.adm,
          form: studentData.form || "",
          stream: studentData.stream || "",
          gender: studentData.gender || "",
          parentName: studentData.parentName || "",
          parentPhone: studentData.parentPhone || "",
          parentEmail: studentData.parentEmail || "",
          addedBy: studentData.addedBy || "",
          addedAt: new Date().toISOString(),
        });
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getStudents(schoolName) {
    var cacheKey = "students_" + schoolName;
    var cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/students")
        .once("value");
      const students = snapshot.val();
      var result = students
        ? Object.entries(students).map(function (entry) {
            return Object.assign({ adm: entry[0] }, entry[1]);
          })
        : [];
      CacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      return [];
    }
  },

  async deleteStudent(schoolName, adm) {
    try {
      await database.ref("schools/" + schoolName + "/students/" + adm).remove();
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ CLASSES ============
  async addClass(schoolName, classData) {
    try {
      const classRef = database
        .ref("schools/" + schoolName + "/classes")
        .push();
      await classRef.set({
        name: classData.name,
        stream: classData.stream || "",
        teacher: classData.teacher || "",
        students: classData.students || [],
        createdBy: classData.createdBy || "",
        createdAt: new Date().toISOString(),
        isActive: true,
      });
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getClasses(schoolName) {
    var cacheKey = "classes_" + schoolName;
    var cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/classes")
        .once("value");
      const classes = snapshot.val();
      var result = classes
        ? Object.entries(classes).map(function (entry) {
            return Object.assign({ id: entry[0] }, entry[1]);
          })
        : [];
      CacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      return [];
    }
  },

  async deleteClass(schoolName, classId) {
    try {
      await database
        .ref("schools/" + schoolName + "/classes/" + classId)
        .remove();
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ FEES ============
  async saveFee(schoolName, feeData) {
    try {
      const balance = (feeData.amount || 0) - (feeData.paid || 0);

      if (feeData.id) {
        await database
          .ref("schools/" + schoolName + "/fees/" + feeData.id)
          .update({
            amount: feeData.amount || 0,
            paid: feeData.paid || 0,
            balance: balance,
            term: feeData.term || "Term 1",
            status: balance <= 0 ? "completed" : "partial",
          });
      } else {
        const feeRef = database.ref("schools/" + schoolName + "/fees").push();
        await feeRef.set({
          studentAdm: feeData.studentAdm,
          studentName: feeData.studentName,
          amount: feeData.amount || 0,
          paid: feeData.paid || 0,
          balance: balance,
          term: feeData.term || "Term 1",
          createdAt: new Date().toISOString(),
        });
      }
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getFees(schoolName) {
    var cacheKey = "fees_" + schoolName;
    var cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/fees")
        .once("value");
      const fees = snapshot.val();
      var result = fees
        ? Object.entries(fees).map(function (entry) {
            return Object.assign({ id: entry[0] }, entry[1]);
          })
        : [];
      CacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      return [];
    }
  },

  async deleteFee(schoolName, feeId) {
    try {
      await database.ref("schools/" + schoolName + "/fees/" + feeId).remove();
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ FURNITURE ============
  async allocateFurniture(schoolName, furnitureData) {
    try {
      const furnitureRef = database
        .ref("schools/" + schoolName + "/furniture")
        .push();
      await furnitureRef.set({
        studentName: furnitureData.studentName,
        adm: furnitureData.adm,
        form: furnitureData.form || "",
        chairNo: furnitureData.chairNo,
        lockerNo: furnitureData.lockerNo || "",
        allocationDate: furnitureData.allocationDate,
        issuedBy: furnitureData.issuedBy || "",
        createdAt: new Date().toISOString(),
      });
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getFurniture(schoolName) {
    var cacheKey = "furniture_" + schoolName;
    var cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/furniture")
        .once("value");
      const furniture = snapshot.val();
      var result = furniture
        ? Object.entries(furniture).map(function (entry) {
            return Object.assign({ id: entry[0] }, entry[1]);
          })
        : [];
      CacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      return [];
    }
  },

  async returnFurniture(schoolName, furnitureId) {
    try {
      await database
        .ref("schools/" + schoolName + "/furniture/" + furnitureId)
        .remove();
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ TEACHERS ============
  async getTeachers(schoolName) {
    var cacheKey = "teachers_" + schoolName;
    var cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/teachers")
        .once("value");
      const teachers = snapshot.val();
      var result = teachers
        ? Object.entries(teachers).map(function (entry) {
            return Object.assign({ id: entry[0] }, entry[1]);
          })
        : [];
      CacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      return [];
    }
  },

  async addTeacher(schoolName, teacherData) {
    try {
      const teacherRef = database
        .ref("schools/" + schoolName + "/teachers")
        .push();
      await teacherRef.set({
        name: teacherData.name,
        email: teacherData.email || "",
        phone: teacherData.phone || "",
        subjects: teacherData.subjects || "",
        classes: teacherData.classes || "",
        addedBy: teacherData.addedBy || "",
        createdAt: new Date().toISOString(),
      });
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteTeacher(schoolName, teacherId) {
    try {
      await database
        .ref("schools/" + schoolName + "/teachers/" + teacherId)
        .remove();
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ EVENTS ============
  async getEvents(schoolName) {
    var cacheKey = "events_" + schoolName;
    var cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/events")
        .once("value");
      const events = snapshot.val();
      var result = events
        ? Object.entries(events).map(function (entry) {
            return Object.assign({ id: entry[0] }, entry[1]);
          })
        : [];
      CacheManager.set(cacheKey, result);
      return result;
    } catch (error) {
      return [];
    }
  },

  async addEvent(schoolName, eventData) {
    try {
      const eventRef = database.ref("schools/" + schoolName + "/events").push();
      await eventRef.set({
        title: eventData.title,
        description: eventData.description || "",
        eventDate: eventData.eventDate,
        eventType: eventData.eventType || "Other",
        createdAt: new Date().toISOString(),
      });
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ CHAT ============
  async sendChatMessage(schoolName, messageData) {
    try {
      const msgRef = database.ref("schools/" + schoolName + "/chat").push();
      await msgRef.set({
        fromEmail: messageData.fromEmail,
        fromName: messageData.fromName,
        toEmail: messageData.toEmail,
        message: messageData.message,
        timestamp: new Date().toISOString(),
        readStatus: false,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getChatMessages(schoolName, userEmail, otherEmail) {
    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/chat")
        .once("value");
      const messages = snapshot.val();
      if (!messages) return [];

      if (otherEmail === userEmail) {
        return Object.values(messages).filter(function (msg) {
          return msg.toEmail === userEmail && !msg.readStatus;
        });
      }

      return Object.values(messages)
        .filter(function (msg) {
          return (
            (msg.fromEmail === userEmail && msg.toEmail === otherEmail) ||
            (msg.fromEmail === otherEmail && msg.toEmail === userEmail)
          );
        })
        .sort(function (a, b) {
          return new Date(a.timestamp) - new Date(b.timestamp);
        });
    } catch (error) {
      return [];
    }
  },

  // ============ AUDIT LOG ============
  async addAuditLog(schoolName, logData) {
    try {
      var importantActions = [
        "Book Added",
        "Book Issued",
        "Book Returned",
        "Student Added",
        "Student Deleted",
        "Class Added",
        "Class Deleted",
        "Teacher Added",
        "Teacher Deleted",
        "Furniture Allocated",
        "Furniture Returned",
        "Fee Recorded",
        "Fee Updated",
        "Fee Deleted",
        "User Added",
        "User Deactivated",
        "User Promoted",
        "School Created",
        "School Info Updated",
        "Settings Updated",
        "Bulk Book Issue",
        "Bulk Furniture Allocation",
        "QR Code Generated",
        "QR Code Assigned",
        "QR Code Returned",
        "Event Added",
        "Term Added",
        "Timetable Added",
        "Note Saved",
      ];

      if (importantActions.indexOf(logData.action) === -1) {
        return { success: true, skipped: true };
      }

      const logRef = database.ref("schools/" + schoolName + "/auditLog").push();
      await logRef.set({
        timestamp: new Date().toISOString(),
        user: logData.user || "System",
        action: logData.action,
        details: logData.details || "",
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getAuditLog(schoolName) {
    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/auditLog")
        .once("value");
      const logs = snapshot.val();
      if (!logs) return [];
      return Object.values(logs).reverse().slice(0, 100);
    } catch (error) {
      return [];
    }
  },

  // ============ SETTINGS ============
  async getSettings(schoolName) {
    try {
      const snapshot = await database
        .ref("schools/" + schoolName + "/settings")
        .once("value");
      return snapshot.val();
    } catch (error) {
      return null;
    }
  },

  async updateSettings(schoolName, settingsData) {
    try {
      await database
        .ref("schools/" + schoolName + "/settings")
        .update(settingsData);
      CacheManager.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

window.API = API;
window.CacheManager = CacheManager;
window.generateInviteCode = generateInviteCode;
window.generateStaffId = generateStaffId;
window.hashPassword = hashPassword;
