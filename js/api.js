// ============================================
// SRMS - Firebase API (Complete Working Version)
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

if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

var database = firebase.database();

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

// Generate a unique student QR code
function generateStudentQRCode(schoolName, adm, studentName) {
  var namePart = studentName
    .split(" ")
    .map(function (w) {
      return w.charAt(0);
    })
    .join("")
    .toUpperCase();
  var schoolPart = schoolName
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  var randomPart = Math.floor(1000 + Math.random() * 9000);
  return "SRMS-" + schoolPart + "-" + adm + "-" + namePart + "-" + randomPart;
}

// Generate a deep link URL for the student
function generateStudentDeepLink(schoolName, adm) {
  return (
    "https://srms-fd318.web.app/student.html?school=" +
    encodeURIComponent(schoolName) +
    "&adm=" +
    encodeURIComponent(adm)
  );
}

// ============ API OBJECT ============
var API = {
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
        return { success: false, error: error.message };
      });
  },

  createSchool: function (schoolData) {
    var inviteCode = generateInviteCode();
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
        return { success: true, inviteCode: inviteCode };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getSchool: function (schoolName) {
    return database
      .ref("schools/" + schoolName)
      .once("value")
      .then(function (snapshot) {
        return snapshot.val() || null;
      })
      .catch(function () {
        return null;
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
            password: hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            isActive: true,
          });
      })
      .then(function () {
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getUsers: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/users")
      .once("value")
      .then(function (snapshot) {
        var users = snapshot.val();
        if (!users) return [];
        var result = [];
        Object.keys(users).forEach(function (key) {
          result.push(Object.assign({ id: key }, users[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
      });
  },

  // ============ STUDENTS ============
  addStudent: function (schoolName, studentData) {
    var adm = studentData.adm;

    // Generate unique QR code for student
    var qrCode = generateStudentQRCode(schoolName, adm, studentData.name);
    var deepLink = generateStudentDeepLink(schoolName, adm);

    return database
      .ref("schools/" + schoolName + "/students/" + adm)
      .once("value")
      .then(function (snapshot) {
        if (snapshot.exists()) {
          return {
            success: false,
            error: "Student with this ADM already exists",
          };
        }

        return database.ref("schools/" + schoolName + "/students/" + adm).set({
          name: studentData.name,
          adm: adm,
          form: studentData.form || "",
          stream: studentData.stream || "",
          gender: studentData.gender || "",
          dob: studentData.dob || "",
          parentName: studentData.parentName || "",
          parentPhone: studentData.parentPhone || "",
          parentEmail: studentData.parentEmail || "",
          address: studentData.address || "",
          qrCode: qrCode,
          deepLink: deepLink,
          photoUrl: studentData.photoUrl || "",
          addedBy: studentData.addedBy || "",
          addedAt: new Date().toISOString(),
        });
      })
      .then(function () {
        // Also save QR code record
        return database
          .ref("schools/" + schoolName + "/qrcodes")
          .push()
          .set({
            code: qrCode,
            type: "student",
            assigned: true,
            assignedTo: studentData.name,
            adm: adm,
            className: studentData.form || "",
            stream: studentData.stream || "",
            deepLink: deepLink,
            returned: false,
            createdAt: new Date().toISOString(),
          });
      })
      .then(function () {
        return { success: true, qrCode: qrCode, deepLink: deepLink };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getStudents: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/students")
      .once("value")
      .then(function (snapshot) {
        var students = snapshot.val();
        if (!students) return [];
        var result = [];
        Object.keys(students).forEach(function (key) {
          result.push(Object.assign({ adm: key }, students[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
      });
  },

  // Get complete student details including borrowed books, furniture, fees
  getStudentCompleteDetails: function (schoolName, adm) {
    var studentData = null;
    var borrowedBooks = [];
    var furniture = [];
    var fees = [];

    return database
      .ref("schools/" + schoolName + "/students/" + adm)
      .once("value")
      .then(function (snapshot) {
        studentData = snapshot.val();
        if (!studentData) return null;
        return database
          .ref("schools/" + schoolName + "/borrowed")
          .once("value");
      })
      .then(function (snapshot) {
        if (!snapshot) return null;
        var borrowed = snapshot.val();
        if (borrowed) {
          Object.keys(borrowed).forEach(function (key) {
            if (borrowed[key].adm === adm) {
              borrowedBooks.push(Object.assign({ id: key }, borrowed[key]));
            }
          });
        }
        return database
          .ref("schools/" + schoolName + "/furniture")
          .once("value");
      })
      .then(function (snapshot) {
        if (!snapshot) return null;
        var furn = snapshot.val();
        if (furn) {
          Object.keys(furn).forEach(function (key) {
            if (furn[key].adm === adm) {
              furniture.push(Object.assign({ id: key }, furn[key]));
            }
          });
        }
        return database.ref("schools/" + schoolName + "/fees").once("value");
      })
      .then(function (snapshot) {
        if (snapshot) {
          var feeData = snapshot.val();
          if (feeData) {
            Object.keys(feeData).forEach(function (key) {
              if (feeData[key].studentAdm === adm) {
                fees.push(Object.assign({ id: key }, feeData[key]));
              }
            });
          }
        }

        return {
          student: studentData,
          borrowedBooks: borrowedBooks,
          furniture: furniture,
          fees: fees,
        };
      })
      .catch(function (error) {
        console.error("Get student details error:", error);
        return null;
      });
  },

  // Get student by QR code
  getStudentByQRCode: function (schoolName, qrCode) {
    return database
      .ref("schools/" + schoolName + "/students")
      .once("value")
      .then(function (snapshot) {
        var students = snapshot.val();
        if (!students) return { success: false, error: "No students found" };

        var foundStudent = null;
        var foundAdm = null;
        Object.keys(students).forEach(function (adm) {
          if (students[adm].qrCode === qrCode) {
            foundStudent = students[adm];
            foundAdm = adm;
          }
        });

        if (!foundStudent) {
          return { success: false, error: "QR code not found in database" };
        }

        return { success: true, student: foundStudent, adm: foundAdm };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  deleteStudent: function (schoolName, adm) {
    return database
      .ref("schools/" + schoolName + "/students/" + adm)
      .remove()
      .then(function () {
        // Also remove associated QR codes
        return database.ref("schools/" + schoolName + "/qrcodes").once("value");
      })
      .then(function (snapshot) {
        var qrcodes = snapshot.val();
        var promises = [];
        if (qrcodes) {
          Object.keys(qrcodes).forEach(function (key) {
            if (qrcodes[key].adm === adm && qrcodes[key].type === "student") {
              promises.push(
                database
                  .ref("schools/" + schoolName + "/qrcodes/" + key)
                  .remove(),
              );
            }
          });
        }
        return Promise.all(promises);
      })
      .then(function () {
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
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getBooks: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/books")
      .once("value")
      .then(function (snapshot) {
        var books = snapshot.val();
        if (!books) return [];
        var result = [];
        Object.keys(books).forEach(function (key) {
          result.push(Object.assign({ id: key }, books[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
      });
  },

  // ============ BORROWING ============
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
        borrowDate: borrowData.borrowDate,
        returnDate: borrowData.returnDate,
        returned: false,
        issuedBy: borrowData.issuedBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getBorrowed: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/borrowed")
      .once("value")
      .then(function (snapshot) {
        var borrowed = snapshot.val();
        if (!borrowed) return [];
        var result = [];
        Object.keys(borrowed).forEach(function (key) {
          result.push(Object.assign({ id: key }, borrowed[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
      });
  },

  returnBook: function (schoolName, borrowId) {
    return database
      .ref("schools/" + schoolName + "/borrowed/" + borrowId)
      .remove()
      .then(function () {
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ FURNITURE ============
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
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getFurniture: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/furniture")
      .once("value")
      .then(function (snapshot) {
        var furniture = snapshot.val();
        if (!furniture) return [];
        var result = [];
        Object.keys(furniture).forEach(function (key) {
          result.push(Object.assign({ id: key }, furniture[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
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
          lastPaymentDate: new Date().toISOString().split("T")[0],
          status: balance <= 0 ? "completed" : "partial",
        })
        .then(function () {
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
          return { success: true };
        })
        .catch(function (error) {
          return { success: false, error: error.message };
        });
    }
  },

  getFees: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/fees")
      .once("value")
      .then(function (snapshot) {
        var fees = snapshot.val();
        if (!fees) return [];
        var result = [];
        Object.keys(fees).forEach(function (key) {
          result.push(Object.assign({ id: key }, fees[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
      });
  },

  // ============ CLASSES ============
  addClass: function (schoolName, classData) {
    var classRef = database.ref("schools/" + schoolName + "/classes").push();
    var classKey = classRef.key;

    return classRef
      .set({
        name: classData.name,
        stream: classData.stream || "",
        teacher: classData.teacher || "",
        students: classData.students || [],
        createdBy: classData.createdBy || "",
        createdAt: new Date().toISOString(),
        isActive: true,
      })
      .then(function () {
        var students = classData.students || [];
        var promises = [];
        for (var i = 0; i < students.length; i++) {
          var student = students[i];
          var adm = student.ADM || student.adm || student["ADM No"] || "";
          var name =
            student.Name || student.name || student["Full Name"] || "Unknown";
          if (adm) {
            // Generate QR code for each student
            var qrCode = generateStudentQRCode(schoolName, adm, name);
            var deepLink = generateStudentDeepLink(schoolName, adm);

            promises.push(
              database.ref("schools/" + schoolName + "/students/" + adm).set({
                name: name,
                adm: adm,
                form: classData.name,
                stream: classData.stream || "",
                gender: student.Gender || student.gender || "",
                dob: student.DOB || student.dob || "",
                parentName: student["Parent Name"] || "",
                parentPhone: student["Parent Phone"] || "",
                parentEmail: student["Parent Email"] || "",
                qrCode: qrCode,
                deepLink: deepLink,
                addedBy: classData.createdBy || "",
                addedAt: new Date().toISOString(),
              }),
            );

            // Save QR code record
            promises.push(
              database
                .ref("schools/" + schoolName + "/qrcodes")
                .push()
                .set({
                  code: qrCode,
                  type: "student",
                  assigned: true,
                  assignedTo: name,
                  adm: adm,
                  className: classData.name,
                  stream: classData.stream || "",
                  deepLink: deepLink,
                  returned: false,
                  createdAt: new Date().toISOString(),
                }),
            );
          }
        }
        return Promise.all(promises);
      })
      .then(function () {
        return { success: true, classId: classKey };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getClasses: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/classes")
      .once("value")
      .then(function (snapshot) {
        var classes = snapshot.val();
        if (!classes) return [];
        var result = [];
        Object.keys(classes).forEach(function (key) {
          result.push(Object.assign({ id: key }, classes[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
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
        addedBy: teacherData.addedBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getTeachers: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/teachers")
      .once("value")
      .then(function (snapshot) {
        var teachers = snapshot.val();
        if (!teachers) return [];
        var result = [];
        Object.keys(teachers).forEach(function (key) {
          result.push(Object.assign({ id: key }, teachers[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
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
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getEvents: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/events")
      .once("value")
      .then(function (snapshot) {
        var events = snapshot.val();
        if (!events) return [];
        var result = [];
        Object.keys(events).forEach(function (key) {
          result.push(Object.assign({ id: key }, events[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
      });
  },

  // ============ TIMETABLE ============
  addTimetableEntry: function (schoolName, entryData) {
    var entryRef = database
      .ref(
        "schools/" + schoolName + "/timetable/classes/" + entryData.className,
      )
      .push();
    return entryRef
      .set({
        day: entryData.day,
        period: entryData.period,
        subject: entryData.subject,
        teacher: entryData.teacher || "",
        room: entryData.room || "",
        createdBy: entryData.createdBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getTimetable: function (schoolName) {
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
      })
      .catch(function () {
        return [];
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
        createdBy: termData.createdBy || "",
        createdAt: new Date().toISOString(),
      })
      .then(function () {
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getTerms: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/terms")
      .once("value")
      .then(function (snapshot) {
        var terms = snapshot.val();
        if (!terms) return [];
        var result = [];
        Object.keys(terms).forEach(function (key) {
          result.push(Object.assign({ id: key }, terms[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
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
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  getChatMessages: function (schoolName, userEmail, otherEmail) {
    return database
      .ref("schools/" + schoolName + "/chat")
      .once("value")
      .then(function (snapshot) {
        var messages = snapshot.val();
        if (!messages) return [];
        var result = [];
        Object.keys(messages).forEach(function (key) {
          result.push(Object.assign({ id: key }, messages[key]));
        });
        return result
          .filter(function (msg) {
            return (
              (msg.fromEmail === userEmail && msg.toEmail === otherEmail) ||
              (msg.fromEmail === otherEmail && msg.toEmail === userEmail)
            );
          })
          .sort(function (a, b) {
            return new Date(a.timestamp) - new Date(b.timestamp);
          });
      })
      .catch(function () {
        return [];
      });
  },

  // ============ NOTEPAD ============
  saveNote: function (schoolName, noteData) {
    if (noteData.noteId) {
      return database
        .ref("schools/" + schoolName + "/notes/" + noteData.noteId)
        .update({
          title: noteData.title,
          content: noteData.content,
          updatedAt: new Date().toISOString(),
        })
        .then(function () {
          return { success: true };
        })
        .catch(function (error) {
          return { success: false, error: error.message };
        });
    } else {
      var noteRef = database.ref("schools/" + schoolName + "/notes").push();
      return noteRef
        .set({
          author: noteData.author,
          authorEmail: noteData.authorEmail,
          title: noteData.title || "Untitled",
          content: noteData.content,
          timestamp: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPrivate: true,
          isDeleted: false,
        })
        .then(function () {
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
      .then(function (snapshot) {
        var notes = snapshot.val();
        if (!notes) return [];
        var result = [];
        Object.keys(notes).forEach(function (key) {
          result.push(Object.assign({ id: key }, notes[key]));
        });
        return result.filter(function (note) {
          return !note.isDeleted && note.authorEmail === userEmail;
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
      .then(function (snapshot) {
        var logs = snapshot.val();
        if (!logs) return [];
        var result = [];
        Object.keys(logs).forEach(function (key) {
          result.push(Object.assign({ id: key }, logs[key]));
        });
        return result.reverse().slice(0, 200);
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
        return { success: true };
      })
      .catch(function (error) {
        return { success: false, error: error.message };
      });
  },

  // ============ QR CODES ============
  getQRCodes: function (schoolName) {
    return database
      .ref("schools/" + schoolName + "/qrcodes")
      .once("value")
      .then(function (snapshot) {
        var codes = snapshot.val();
        if (!codes) return [];
        var result = [];
        Object.keys(codes).forEach(function (key) {
          result.push(Object.assign({ id: key }, codes[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
      });
  },

  // ============ DATABASE MANAGER ============
  getTableData: function (schoolName, tableName) {
    return database
      .ref("schools/" + schoolName + "/" + tableName)
      .once("value")
      .then(function (snapshot) {
        var data = snapshot.val();
        if (!data) return [];
        var result = [];
        Object.keys(data).forEach(function (key) {
          result.push(Object.assign({ id: key }, data[key]));
        });
        return result;
      })
      .catch(function () {
        return [];
      });
  },
};

window.API = API;
window.generateStudentQRCode = generateStudentQRCode;
window.generateStudentDeepLink = generateStudentDeepLink;
