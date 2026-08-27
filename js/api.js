// ============================================
// SRMS - Firebase API Configuration and Calls
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyACefHWvbETo2siNZy4ETCWZVTwIrtaNMs",
    authDomain: "srms-fd318.firebaseapp.com",
    databaseURL: "https://srms-fd318-default-rtdb.firebaseio.com",
    projectId: "srms-fd318",
    storageBucket: "srms-fd318.firebasestorage.app",
    messagingSenderId: "828888967437",
    appId: "1:828888967437:web:90461f6b1bc79854ea6844",
    measurementId: "G-J51WJVHRD1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ============ CONNECTION MONITORING ============
const connectedRef = database.ref('.info/connected');
connectedRef.on('value', (snapshot) => {
    if (snapshot.val() === true) {
        console.log('✅ Connected to Firebase');
    } else {
        console.log('❌ Disconnected from Firebase');
    }
});

// ============ API OBJECT ============
const API = {
    // ============ SCHOOL OPERATIONS ============
    
    // Get school information
    async getSchool(schoolName) {
        try {
            const snapshot = await database.ref(`schools/${schoolName}`).once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error getting school:', error);
            throw error;
        }
    },
    
    // Create new school
    async createSchool(schoolData) {
        try {
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
                createdAt: new Date().toISOString()
            });
            
            return { success: true, inviteCode };
        } catch (error) {
            console.error('Error creating school:', error);
            return { success: false, error: error.message };
        }
    },
    
    // ============ USER OPERATIONS ============
    
    // Login user
    async login(schoolName, email, password) {
        try {
            const emailKey = email.replace(/\./g, ',');
            const snapshot = await database.ref(`schools/${schoolName}/users/${emailKey}`).once('value');
            const user = snapshot.val();
            
            if (user && user.password === hashPassword(password)) {
                // Update last login
                await database.ref(`schools/${schoolName}/users/${emailKey}`).update({
                    lastLogin: new Date().toISOString()
                });
                
                // Save session
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
            
            return { success: false, error: 'Invalid email or password' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Create user
    async createUser(schoolName, userData) {
        try {
            const emailKey = userData.email.replace(/\./g, ',');
            await database.ref(`schools/${schoolName}/users/${emailKey}`).set({
                name: userData.name,
                email: userData.email,
                role: userData.role || 'teacher',
                staffId: userData.staffId || generateStaffId(),
                password: hashPassword(userData.password),
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get all users
    async getUsers(schoolName) {
        try {
            const snapshot = await database.ref(`schools/${schoolName}/users`).once('value');
            const users = snapshot.val();
            return users ? Object.entries(users).map(([id, user]) => ({ id, ...user })) : [];
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    },
    
    // ============ BOOK OPERATIONS ============
    
    // Add book
    async addBook(schoolName, bookData) {
        try {
            const bookRef = database.ref(`schools/${schoolName}/books`).push();
            await bookRef.set({
                title: bookData.title,
                author: bookData.author || '',
                type: bookData.type || 'Textbook',
                subject: bookData.subject || '',
                isbn: bookData.isbn || '',
                quantity: bookData.quantity || 1,
                available: bookData.quantity || 1,
                location: bookData.location || '',
                createdBy: bookData.createdBy || '',
                createdAt: new Date().toISOString()
            });
            
            return { success: true, bookId: bookRef.key };
        } catch (error) {
            console.error('Error adding book:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get all books
    async getBooks(schoolName) {
        try {
            const snapshot = await database.ref(`schools/${schoolName}/books`).once('value');
            const books = snapshot.val();
            return books ? Object.entries(books).map(([id, book]) => ({ id, ...book })) : [];
        } catch (error) {
            console.error('Error getting books:', error);
            return [];
        }
    },
    
    // Update book
    async updateBook(schoolName, bookId, bookData) {
        try {
            await database.ref(`schools/${schoolName}/books/${bookId}`).update(bookData);
            return { success: true };
        } catch (error) {
            console.error('Error updating book:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Delete book
    async deleteBook(schoolName, bookId) {
        try {
            await database.ref(`schools/${schoolName}/books/${bookId}`).remove();
            return { success: true };
        } catch (error) {
            console.error('Error deleting book:', error);
            return { success: false, error: error.message };
        }
    },
    
    // ============ BORROWING OPERATIONS ============
    
    // Issue book
    async issueBook(schoolName, borrowData) {
        try {
            const borrowRef = database.ref(`schools/${schoolName}/borrowed`).push();
            await borrowRef.set({
                studentName: borrowData.studentName,
                adm: borrowData.adm,
                form: borrowData.form || '',
                stream: borrowData.stream || '',
                bookTitle: borrowData.bookTitle,
                bookNo: borrowData.bookNo,
                borrowDate: borrowData.borrowDate,
                returnDate: borrowData.returnDate,
                returned: false,
                actualReturnDate: null,
                issuedBy: borrowData.issuedBy || '',
                issuedByEmail: borrowData.issuedByEmail || '',
                createdAt: new Date().toISOString()
            });
            
            return { success: true, borrowId: borrowRef.key };
        } catch (error) {
            console.error('Error issuing book:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Return book
    async returnBook(schoolName, borrowId) {
        try {
            await database.ref(`schools/${schoolName}/borrowed/${borrowId}`).update({
                returned: true,
                actualReturnDate: new Date().toISOString().split('T')[0]
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error returning book:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get borrowed books
    async getBorrowed(schoolName) {
        try {
            const snapshot = await database.ref(`schools/${schoolName}/borrowed`).once('value');
            const borrowed = snapshot.val();
            return borrowed ? Object.entries(borrowed).map(([id, record]) => ({ id, ...record })) : [];
        } catch (error) {
            console.error('Error getting borrowed:', error);
            return [];
        }
    },
    
    // ============ STUDENT OPERATIONS ============
    
    // Add student
    async addStudent(schoolName, studentData) {
        try {
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
                address: studentData.address || '',
                medicalInfo: studentData.medicalInfo || '',
                specialNeeds: studentData.specialNeeds || '',
                addedBy: studentData.addedBy || '',
                createdAt: new Date().toISOString(),
                isActive: true
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error adding student:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get all students
    async getStudents(schoolName) {
        try {
            const snapshot = await database.ref(`schools/${schoolName}/students`).once('value');
            const students = snapshot.val();
            return students ? Object.entries(students).map(([adm, student]) => ({ adm, ...student })) : [];
        } catch (error) {
            console.error('Error getting students:', error);
            return [];
        }
    },
    
    // Update student
    async updateStudent(schoolName, adm, studentData) {
        try {
            await database.ref(`schools/${schoolName}/students/${adm}`).update(studentData);
            return { success: true };
        } catch (error) {
            console.error('Error updating student:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Delete student
    async deleteStudent(schoolName, adm) {
        try {
            await database.ref(`schools/${schoolName}/students/${adm}`).remove();
            return { success: true };
        } catch (error) {
            console.error('Error deleting student:', error);
            return { success: false, error: error.message };
        }
    },
    
    // ============ FURNITURE OPERATIONS ============
    
    // Allocate furniture
    async allocateFurniture(schoolName, furnitureData) {
        try {
            const furnitureRef = database.ref(`schools/${schoolName}/furniture`).push();
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
            console.error('Error allocating furniture:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Return furniture
    async returnFurniture(schoolName, furnitureId) {
        try {
            await database.ref(`schools/${schoolName}/furniture/${furnitureId}`).update({
                returned: true,
                returnDate: new Date().toISOString().split('T')[0]
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error returning furniture:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get all furniture
    async getFurniture(schoolName) {
        try {
            const snapshot = await database.ref(`schools/${schoolName}/furniture`).once('value');
            const furniture = snapshot.val();
            return furniture ? Object.entries(furniture).map(([id, item]) => ({ id, ...item })) : [];
        } catch (error) {
            console.error('Error getting furniture:', error);
            return [];
        }
    },
    
    // ============ SETTINGS OPERATIONS ============
    
    // Get settings
    async getSettings(schoolName) {
        try {
            const snapshot = await database.ref(`schools/${schoolName}/settings`).once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error getting settings:', error);
            return null;
        }
    },
    
    // Update settings
    async updateSettings(schoolName, settingsData) {
        try {
            await database.ref(`schools/${schoolName}/settings`).update(settingsData);
            return { success: true };
        } catch (error) {
            console.error('Error updating settings:', error);
            return { success: false, error: error.message };
        }
    },
    
    // ============ REAL-TIME LISTENERS ============
    
    // Listen to books changes
    onBooksChange(schoolName, callback) {
        database.ref(`schools/${schoolName}/books`).on('value', (snapshot) => {
            const books = snapshot.val();
            callback(books ? Object.entries(books).map(([id, book]) => ({ id, ...book })) : []);
        });
    },
    
    // Listen to borrowed changes
    onBorrowedChange(schoolName, callback) {
        database.ref(`schools/${schoolName}/borrowed`).on('value', (snapshot) => {
            const borrowed = snapshot.val();
            callback(borrowed ? Object.entries(borrowed).map(([id, record]) => ({ id, ...record })) : []);
        });
    },
    
    // Listen to students changes
    onStudentsChange(schoolName, callback) {
        database.ref(`schools/${schoolName}/students`).on('value', (snapshot) => {
            const students = snapshot.val();
            callback(students ? Object.entries(students).map(([adm, student]) => ({ adm, ...student })) : []);
        });
    },
    
    // Listen to furniture changes
    onFurnitureChange(schoolName, callback) {
        database.ref(`schools/${schoolName}/furniture`).on('value', (snapshot) => {
            const furniture = snapshot.val();
            callback(furniture ? Object.entries(furniture).map(([id, item]) => ({ id, ...item })) : []);
        });
    }
};

// Export API
window.API = API;