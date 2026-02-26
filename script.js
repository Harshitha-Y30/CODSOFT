function showSignup() {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("signup-box").style.display = "block";
}

// Show Login Form
function showLogin() {
    document.getElementById("signup-box").style.display = "none";
    document.getElementById("login-box").style.display = "block";
}

// Signup Function
function signup() {
    let username = document.getElementById("signup-username").value;
    let password = document.getElementById("signup-password").value;

    if (username === "" || password === "") {
        alert("Please enter a username and password.");
        return;
    }

    if (localStorage.getItem(username)) {
        alert("Username already exists. Choose a different one.");
        return;
    }

    localStorage.setItem(username, password);
    alert("Signup successful! You can now log in.");
    showLogin();
}

// Login Function
function login() {
    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;

    if (username === "" || password === "") {
        alert("Please enter a username and password.");
        return;
    }

    let storedPassword = localStorage.getItem(username);
    if (storedPassword && storedPassword === password) {
        alert("Login successful!");
        window.location.href = "rough.html"; // Redirect to another page
    } else {
        alert("Invalid username or password!");
    }
}