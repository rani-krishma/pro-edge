const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/grandrise")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err));

// Schema
const ConsultationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  projectType: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const Consultation = mongoose.model("Consultation", ConsultationSchema);

// Email Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "krishma6280@gmail.com",
    pass: "yfumlzffobhcouzi"
  }
});

// Verify email connection
transporter.verify((error) => {
  if (error) {
    console.log("Email Error:", error.message);
  } else {
    console.log("Email Ready ✅");
  }
});

// API
app.post("/consultation", async (req, res) => {
  try {
    // Save to MongoDB
    const data = new Consultation(req.body);
    await data.save();
    console.log("Saved to MongoDB!");

    // Email 1 — Send to company
    await transporter.sendMail({
      from: "krishma6280@gmail.com",
      replyTo: req.body.email,
      to: "info@grandrisehomes.com.au",
      subject: `New Consultation from ${req.body.name}`,
      html: `
        <h2 style="color:#C8A96E">New Consultation - Grand Rise Homes</h2>
        <p><strong>Name:</strong> ${req.body.name}</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Phone:</strong> ${req.body.phone}</p>
        <p><strong>Project Type:</strong> ${req.body.projectType}</p>
        <p><strong>Message:</strong> ${req.body.message}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <br>
        <p>Hit Reply to contact ${req.body.name} directly.</p>
      `
    });
    console.log("Email sent to company! ✅");

    // Email 2 — Send confirmation to client
    await transporter.sendMail({
      from: "krishma6280@gmail.com",
      to: req.body.email,
      subject: `Thank You ${req.body.name} - Grand Rise Homes`,
      html: `
        <h2 style="color:#C8A96E">Thank You, ${req.body.name}!</h2>
        <p>We have received your consultation request.</p>
        <p>Our team will contact you within 24 hours.</p>
        <br>
        <p><strong>Your Submission Details:</strong></p>
        <p><strong>Project Type:</strong> ${req.body.projectType}</p>
        <p><strong>Message:</strong> ${req.body.message}</p>
        <br>
        <p>Best Regards,</p>
        <p><strong>Grand Rise Homes Team</strong></p>
        <p>📞 +61 400 000 000</p>
        <p>✉ info@grandrisehomes.com</p>
        <p>📍 Adelaide, Australia</p>
      `
    });
    console.log("Confirmation email sent to client! ✅");

    res.json({ message: "Consultation sent successfully!" });

  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});