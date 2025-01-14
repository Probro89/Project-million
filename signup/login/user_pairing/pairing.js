// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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
import { setLogLevel } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
setLogLevel("debug");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Function to search for users by username
function searchUser() {
    const searchQuery = document.getElementById("searchUsername").value.trim();
    console.log("Search query:", searchQuery);  // Debugging the search query

    if (searchQuery) {
        const usersRef = ref(db, 'users/');
        get(usersRef)
            .then((snapshot) => {
                const users = snapshot.val();
                console.log("Users retrieved from Firebase:", users);  // Debugging the retrieved users

                const results = [];

                for (const userId in users) {
                    if (users[userId].username.toLowerCase().includes(searchQuery.toLowerCase())) {
                        results.push({ userId, username: users[userId].username });
                    }
                }

                console.log("Search results:", results);  // Debugging the results

                displaySearchResults(results);
            })
            .catch((error) => {
                console.error("Error searching users:", error.message);
            });
    } else {
        console.log("Search query is empty.");  // If no query is entered
    }
}

// Function to display search results
function displaySearchResults(results) {
    const searchResultsDiv = document.getElementById("searchResults");
    searchResultsDiv.innerHTML = '';  // Clear previous results

    if (results.length > 0) {
        results.forEach(result => {
            const resultDiv = document.createElement('div');
            resultDiv.classList.add('search-result');
            resultDiv.innerHTML = `
                <p>Username: ${result.username}</p>
                <button onclick="sendPairingRequest('${result.userId}')">Send Pairing Request</button>
            `;
            searchResultsDiv.appendChild(resultDiv);
        });
    } else {
        searchResultsDiv.innerHTML = '<p>No users found.</p>';
    }
}

// Function to send pairing request
function sendPairingRequest(targetUserId) {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const userRef = ref(db, 'users/' + currentUser.uid);
        const targetUserRef = ref(db, 'users/' + targetUserId);

        // Add target user to the current user's pairing requests
        get(userRef)
            .then((snapshot) => {
                const currentUserData = snapshot.val();
                const pairingRequests = currentUserData.pairingRequests || [];

                if (!pairingRequests.includes(targetUserId)) {
                    pairingRequests.push(targetUserId);
                    // Update current user pairing requests
                    set(userRef, { ...currentUserData, pairingRequests });

                    // Add current user to the target user's pairing requests
                    get(targetUserRef)
                        .then((snapshot) => {
                            const targetUserData = snapshot.val();
                            const targetPairingRequests = targetUserData.pairingRequests || [];
                            if (!targetPairingRequests.includes(currentUser.uid)) {
                                targetPairingRequests.push(currentUser.uid);
                                // Update target user pairing requests
                                set(targetUserRef, { ...targetUserData, pairingRequests: targetPairingRequests });
                            }
                        });
                }
            })
            .catch((error) => {
                console.error("Error sending pairing request:", error.message);
            });
    }
}

// Add event listener to search button
document.getElementById('searchButton').addEventListener('click', searchUser);
