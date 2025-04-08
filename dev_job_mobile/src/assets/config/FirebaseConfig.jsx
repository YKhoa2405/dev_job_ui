// import { initializeApp, getApp, getApps } from "firebase/app";
// import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// // Cấu hình Firebase
// const firebaseConfig = {
//     apiKey: "AIzaSyDFRUrMi8QbQmzrUOEHCmbVwyqKVpveuV8",
//     authDomain: "devjob-fe071.firebaseapp.com",
//     projectId: "devjob-fe071",
//     storageBucket: "devjob-fe071.appspot.com",
//     messagingSenderId: "1043747816081",
//     appId: "1:1043747816081:web:3d45a59179f5f5eb8d7530"
// };

// // Kiểm tra xem Firebase đã được khởi tạo chưa, nếu chưa thì khởi tạo
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// // Lấy Firestore instance từ Firebase App
// const storeDb = getFirestore(app);

// const saveUserToFirestore = async (id, email, name, avatar) => {
//     try {
//         // Kiểm tra và tạo DocumentReference
//         const userDocRef = doc(storeDb, "users", id);  // Firestore instance + Collection + Document ID
//         const docSnap = await getDoc(userDocRef);  // Kiểm tra tài liệu người dùng

//         // Dữ liệu người dùng
//         const userData = {
//             email: email || '',
//             name: name || '',
//             role: "NORMAL_USER",
//             avatar: avatar || '',
//         };

//         // Lưu hoặc cập nhật thông tin người dùng
//         await setDoc(userDocRef, { ...userData, id }, { merge: true });

//         console.log("User saved or updated successfully!");
//     } catch (error) {
//         console.error('Error saving or updating user:', error.message);
//     }
// };

// export { saveUserToFirestore };
