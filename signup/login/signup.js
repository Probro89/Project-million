// Firebase configuration and imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { v4 as uuidv4 } from "https://cdn.jsdelivr.net/npm/uuid@9.0.0/dist/esm-browser/index.js"; // For unique ID generation

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDuwbFf4v05VzuNu84YCS9S31pV9cOYktw",
    authDomain: "ocean-35959.firebaseapp.com",
    projectId: "ocean-35959",
    storageBucket: "ocean-35959.firebasestorage.app",
    messagingSenderId: "926712216319",
    appId: "1:926712216319:web:ac2a5ffc6fb5b56447eaca",
    measurementId: "G-J844DFXM0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Event listener for signup form submission
document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page

    // Get input values
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value; // Assuming there is an input field for username
    const code = uuidv4(); // Generate a unique ID for the user

    try {
        // Create the user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data to Firebase Realtime Database
        const userRef = ref(db, 'users/' + user.uid);
        await set(userRef, {
            username: username, // Save username
            email: user.email,  // Save email
            code: code,         // Save the generated unique ID
            pairingRequests: [], // Initialize pairing requests as an empty array
            pairedWith: null    // Initialize paired user as null
        });

        // Redirect to pairing page after signup
        window.location.href = "user_pairing/pairing.html";
    } catch (error) {
        console.error("Error during signup:", error.message);
        alert(error.message); // Show error message to the user
    }
});
