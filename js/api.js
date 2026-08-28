// ============================================
// SRMS - Complete Firebase API
// All Database Operations
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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ============ API OBJECT ============
const API = {
    // ============ SCHOOL OPERATIONS ============
    async getSchool(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}`).once('value');
        return snapshot.val();
    },
    
    async createSchool(schoolData) {
        const inviteCode = generateInviteCode();
        await database.ref(`schools/${schoolData.name}`).set({
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
        
        // Initialize settings
        await database.ref(`schools/${schoolData.name}/settings`).set({
            maxBorrowDays: 14,
            maxBooksPerStudent: 3,
            finePerDay: 10,
            maintenanceMode: false
        });
        
        // Create admin user
        await database.ref(`schools/${schoolData.name}/users/${schoolData.adminEmail.replace(/\./g, ',')}`).set({
            name: schoolData.adminName,
            email: schoolData.adminEmail,
            role: 'admin',
            staffId: 'ADMIN-001',
            password: hashPassword(schoolData.password || 'admin123'),
            createdAt: new Date().toISOString(),
            isActive: true
        });
        
        return { success: true, inviteCode };
    },
    
    async updateSchool(schoolName, schoolData) {
        await database.ref(`schools/${schoolName}`).update(schoolData);
        return { success: true };
    },
    
    // ============ USER OPERATIONS ============
    async login(schoolName, email, password) {
        const emailKey = email.replace(/\./g, ',');
        const snapshot = await database.ref(`schools/${schoolName}/users/${emailKey}`).once('value');
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
    },
    
    async createUser(schoolName, userData) {
        const emailKey = userData.email.replace(/\./g, ',');
        const snapshot = await database.ref(`schools/${schoolName}/users/${emailKey}`).once('value');
        if (snapshot.exists()) {
            return { success: false, error: 'User already exists' };
        }
        
        await database.ref(`schools/${schoolName}/users/${emailKey}`).set({
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
    },
    
    async getUsers(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/users`).once('value');
        const users = snapshot.val();
        return users ? Object.entries(users).map(([id, user]) => ({ id, ...user })) : [];
    },
    
    async updateUser(schoolName, email, userData) {
        const emailKey = email.replace(/\./g, ',');
        await database.ref(`schools/${schoolName}/users/${emailKey}`).update(userData);
        return { success: true };
    },
    
    async deleteUser(schoolName, email) {
        const emailKey = email.replace(/\./g, ',');
        await database.ref(`schools/${schoolName}/users/${emailKey}`).update({ isActive: false });
        return { success: true };
    },
    
    // ============ BOOK OPERATIONS ============
    async addBook(schoolName, bookData) {
        const bookRef = database.ref(`schools/${schoolName}/books`).push();
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
    },
    
    async getBooks(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/books`).once('value');
        const books = snapshot.val();
        return books ? Object.entries(books).map(([id, book]) => ({ id, ...book })) : [];
    },
    
    async updateBook(schoolName, bookId, bookData) {
        await database.ref(`schools/${schoolName}/books/${bookId}`).update(bookData);
        return { success: true };
    },
    
    async deleteBook(schoolName, bookId) {
        await database.ref(`schools/${schoolName}/books/${bookId}`).remove();
        return { success: true };
    },
    
    // ============ BORROWING OPERATIONS ============
    async issueBook(schoolName, borrowData) {
        const borrowRef = database.ref(`schools/${schoolName}/borrowed`).push();
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
    },
    
    async getBorrowed(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/borrowed`).once('value');
        const borrowed = snapshot.val();
        return borrowed ? Object.entries(borrowed).map(([id, record]) => ({ id, ...record })) : [];
    },
    
    async returnBook(schoolName, borrowId) {
        await database.ref(`schools/${schoolName}/borrowed/${borrowId}`).update({
            returned: true,
            actualReturnDate: new Date().toISOString().split('T')[0],
            status: 'returned'
        });
        return { success: true };
    },
    
    // ============ STUDENT OPERATIONS ============
    async addStudent(schoolName, studentData) {
        await database.ref(`schools/${schoolName}/students/${studentData.adm}`).set({
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
    },
    
    async getStudents(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/students`).once('value');
        const students = snapshot.val();
        return students ? Object.entries(students).map(([adm, student]) => ({ adm, ...student })) : [];
    },
    
    async updateStudent(schoolName, adm, studentData) {
        await database.ref(`schools/${schoolName}/students/${adm}`).update(studentData);
        return { success: true };
    },
    
    async deleteStudent(schoolName, adm) {
        await database.ref(`schools/${schoolName}/students/${adm}`).remove();
        return { success: true };
    },
    
    // ============ FURNITURE OPERATIONS ============
    async allocateFurniture(schoolName, furnitureData) {
        const furnitureRef = database.ref(`schools/${schoolName}/furniture`).push();
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
    },
    
    async getFurniture(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/furniture`).once('value');
        const furniture = snapshot.val();
        return furniture ? Object.entries(furniture).map(([id, item]) => ({ id, ...item })) : [];
    },
    
    async returnFurniture(schoolName, furnitureId) {
        await database.ref(`schools/${schoolName}/furniture/${furnitureId}`).update({
            returned: true,
            returnDate: new Date().toISOString().split('T')[0]
        });
        return { success: true };
    },
    
    // ============ TEACHER OPERATIONS ============
    async addTeacher(schoolName, teacherData) {
        const teacherRef = database.ref(`schools/${schoolName}/teachers`).push();
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
    },
    
    async getTeachers(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/teachers`).once('value');
        const teachers = snapshot.val();
        return teachers ? Object.entries(teachers).map(([id, teacher]) => ({ id, ...teacher })) : [];
    },
    
    async deleteTeacher(schoolName, teacherId) {
        await database.ref(`schools/${schoolName}/teachers/${teacherId}`).remove();
        return { success: true };
    },
    
    // ============ CLASS OPERATIONS ============
    async addClass(schoolName, classData) {
        const classRef = database.ref(`schools/${schoolName}/classes`).push();
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
    },
    
    async getClasses(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/classes`).once('value');
        const classes = snapshot.val();
        return classes ? Object.entries(classes).map(([id, cls]) => ({ id, ...cls })) : [];
    },
    
    // ============ ACADEMIC TERMS ============
    async addTerm(schoolName, termData) {
        const termRef = database.ref(`schools/${schoolName}/terms`).push();
        await termRef.set({
            name: termData.name,
            startDate: termData.startDate,
            endDate: termData.endDate,
            isCurrent: termData.isCurrent || false,
            createdBy: termData.createdBy || '',
            createdAt: new Date().toISOString()
        });
        return { success: true };
    },
    
    async getTerms(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/terms`).once('value');
        const terms = snapshot.val();
        return terms ? Object.entries(terms).map(([id, term]) => ({ id, ...term })) : [];
    },
    
    // ============ CHAT OPERATIONS ============
    async sendChatMessage(schoolName, messageData) {
        const msgRef = database.ref(`schools/${schoolName}/chat`).push();
        await msgRef.set({
            fromEmail: messageData.fromEmail,
            fromName: messageData.fromName,
            toEmail: messageData.toEmail,
            message: messageData.message,
            timestamp: new Date().toISOString(),
            readStatus: false
        });
        return { success: true };
    },
    
    async getChatMessages(schoolName, userEmail, otherEmail) {
        const snapshot = await database.ref(`schools/${schoolName}/chat`).once('value');
        const messages = snapshot.val();
        if (!messages) return [];
        
        return Object.values(messages).filter(msg => 
            (msg.fromEmail === userEmail && msg.toEmail === otherEmail) ||
            (msg.fromEmail === otherEmail && msg.toEmail === userEmail)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },
    
    // ============ FORUM OPERATIONS ============
    async postForumMessage(schoolName, messageData) {
        const msgRef = database.ref(`schools/${schoolName}/forum`).push();
        await msgRef.set({
            fromEmail: messageData.fromEmail,
            fromName: messageData.fromName,
            role: messageData.role || 'teacher',
            message: messageData.message,
            timestamp: new Date().toISOString(),
            isDeleted: false
        });
        return { success: true };
    },
    
    async getForumMessages(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/forum`).once('value');
        const messages = snapshot.val();
        return messages ? Object.values(messages).filter(msg => !msg.isDeleted) : [];
    },
    
    // ============ NOTEPAD OPERATIONS ============
    async saveNote(schoolName, noteData) {
        const noteRef = database.ref(`schools/${schoolName}/notes`).push();
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
    },
    
    async getNotes(schoolName, userEmail) {
        const snapshot = await database.ref(`schools/${schoolName}/notes`).once('value');
        const notes = snapshot.val();
        if (!notes) return [];
        
        return Object.values(notes).filter(note => 
            !note.isDeleted && (note.authorEmail === userEmail || !note.isPrivate)
        );
    },
    
    // ============ EVENTS OPERATIONS ============
    async addEvent(schoolName, eventData) {
        const eventRef = database.ref(`schools/${schoolName}/events`).push();
        await eventRef.set({
            title: eventData.title,
            description: eventData.description || '',
            eventDate: eventData.eventDate,
            eventType: eventData.eventType || 'Other',
            createdBy: eventData.createdBy || '',
            createdAt: new Date().toISOString()
        });
        return { success: true };
    },
    
    async getEvents(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/events`).once('value');
        const events = snapshot.val();
        return events ? Object.values(events) : [];
    },
    
    // ============ FEES OPERATIONS ============
    async saveFee(schoolName, feeData) {
        const feeRef = database.ref(`schools/${schoolName}/fees`).push();
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
    },
    
    async getFees(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/fees`).once('value');
        const fees = snapshot.val();
        return fees ? Object.values(fees) : [];
    },
    
    // ============ TIMETABLE OPERATIONS ============
    async addTimetableEntry(schoolName, entryData) {
        const entryRef = database.ref(`schools/${schoolName}/timetable`).push();
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
    },
    
    async getTimetable(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/timetable`).once('value');
        const timetable = snapshot.val();
        return timetable ? Object.values(timetable) : [];
    },
    
    // ============ AUDIT LOG OPERATIONS ============
    async addAuditLog(schoolName, logData) {
        const logRef = database.ref(`schools/${schoolName}/auditLog`).push();
        await logRef.set({
            timestamp: new Date().toISOString(),
            user: logData.user || 'System',
            userEmail: logData.userEmail || '',
            action: logData.action,
            details: logData.details || ''
        });
        return { success: true };
    },
    
    async getAuditLog(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/auditLog`).once('value');
        const logs = snapshot.val();
        return logs ? Object.values(logs).reverse() : [];
    },
    
    // ============ SETTINGS OPERATIONS ============
    async getSettings(schoolName) {
        const snapshot = await database.ref(`schools/${schoolName}/settings`).once('value');
        return snapshot.val();
    },
    
    async updateSettings(schoolName, settingsData) {
        await database.ref(`schools/${schoolName}/settings`).update(settingsData);
        return { success: true };
    },
    
    // ============ DATABASE MANAGER ============
    async getTableData(schoolName, tableName) {
        const snapshot = await database.ref(`schools/${schoolName}/${tableName}`).once('value');
        const data = snapshot.val();
        return data ? Object.values(data) : [];
    },
    
    // ============ REAL-TIME LISTENERS ============
    onBooksChange(schoolName, callback) {
        database.ref(`schools/${schoolName}/books`).on('value', (snapshot) => {
            const books = snapshot.val();
            callback(books ? Object.entries(books).map(([id, book]) => ({ id, ...book })) : []);
        });
    },
    
    onBorrowedChange(schoolName, callback) {
        database.ref(`schools/${schoolName}/borrowed`).on('value', (snapshot) => {
            const borrowed = snapshot.val();
            callback(borrowed ? Object.entries(borrowed).map(([id, record]) => ({ id, ...record })) : []);
        });
    },
    
    onStudentsChange(schoolName, callback) {
        database.ref(`schools/${schoolName}/students`).on('value', (snapshot) => {
            const students = snapshot.val();
            callback(students ? Object.entries(students).map(([adm, student]) => ({ adm, ...student })) : []);
        });
    },
    
    onFurnitureChange(schoolName, callback) {
        database.ref(`schools/${schoolName}/furniture`).on('value', (snapshot) => {
            const furniture = snapshot.val();
            callback(furniture ? Object.entries(furniture).map(([id, item]) => ({ id, ...item })) : []);
        });
    }
};

// Export API
window.API = API;