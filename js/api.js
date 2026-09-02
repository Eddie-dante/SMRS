// ============================================
// SRMS - Complete Firebase API
// With QR Scanning, Class Storage, Fee Editing, Timetable
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyACefHWvbETo2siNZy4ETCWZVTwIrtaNMs",
    authDomain: "srms-fd318.firebaseapp.com",
    databaseURL: "https://srms-fd318-default-rtdb.firebaseio.com",
    projectId: "srms-fd318",
    storageBucket: "srms-fd318.firebasestorage.app",
    messagingSenderId: "828888967437",
    appId: "1:828888967437:web:90461f6b1bc79854ea6844"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

function generateInviteCode(length) {
    length = length || 8;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var code = '';
    for (var i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generateStaffId() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var id = 'STAFF-';
    for (var i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function hashPassword(password) {
    var hash = 0;
    for (var i = 0; i < password.length; i++) {
        var char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Generate unique QR code
function generateUniqueQRCode(type, usedCodes) {
    var code = '';
    var unique = false;
    var attempts = 0;
    
    while (!unique && attempts < 100) {
        var number = Math.floor(10000 + Math.random() * 90000);
        code = type.toUpperCase() + '-' + number;
        
        if (!usedCodes[code]) {
            unique = true;
            usedCodes[code] = true;
        }
        attempts++;
    }
    
    return code;
}

const API = {
    // ============ SCHOOL OPERATIONS ============
    async getSchool(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName).once('value');
            return snapshot.val();
        } catch (error) {
            return null;
        }
    },
    
    async createSchool(schoolData) {
        try {
            const inviteCode = generateInviteCode();
            const emailKey = schoolData.adminEmail.replace(/\./g, ',');
            
            await database.ref('schools/' + schoolData.name).set({
                name: schoolData.name,
                address: schoolData.address || '',
                adminName: schoolData.adminName,
                adminEmail: schoolData.adminEmail,
                adminPhone: schoolData.adminPhone || '',
                inviteCode: inviteCode,
                motto: schoolData.motto || '',
                createdAt: new Date().toISOString(),
                isActive: true
            });
            
            await database.ref('schools/' + schoolData.name + '/settings').set({
                maxBorrowDays: 14,
                maxBooksPerStudent: 3,
                finePerDay: 10
            });
            
            await database.ref('schools/' + schoolData.name + '/users/' + emailKey).set({
                name: schoolData.adminName,
                email: schoolData.adminEmail,
                role: 'admin',
                staffId: 'ADMIN-001',
                password: hashPassword(schoolData.password || 'admin123'),
                createdAt: new Date().toISOString(),
                isActive: true
            });
            
            return { success: true, inviteCode: inviteCode };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async updateSchool(schoolName, schoolData) {
        try {
            await database.ref('schools/' + schoolName).update(schoolData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ USER OPERATIONS ============
    async login(schoolName, email, password) {
        try {
            const emailKey = email.replace(/\./g, ',');
            const snapshot = await database.ref('schools/' + schoolName + '/users/' + emailKey).once('value');
            const user = snapshot.val();
            
            if (user && user.password === hashPassword(password) && user.isActive !== false) {
                const sessionUser = {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    staffId: user.staffId
                };
                localStorage.setItem('srms_user', JSON.stringify(sessionUser));
                localStorage.setItem('srms_school', schoolName);
                return { success: true, user: sessionUser };
            }
            return { success: false, error: 'Invalid credentials' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async createUser(schoolName, userData) {
        try {
            const emailKey = userData.email.replace(/\./g, ',');
            const snapshot = await database.ref('schools/' + schoolName + '/users/' + emailKey).once('value');
            if (snapshot.exists()) {
                return { success: false, error: 'User already exists' };
            }
            
            await database.ref('schools/' + schoolName + '/users/' + emailKey).set({
                name: userData.name,
                email: userData.email,
                role: userData.role || 'teacher',
                staffId: userData.staffId || generateStaffId(),
                phone: userData.phone || '',
                password: hashPassword(userData.password),
                createdAt: new Date().toISOString(),
                isActive: true
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getUsers(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/users').once('value');
            const users = snapshot.val();
            if (!users) return [];
            return Object.entries(users).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    async updateUser(schoolName, email, userData) {
        try {
            const emailKey = email.replace(/\./g, ',');
            await database.ref('schools/' + schoolName + '/users/' + emailKey).update(userData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async deleteUser(schoolName, email) {
        try {
            const emailKey = email.replace(/\./g, ',');
            await database.ref('schools/' + schoolName + '/users/' + emailKey).update({ isActive: false });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ BOOK OPERATIONS ============
    async addBook(schoolName, bookData) {
        try {
            const bookRef = database.ref('schools/' + schoolName + '/books').push();
            await bookRef.set({
                title: bookData.title,
                author: bookData.author || '',
                type: bookData.type || 'Textbook',
                subject: bookData.subject || '',
                quantity: bookData.quantity || 1,
                available: bookData.quantity || 1,
                createdBy: bookData.createdBy || '',
                createdAt: new Date().toISOString()
            });
            return { success: true, bookId: bookRef.key };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getBooks(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/books').once('value');
            const books = snapshot.val();
            if (!books) return [];
            return Object.entries(books).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    async updateBook(schoolName, bookId, bookData) {
        try {
            await database.ref('schools/' + schoolName + '/books/' + bookId).update(bookData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async deleteBook(schoolName, bookId) {
        try {
            await database.ref('schools/' + schoolName + '/books/' + bookId).remove();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ QR CODE OPERATIONS ============
    async generateQRCodes(schoolName, type, start, end) {
        try {
            const qrRef = database.ref('schools/' + schoolName + '/qrcodes');
            const snapshot = await qrRef.once('value');
            const existingCodes = snapshot.val() || {};
            const usedCodes = {};
            
            // Build used codes map
            Object.values(existingCodes).forEach(function(qr) {
                usedCodes[qr.code] = true;
            });
            
            var generated = [];
            for (var i = start; i <= end; i++) {
                var code = generateUniqueQRCode(type, usedCodes);
                var newQRRef = qrRef.push();
                await newQRRef.set({
                    code: code,
                    type: type,
                    assigned: false,
                    assignedTo: null,
                    assignedAt: null,
                    returned: false,
                    createdAt: new Date().toISOString()
                });
                generated.push(code);
            }
            
            return { success: true, codes: generated };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getQRCodes(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/qrcodes').once('value');
            const codes = snapshot.val();
            if (!codes) return [];
            return Object.entries(codes).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    async scanQRCode(schoolName, code) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/qrcodes').once('value');
            const codes = snapshot.val();
            if (!codes) return { success: false, error: 'Code not found' };
            
            var foundQR = null;
            var foundId = null;
            Object.entries(codes).forEach(function(entry) {
                if (entry[1].code === code) {
                    foundQR = entry[1];
                    foundId = entry[0];
                }
            });
            
            if (!foundQR) {
                return { success: false, error: 'Code not found in database' };
            }
            
            if (foundQR.assigned && !foundQR.returned) {
                return { 
                    success: true, 
                    status: 'assigned', 
                    qr: foundQR, 
                    id: foundId 
                };
            }
            
            if (foundQR.returned) {
                return { 
                    success: true, 
                    status: 'available', 
                    qr: foundQR, 
                    id: foundId 
                };
            }
            
            return { 
                success: true, 
                status: 'available', 
                qr: foundQR, 
                id: foundId 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async assignQRCode(schoolName, qrId, assignmentData) {
        try {
            await database.ref('schools/' + schoolName + '/qrcodes/' + qrId).update({
                assigned: true,
                assignedTo: assignmentData.studentName,
                studentName: assignmentData.studentName,
                className: assignmentData.className || '',
                stream: assignmentData.stream || '',
                adm: assignmentData.adm || '',
                assignedAt: new Date().toISOString(),
                returned: false
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async returnQRCode(schoolName, qrId) {
        try {
            await database.ref('schools/' + schoolName + '/qrcodes/' + qrId).update({
                returned: true,
                returnedAt: new Date().toISOString(),
                assigned: false,
                assignedTo: null,
                studentName: null,
                className: null,
                stream: null,
                adm: null
            });
            
            // Also delete any borrow records associated with this QR
            const borrowedSnapshot = await database.ref('schools/' + schoolName + '/borrowed').once('value');
            const borrowed = borrowedSnapshot.val();
            if (borrowed) {
                Object.entries(borrowed).forEach(async function(entry) {
                    if (entry[1].bookNo === qrId || entry[1].qrId === qrId) {
                        await database.ref('schools/' + schoolName + '/borrowed/' + entry[0]).remove();
                    }
                });
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ BORROWING OPERATIONS ============
    async issueBook(schoolName, borrowData) {
        try {
            const borrowRef = database.ref('schools/' + schoolName + '/borrowed').push();
            await borrowRef.set({
                studentName: borrowData.studentName,
                adm: borrowData.adm,
                form: borrowData.form || '',
                stream: borrowData.stream || '',
                bookTitle: borrowData.bookTitle,
                bookNo: borrowData.bookNo,
                qrId: borrowData.qrId || null,
                borrowDate: borrowData.borrowDate,
                returnDate: borrowData.returnDate,
                returned: false,
                issuedBy: borrowData.issuedBy || '',
                createdAt: new Date().toISOString()
            });
            return { success: true, borrowId: borrowRef.key };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getBorrowed(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/borrowed').once('value');
            const borrowed = snapshot.val();
            if (!borrowed) return [];
            return Object.entries(borrowed).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    async returnBook(schoolName, borrowId) {
        try {
            // Get the borrow record first
            const borrowSnapshot = await database.ref('schools/' + schoolName + '/borrowed/' + borrowId).once('value');
            const borrowRecord = borrowSnapshot.val();
            
            // If there's a QR code, mark it as returned
            if (borrowRecord && borrowRecord.qrId) {
                await this.returnQRCode(schoolName, borrowRecord.qrId);
            }
            
            // Delete the borrow record
            await database.ref('schools/' + schoolName + '/borrowed/' + borrowId).remove();
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ STUDENT OPERATIONS (Stored in Classes) ============
    async addStudent(schoolName, studentData) {
        try {
            await database.ref('schools/' + schoolName + '/students/' + studentData.adm).set({
                name: studentData.name,
                adm: studentData.adm,
                form: studentData.form || '',
                stream: studentData.stream || '',
                gender: studentData.gender || '',
                parentName: studentData.parentName || '',
                parentPhone: studentData.parentPhone || '',
                parentEmail: studentData.parentEmail || '',
                addedBy: studentData.addedBy || '',
                addedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getStudents(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/students').once('value');
            const students = snapshot.val();
            if (!students) return [];
            return Object.entries(students).map(function(entry) {
                return Object.assign({ adm: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    async deleteStudent(schoolName, adm) {
        try {
            await database.ref('schools/' + schoolName + '/students/' + adm).remove();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ CLASS OPERATIONS ============
    async addClass(schoolName, classData) {
        try {
            const classRef = database.ref('schools/' + schoolName + '/classes').push();
            await classRef.set({
                name: classData.name,
                stream: classData.stream || '',
                teacher: classData.teacher || '',
                students: classData.students || [],
                createdBy: classData.createdBy || '',
                createdAt: new Date().toISOString(),
                isActive: true
            });
            
            // Also add students to students table
            var students = classData.students || [];
            for (var i = 0; i < students.length; i++) {
                var student = students[i];
                var adm = student.ADM || student.adm || student['ADM No'] || '';
                var name = student.Name || student.name || student['Full Name'] || 'Unknown';
                
                if (adm) {
                    await database.ref('schools/' + schoolName + '/students/' + adm).set({
                        name: name,
                        adm: adm,
                        form: classData.name,
                        stream: classData.stream || '',
                        gender: student.Gender || student.gender || '',
                        parentName: student['Parent Name'] || student.parentName || '',
                        parentPhone: student['Parent Phone'] || student.parentPhone || '',
                        parentEmail: student['Parent Email'] || student.parentEmail || '',
                        addedBy: classData.createdBy || '',
                        addedAt: new Date().toISOString()
                    });
                }
            }
            
            return { success: true, classId: classRef.key };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getClasses(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/classes').once('value');
            const classes = snapshot.val();
            if (!classes) return [];
            return Object.entries(classes).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    async deleteClass(schoolName, classId) {
        try {
            // Delete the class
            await database.ref('schools/' + schoolName + '/classes/' + classId).remove();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ FEES OPERATIONS ============
    async saveFee(schoolName, feeData) {
        try {
            const balance = (feeData.amount || 0) - (feeData.paid || 0);
            
            if (feeData.id) {
                // Update existing fee
                await database.ref('schools/' + schoolName + '/fees/' + feeData.id).update({
                    amount: feeData.amount || 0,
                    paid: feeData.paid || 0,
                    balance: balance,
                    term: feeData.term || 'Term 1',
                    lastPaymentDate: new Date().toISOString().split('T')[0],
                    status: balance <= 0 ? 'completed' : 'partial'
                });
                return { success: true };
            } else {
                // Create new fee
                const feeRef = database.ref('schools/' + schoolName + '/fees').push();
                await feeRef.set({
                    studentAdm: feeData.studentAdm,
                    studentName: feeData.studentName,
                    amount: feeData.amount || 0,
                    paid: feeData.paid || 0,
                    balance: balance,
                    term: feeData.term || 'Term 1',
                    lastPaymentDate: new Date().toISOString().split('T')[0],
                    status: balance <= 0 ? 'completed' : 'partial',
                    createdAt: new Date().toISOString()
                });
                return { success: true };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getFees(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/fees').once('value');
            const fees = snapshot.val();
            if (!fees) return [];
            return Object.entries(fees).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    async deleteFee(schoolName, feeId) {
        try {
            await database.ref('schools/' + schoolName + '/fees/' + feeId).remove();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ TIMETABLE OPERATIONS (Per Class and Per Teacher) ============
    async addTimetableEntry(schoolName, entryData) {
        try {
            // Store per class
            const classEntryRef = database.ref('schools/' + schoolName + '/timetable/classes/' + entryData.className).push();
            await classEntryRef.set({
                day: entryData.day,
                period: entryData.period,
                subject: entryData.subject,
                teacher: entryData.teacher || '',
                room: entryData.room || '',
                createdBy: entryData.createdBy || '',
                createdAt: new Date().toISOString()
            });
            
            // Store per teacher
            if (entryData.teacher) {
                const teacherEntryRef = database.ref('schools/' + schoolName + '/timetable/teachers/' + entryData.teacher.replace(/\./g, ',')).push();
                await teacherEntryRef.set({
                    day: entryData.day,
                    period: entryData.period,
                    subject: entryData.subject,
                    className: entryData.className,
                    room: entryData.room || '',
                    createdAt: new Date().toISOString()
                });
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getTimetable(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/timetable/classes').once('value');
            const timetable = snapshot.val();
            if (!timetable) return [];
            
            var entries = [];
            Object.entries(timetable).forEach(function(classEntry) {
                var className = classEntry[0];
                Object.entries(classEntry[1]).forEach(function(entry) {
                    entries.push(Object.assign({ className: className }, entry[1]));
                });
            });
            
            return entries;
        } catch (error) {
            return [];
        }
    },
    
    async getTeacherTimetable(schoolName, teacherName) {
        try {
            const teacherKey = teacherName.replace(/\./g, ',');
            const snapshot = await database.ref('schools/' + schoolName + '/timetable/teachers/' + teacherKey).once('value');
            const timetable = snapshot.val();
            if (!timetable) return [];
            return Object.values(timetable);
        } catch (error) {
            return [];
        }
    },
    
    // ============ AUDIT LOG (Filtered) ============
    async addAuditLog(schoolName, logData) {
        try {
            // Only log important actions
            var importantActions = [
                'Book Added', 'Book Issued', 'Book Returned', 'Book Deleted',
                'Student Added', 'Student Deleted', 'Class Added', 'Class Deleted',
                'Teacher Added', 'Teacher Deleted', 'Furniture Allocated', 'Furniture Returned',
                'Fee Recorded', 'Fee Updated', 'Fee Deleted',
                'User Added', 'User Deactivated', 'User Promoted',
                'School Created', 'School Info Updated', 'Settings Updated',
                'Bulk Book Issue', 'Bulk Furniture Allocation',
                'QR Code Generated', 'QR Code Assigned', 'QR Code Returned',
                'Event Added', 'Term Added', 'Timetable Added', 'Note Saved'
            ];
            
            if (importantActions.indexOf(logData.action) === -1) {
                return { success: true, skipped: true };
            }
            
            const logRef = database.ref('schools/' + schoolName + '/auditLog').push();
            await logRef.set({
                timestamp: new Date().toISOString(),
                user: logData.user || 'System',
                userEmail: logData.userEmail || '',
                action: logData.action,
                details: logData.details || ''
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getAuditLog(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/auditLog').once('value');
            const logs = snapshot.val();
            if (!logs) return [];
            return Object.values(logs).reverse();
        } catch (error) {
            return [];
        }
    },
    
    // ============ SETTINGS ============
    async getSettings(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/settings').once('value');
            return snapshot.val();
        } catch (error) {
            return null;
        }
    },
    
    async updateSettings(schoolName, settingsData) {
        try {
            await database.ref('schools/' + schoolName + '/settings').update(settingsData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ CHAT ============
    async sendChatMessage(schoolName, messageData) {
        try {
            const msgRef = database.ref('schools/' + schoolName + '/chat').push();
            await msgRef.set({
                fromEmail: messageData.fromEmail,
                fromName: messageData.fromName,
                toEmail: messageData.toEmail,
                message: messageData.message,
                timestamp: new Date().toISOString(),
                readStatus: false
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getChatMessages(schoolName, userEmail, otherEmail) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/chat').once('value');
            const messages = snapshot.val();
            if (!messages) return [];
            
            if (otherEmail === userEmail) {
                return Object.values(messages).filter(function(msg) {
                    return msg.toEmail === userEmail && !msg.readStatus;
                });
            }
            
            return Object.values(messages).filter(function(msg) {
                return (msg.fromEmail === userEmail && msg.toEmail === otherEmail) ||
                       (msg.fromEmail === otherEmail && msg.toEmail === userEmail);
            }).sort(function(a, b) {
                return new Date(a.timestamp) - new Date(b.timestamp);
            });
        } catch (error) {
            return [];
        }
    },
    
    // ============ FORUM ============
    async postForumMessage(schoolName, messageData) {
        try {
            const msgRef = database.ref('schools/' + schoolName + '/forum').push();
            await msgRef.set({
                fromEmail: messageData.fromEmail,
                fromName: messageData.fromName,
                role: messageData.role || 'teacher',
                message: messageData.message,
                timestamp: new Date().toISOString(),
                isDeleted: false
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getForumMessages(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/forum').once('value');
            const messages = snapshot.val();
            if (!messages) return [];
            return Object.values(messages).filter(function(msg) {
                return !msg.isDeleted;
            });
        } catch (error) {
            return [];
        }
    },
    
    // ============ NOTEPAD ============
    async saveNote(schoolName, noteData) {
        try {
            const noteRef = database.ref('schools/' + schoolName + '/notes').push();
            await noteRef.set({
                author: noteData.author,
                authorEmail: noteData.authorEmail,
                title: noteData.title || 'Untitled',
                content: noteData.content,
                timestamp: new Date().toISOString(),
                isPrivate: true,
                isDeleted: false
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getNotes(schoolName, userEmail) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/notes').once('value');
            const notes = snapshot.val();
            if (!notes) return [];
            return Object.entries(notes).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            }).filter(function(note) {
                return !note.isDeleted && note.authorEmail === userEmail;
            });
        } catch (error) {
            return [];
        }
    },
    
    async deleteNote(schoolName, noteId) {
        try {
            await database.ref('schools/' + schoolName + '/notes/' + noteId).update({ isDeleted: true });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ EVENTS ============
    async addEvent(schoolName, eventData) {
        try {
            const eventRef = database.ref('schools/' + schoolName + '/events').push();
            await eventRef.set({
                title: eventData.title,
                description: eventData.description || '',
                eventDate: eventData.eventDate,
                eventType: eventData.eventType || 'Other',
                createdBy: eventData.createdBy || '',
                createdAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getEvents(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/events').once('value');
            const events = snapshot.val();
            if (!events) return [];
            return Object.entries(events).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    // ============ TEACHERS ============
    async addTeacher(schoolName, teacherData) {
        try {
            const teacherRef = database.ref('schools/' + schoolName + '/teachers').push();
            await teacherRef.set({
                name: teacherData.name,
                email: teacherData.email || '',
                phone: teacherData.phone || '',
                subjects: teacherData.subjects || '',
                classes: teacherData.classes || '',
                addedBy: teacherData.addedBy || '',
                isActive: true,
                createdAt: new Date().toISOString()
            });
            return { success: true, teacherId: teacherRef.key };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getTeachers(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/teachers').once('value');
            const teachers = snapshot.val();
            if (!teachers) return [];
            return Object.entries(teachers).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    async deleteTeacher(schoolName, teacherId) {
        try {
            await database.ref('schools/' + schoolName + '/teachers/' + teacherId).remove();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ TERMS ============
    async addTerm(schoolName, termData) {
        try {
            const termRef = database.ref('schools/' + schoolName + '/terms').push();
            await termRef.set({
                name: termData.name,
                startDate: termData.startDate,
                endDate: termData.endDate,
                isCurrent: termData.isCurrent || false,
                createdBy: termData.createdBy || '',
                createdAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getTerms(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/terms').once('value');
            const terms = snapshot.val();
            if (!terms) return [];
            return Object.entries(terms).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    // ============ FURNITURE ============
    async allocateFurniture(schoolName, furnitureData) {
        try {
            const furnitureRef = database.ref('schools/' + schoolName + '/furniture').push();
            await furnitureRef.set({
                studentName: furnitureData.studentName,
                adm: furnitureData.adm,
                form: furnitureData.form || '',
                stream: furnitureData.stream || '',
                chairNo: furnitureData.chairNo,
                lockerNo: furnitureData.lockerNo || '',
                allocationDate: furnitureData.allocationDate,
                returned: false,
                returnDate: null,
                issuedBy: furnitureData.issuedBy || '',
                createdAt: new Date().toISOString()
            });
            return { success: true, furnitureId: furnitureRef.key };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getFurniture(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/furniture').once('value');
            const furniture = snapshot.val();
            if (!furniture) return [];
            return Object.entries(furniture).map(function(entry) {
                return Object.assign({ id: entry[0] }, entry[1]);
            });
        } catch (error) {
            return [];
        }
    },
    
    async returnFurniture(schoolName, furnitureId) {
        try {
            await database.ref('schools/' + schoolName + '/furniture/' + furnitureId).remove();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ DATABASE MANAGER ============
    async getTableData(schoolName, tableName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/' + tableName).once('value');
            const data = snapshot.val();
            if (!data) return [];
            return Object.values(data);
        } catch (error) {
            return [];
        }
    },
    
    // ============ REAL-TIME LISTENERS ============
    onBooksChange(schoolName, callback) {
        database.ref('schools/' + schoolName + '/books').on('value', function(snapshot) {
            const books = snapshot.val();
            if (books) {
                callback(Object.entries(books).map(function(entry) {
                    return Object.assign({ id: entry[0] }, entry[1]);
                }));
            } else {
                callback([]);
            }
        });
    },
    
    onBorrowedChange(schoolName, callback) {
        database.ref('schools/' + schoolName + '/borrowed').on('value', function(snapshot) {
            const borrowed = snapshot.val();
            if (borrowed) {
                callback(Object.entries(borrowed).map(function(entry) {
                    return Object.assign({ id: entry[0] }, entry[1]);
                }));
            } else {
                callback([]);
            }
        });
    },
    
    onStudentsChange(schoolName, callback) {
        database.ref('schools/' + schoolName + '/students').on('value', function(snapshot) {
            const students = snapshot.val();
            if (students) {
                callback(Object.entries(students).map(function(entry) {
                    return Object.assign({ adm: entry[0] }, entry[1]);
                }));
            } else {
                callback([]);
            }
        });
    },
    
    onFurnitureChange(schoolName, callback) {
        database.ref('schools/' + schoolName + '/furniture').on('value', function(snapshot) {
            const furniture = snapshot.val();
            if (furniture) {
                callback(Object.entries(furniture).map(function(entry) {
                    return Object.assign({ id: entry[0] }, entry[1]);
                }));
            } else {
                callback([]);
            }
        });
    }
};

window.API = API;
window.generateInviteCode = generateInviteCode;
window.generateStaffId = generateStaffId;
window.hashPassword = hashPassword;
window.generateUniqueQRCode = generateUniqueQRCode;