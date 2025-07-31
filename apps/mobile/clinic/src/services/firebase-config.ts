import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZPX8-FEkWADjckDZXEsAuCimwohjLQuQ",
  authDomain: "healui.firebaseapp.com",
  projectId: "healui",
  storageBucket: "healui.firebasestorage.app",
  messagingSenderId: "85550761100",
  appId: "1:85550761100:web:cdfb0fef208268f7ee27a9",
  measurementId: "G-EYK90BMGVK"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export default firebase;