const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const Project = require("./models/Project");
const Message = require("./models/Message");
require("dotenv").config();

// Import routes
const adminRoutes = require("./routes/admin");
const projectRoutes = require("./routes/projects");
const messageRoutes = require("./routes/messages");
const connectDB = require("./src/db.js");

const app = express();

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: true, // Allow all origins (for development)
  credentials: true // Important for sessions/cookies
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware - MUST be before routes
app.use(
  session({
    secret: process.env.SESSION_SECRET || "portfolio_secret_key_change_in_production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: 'lax'
    },
    name: 'portfolio.sid' // Custom cookie name
  })
);

// Serve static files - public folder for admin pages
app.use(express.static(path.join(__dirname, "public")));
// Serve frontend files from current directory (same as server.js)
app.use(express.static(__dirname));

// API routes - MUST be before catch-all routes
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageRoutes);

// Check authentication endpoint
app.get("/api/check-auth", (req, res) => {
  res.json({
    isAuthenticated: !!(req.session && req.session.isAdmin),
    email: req.session?.adminEmail || null
  });
});

// Serve admin pages
app.get("/admin", (req, res) => {
  if (req.session && req.session.isAdmin) {
    res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
  } else {
    res.sendFile(path.join(__dirname, "public", "admin-login.html"));
  }
});

// Serve admin dashboard directly (for authenticated users only)
app.get("/admin/dashboard", (req, res) => {
  if (req.session && req.session.isAdmin) {
    res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
  } else {
    res.redirect("/admin");
  }
});

// Serve projects page
app.get("/projects", (req, res) => {
  res.sendFile(path.join(__dirname, "projects.html"));
});

// Serve main index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Check authentication middleware for protected API routes
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized. Please login first." });
  }
};

// Export the middleware for use in other routes
app.set('requireAuth', requireAuth);

// MongoDB connection
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`📂 Projects Page: http://localhost:${PORT}/projects`);
});
