// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";

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
const db = getDatabase(app);
const auth = getAuth(app);

// Generate a unique code
function generateUniqueCode() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Load or generate the user's unique ID
async function loadUserId() {
    const userIdElement = document.getElementById("userId");
    userIdElement.textContent = "Loading...";

    const currentUser = auth.currentUser;
    if (!currentUser) {
        userIdElement.textContent = "Please log in.";
        return;
    }

    try {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
            userIdElement.textContent = "User data not found.";
            return;
        }

        const userData = snapshot.val();
        
        if (!userData.code) {
            // Generate and save a new code
            const newCode = generateUniqueCode();
            await update(userRef, { code: newCode });
            userIdElement.textContent = newCode;
        } else {
            userIdElement.textContent = userData.code;
        }
    } catch (error) {
        console.error("Error in loadUserId:", error);
        userIdElement.textContent = "Error loading ID.";
    }
}

// Copy the user's unique ID to the clipboard
function copyUserId() {
    const userId = document.getElementById("userId").textContent;
    if (userId && userId !== "Loading..." && userId !== "No ID assigned yet." && userId !== "Please log in." && userId !== "Error loading ID.") {
        navigator.clipboard.writeText(userId)
            .then(() => {
                alert("ID copied to clipboard!");
            })
            .catch(error => {
                console.error("Failed to copy ID:", error);
                alert("Failed to copy ID to clipboard");
            });
    } else {
        alert("No valid ID available to copy.");
    }
}

// Send a pairing request to the entered ID
function sendPairingRequest() {
    const enteredId = document.getElementById("searchIdInput").value.trim();
    const currentUser = auth.currentUser;

    if (!enteredId) {
        alert("Please enter an ID.");
        return;
    }

    if (!currentUser) {
        alert("User not logged in.");
        return;
    }

    const usersRef = ref(db, 'users/');
    get(usersRef)
        .then(snapshot => {
            if (!snapshot.exists()) {
                alert("No users found in database.");
                return;
            }

            const users = snapshot.val();
            let targetUser = null;

            // Find the user with the entered ID
            Object.entries(users).forEach(([userId, userData]) => {
                if (userData.code === enteredId) {
                    targetUser = { id: userId, ...userData };
                }
            });

            if (!targetUser) {
                alert("No user found with the entered ID.");
                return;
            }

            if (targetUser.id === currentUser.uid) {
                alert("You cannot send a pairing request to yourself.");
                return;
            }

            // Add pairing request to target user
            const targetUserRef = ref(db, `users/${targetUser.id}`);
            const targetRequests = targetUser.pairingRequests || [];
            
            if (targetRequests.includes(currentUser.uid)) {
                alert("Request already sent.");
                return;
            }

            // Add timestamp to the request
            const pairingTimestamp = Date.now();
            targetRequests.push(currentUser.uid);
            
            update(targetUserRef, { 
                pairingRequests: targetRequests,
                pairingTimestamp: pairingTimestamp // Add timestamp when request is sent
            })
                .then(() => {
                    // Update current user's timestamp as well
                    const currentUserRef = ref(db, `users/${currentUser.uid}`);
                    return update(currentUserRef, { pairingTimestamp: pairingTimestamp });
                })
                .then(() => alert("Pairing request sent!"))
                .catch(error => {
                    console.error("Error sending request:", error);
                    alert("Failed to send pairing request.");
                });
        })
        .catch(error => {
            console.error("Error searching for user:", error);
            alert("Error occurred while searching for user.");
        });
}

// Add event listeners
onAuthStateChanged(auth, user => {
    if (user) {
        loadUserId();
    } else {
        document.getElementById("userId").textContent = "Please log in.";
    }
});

document.getElementById("copyIdButton").addEventListener("click", copyUserId);
document.getElementById("sendRequestButton").addEventListener("click", sendPairingRequest);