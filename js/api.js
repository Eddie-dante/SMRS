// ============================================
// SRMS - Complete Firebase API
// All Database Operations - Error Free
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyACefHWvbETo2siNZy4ETCWZVTwIrtaNMs",
    authDomain: "srms-fd318.firebaseapp.com",
    databaseURL: "https://srms-fd318-default-rtdb.firebaseio.com",
    projectId: "srms-fd318",
    storageBucket: "srms-fd318.firebasestorage.app",
    messagingSenderId: "828888967437",
    appId: "1:828888967437:web:90461f6b1bc79854ea6844"
};

// Initialize Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

// ============ HELPER FUNCTIONS ============
function generateInviteCode(length) {
    length = length || 8;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generateStaffId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'STAFF-';
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// ============ API OBJECT ============
const API = {
    // ============ SCHOOL OPERATIONS ============
    async getSchool(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName).once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error getting school:', error);
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
                finePerDay: 10,
                maintenanceMode: false
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
            console.error('Error creating school:', error);
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
            console.error('Login error:', error);
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
                lastLogin: null,
                isActive: true
            });
            return { success: true };
        } catch (error) {
            console.error('Create user error:', error);
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
            console.error('Get users error:', error);
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
                isbn: bookData.isbn || '',
                type: bookData.type || 'Textbook',
                subject: bookData.subject || '',
                quantity: bookData.quantity || 1,
                available: bookData.quantity || 1,
                location: bookData.location || '',
                createdBy: bookData.createdBy || '',
                createdAt: new Date().toISOString()
            });
            return { success: true, bookId: bookRef.key };
        } catch (error) {
            console.error('Add book error:', error);
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
            console.error('Get books error:', error);
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
    
    // ============ BORROWING OPERATIONS ============
    async issueBook(schoolName, borrowData) {
        try {
            const borrowRef = database.ref('schools/' + schoolName + '/borrowed').push();
            await borrowRef.set({
                studentName: borrowData.studentName,
                adm: borrowData.adm,
                form: borrowData.form || '',
                stream: borrowData.stream || '',
                gender: borrowData.gender || '',
                bookTitle: borrowData.bookTitle,
                bookNo: borrowData.bookNo,
                borrowDate: borrowData.borrowDate,
                returnDate: borrowData.returnDate,
                returned: false,
                actualReturnDate: null,
                issuedBy: borrowData.issuedBy || '',
                issuedByEmail: borrowData.issuedByEmail || '',
                academicYear: borrowData.academicYear || new Date().getFullYear(),
                term: borrowData.term || 'Term 1',
                status: 'active',
                createdAt: new Date().toISOString()
            });
            return { success: true, borrowId: borrowRef.key };
        } catch (error) {
            console.error('Issue book error:', error);
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
            console.error('Get borrowed error:', error);
            return [];
        }
    },
    
    async returnBook(schoolName, borrowId) {
        try {
            await database.ref('schools/' + schoolName + '/borrowed/' + borrowId).update({
                returned: true,
                actualReturnDate: new Date().toISOString().split('T')[0],
                status: 'returned'
            });
            return { success: true };
        } catch (error) {
            console.error('Return book error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // ============ STUDENT OPERATIONS ============
    async addStudent(schoolName, studentData) {
        try {
            await database.ref('schools/' + schoolName + '/students/' + studentData.adm).set({
                name: studentData.name,
                adm: studentData.adm,
                form: studentData.form || '',
                stream: studentData.stream || '',
                gender: studentData.gender || '',
                dob: studentData.dob || '',
                parentName: studentData.parentName || '',
                parentPhone: studentData.parentPhone || '',
                parentEmail: studentData.parentEmail || '',
                parentOccupation: studentData.parentOccupation || '',
                address: studentData.address || '',
                city: studentData.city || '',
                postalCode: studentData.postalCode || '',
                medicalInfo: studentData.medicalInfo || '',
                enrollmentDate: studentData.enrollmentDate || new Date().toISOString().split('T')[0],
                previousSchool: studentData.previousSchool || '',
                religion: studentData.religion || '',
                nationality: studentData.nationality || '',
                kcpeMarks: studentData.kcpeMarks || '',
                specialNeeds: studentData.specialNeeds || '',
                emergencyContact: studentData.emergencyContact || '',
                emergencyPhone: studentData.emergencyPhone || '',
                addedBy: studentData.addedBy || '',
                addedAt: new Date().toISOString(),
                isActive: true
            });
            return { success: true };
        } catch (error) {
            console.error('Add student error:', error);
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
            console.error('Get students error:', error);
            return [];
        }
    },
    
    async updateStudent(schoolName, adm, studentData) {
        try {
            await database.ref('schools/' + schoolName + '/students/' + adm).update(studentData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
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
    
    // ============ FURNITURE OPERATIONS ============
    async allocateFurniture(schoolName, furnitureData) {
        try {
            const furnitureRef = database.ref('schools/' + schoolName + '/furniture').push();
            await furnitureRef.set({
                studentName: furnitureData.studentName,
                adm: furnitureData.adm,
                form: furnitureData.form || '',
                stream: furnitureData.stream || '',
                gender: furnitureData.gender || '',
                chairNo: furnitureData.chairNo,
                lockerNo: furnitureData.lockerNo || '',
                allocationDate: furnitureData.allocationDate,
                returned: false,
                returnDate: null,
                issuedBy: furnitureData.issuedBy || '',
                issuedByEmail: furnitureData.issuedByEmail || '',
                academicYear: furnitureData.academicYear || new Date().getFullYear(),
                term: furnitureData.term || 'Term 1',
                createdAt: new Date().toISOString()
            });
            return { success: true, furnitureId: furnitureRef.key };
        } catch (error) {
            console.error('Allocate furniture error:', error);
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
            console.error('Get furniture error:', error);
            return [];
        }
    },
    
    async returnFurniture(schoolName, furnitureId) {
        try {
            await database.ref('schools/' + schoolName + '/furniture/' + furnitureId).update({
                returned: true,
                returnDate: new Date().toISOString().split('T')[0]
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // ============ TEACHER OPERATIONS ============
    async addTeacher(schoolName, teacherData) {
        try {
            const teacherRef = database.ref('schools/' + schoolName + '/teachers').push();
            await teacherRef.set({
                name: teacherData.name,
                email: teacherData.email || '',
                phone: teacherData.phone || '',
                subjects: teacherData.subjects || '',
                classes: teacherData.classes || '',
                duty: teacherData.duty || '',
                tscNo: teacherData.tscNo || '',
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
    
    // ============ TERMS OPERATIONS ============
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
    
    // ============ CHAT OPERATIONS ============
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
    
    // ============ FORUM OPERATIONS ============
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
    
    // ============ NOTEPAD OPERATIONS ============
    async saveNote(schoolName, noteData) {
        try {
            const noteRef = database.ref('schools/' + schoolName + '/notes').push();
            await noteRef.set({
                author: noteData.author,
                authorEmail: noteData.authorEmail,
                title: noteData.title || 'Untitled',
                content: noteData.content,
                timestamp: new Date().toISOString(),
                isPrivate: noteData.isPrivate !== false,
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
            return Object.values(notes).filter(function(note) {
                return !note.isDeleted && (note.authorEmail === userEmail || !note.isPrivate);
            });
        } catch (error) {
            return [];
        }
    },
    
    // ============ EVENTS OPERATIONS ============
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
    
    // ============ FEES OPERATIONS ============
    async saveFee(schoolName, feeData) {
        try {
            const feeRef = database.ref('schools/' + schoolName + '/fees').push();
            const balance = (feeData.amount || 0) - (feeData.paid || 0);
            await feeRef.set({
                studentAdm: feeData.studentAdm,
                studentName: feeData.studentName,
                form: feeData.form || '',
                amount: feeData.amount || 0,
                paid: feeData.paid || 0,
                balance: balance,
                term: feeData.term || 'Term 1',
                lastPaymentDate: feeData.lastPaymentDate || new Date().toISOString().split('T')[0],
                status: balance <= 0 ? 'completed' : 'partial',
                createdAt: new Date().toISOString()
            });
            return { success: true };
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
    
    // ============ TIMETABLE OPERATIONS ============
    async addTimetableEntry(schoolName, entryData) {
        try {
            const entryRef = database.ref('schools/' + schoolName + '/timetable').push();
            await entryRef.set({
                className: entryData.className,
                day: entryData.day,
                period: entryData.period,
                subject: entryData.subject,
                teacher: entryData.teacher || '',
                room: entryData.room || '',
                createdBy: entryData.createdBy || '',
                createdAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    async getTimetable(schoolName) {
        try {
            const snapshot = await database.ref('schools/' + schoolName + '/timetable').once('value');
            const timetable = snapshot.val();
            if (!timetable) return [];
            return Object.values(timetable);
        } catch (error) {
            return [];
        }
    },
    
    // ============ AUDIT LOG OPERATIONS ============
    async addAuditLog(schoolName, logData) {
        try {
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
    
    // ============ SETTINGS OPERATIONS ============
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

// Export to window
window.API = API;
window.generateInviteCode = generateInviteCode;
window.generateStaffId = generateStaffId;
window.hashPassword = hashPassword;