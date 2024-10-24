const express = require("express");
require('dotenv').config();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pg = require("pg");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  host: process.env.ip,
  database: "connectverse",
  password: process.env.passwor,
  port: 5432,
});

db.connect();

const JWT_SECRET = process.env.JWT_SECRET ; 

// file uploads
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// send welcome email
const sendWelcomeEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD, 
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Welcome to ConnectVerse!',
    text: `Hi ${name},\n\nWelcome to ConnectVerse! We are glad to have you.\n\nBest,\nThe ConnectVerse Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Signup
app.post("/signup", upload.single('profilePic'), async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicture = req.file ? req.file.buffer : null;

    const result = await db.query(
      "INSERT INTO users (email, password, name, profile_picture) VALUES ($1, $2, $3, $4) RETURNING *",
      [email, hashedPassword, name, profilePicture]
    );

    if (req.file) {
      console.log("Profile picture received:", req.file.originalname);
    } else {
      console.log("No profile picture provided");
    }

    const token = generateToken(result.rows[0]);
    await sendWelcomeEmail(email, name);
    res.json({ message: "User registered successfully", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login 
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = generateToken(user.rows[0]);
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (!user.rows.length) {
      return res.status(400).json({ error: "User with this email does not exist" });
    }
    const resetToken = jwt.sign(
      { id: user.rows[0].id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log(resetToken);
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, 
        pass: process.env.PASSWORD, 
      },
    });

    // send email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset Request',
      text: `Hi,\n\nYou requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nIf you did not request this, please ignore this email.\nThe ConnectVerse Team`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Password reset link sent to ${email}`);
    res.json({ message: "Password reset link has been sent to your email" });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ error: "Error sending password reset email" });
  }
});


app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET); //verify token
    const userId = decoded.id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //set new password in database
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
