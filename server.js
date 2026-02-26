const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const mysql = require("mysql2");
require('dotenv').config();

const app = express();

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "yourpassword",
    database: "user"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

// Google OAuth setup
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const profilePic = photos[0].value;

    // Check if user exists
    db.query("SELECT * FROM users WHERE google_id = ?", [id], (err, results) => {
        if (err) return done(err);

        if (results.length > 0) {
            return done(null, results[0]);
        } else {
            // Insert new user
            const query = "INSERT INTO users (google_id, email, name, profile_picture) VALUES (?, ?, ?, ?)";
            db.query(query, [id, email, displayName, profilePic], (err, result) => {
                if (err) return done(err);
                return done(null, { id: result.insertId, google_id: id, email, name: displayName, profile_picture: profilePic });
            });
        }
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
        if (err) return done(err);
        done(null, results[0]);
    });
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'rough.html'));
});

app.get('/rough', (req, res) => {
    res.sendFile(path.join(__dirname, 'rough.html'));
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      console.log('User authenticated:', req.user); // Check if user exists
      res.redirect('/rough');
    }
  );

app.get('/user-info', (req, res) => {
    if (!req.user) {
        return res.json({ loggedIn: false });
    }
    res.json({ loggedIn: true, name: req.user.name });
});

app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.redirect('/');
        });
    });
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Dynamic port to avoid conflicts
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
