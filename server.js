const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files
app.use(express.static("."));

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URL.replace("<db_password>", "YOUR_PASSWORD_HERE")
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Face Schema
const FaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  descriptor: {
    type: [Number],
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  recognitionCount: {
    type: Number,
    default: 0,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
});

const Face = mongoose.model("Face", FaceSchema);

// Routes

// Register new face
app.post("/api/register", async (req, res) => {
  try {
    const { name, descriptor } = req.body;

    if (!name || !descriptor) {
      return res
        .status(400)
        .json({ error: "Name and descriptor are required" });
    }

    // Check if person already exists
    const existingFace = await Face.findOne({ name });
    if (existingFace) {
      return res.status(400).json({ error: "Person already registered" });
    }

    // Save new face
    const newFace = new Face({
      name,
      descriptor,
    });

    await newFace.save();

    res.json({
      message: `${name} registered successfully!`,
      id: newFace._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register face" });
  }
});

// Get all registered faces
app.get("/api/faces", async (req, res) => {
  try {
    const faces = await Face.find(
      {},
      "name recognitionCount lastSeen registeredAt"
    );
    res.json({ faces });
  } catch (error) {
    console.error("Error fetching faces:", error);
    res.status(500).json({ error: "Failed to fetch faces" });
  }
});

// Get face descriptors for recognition
app.get("/api/descriptors", async (req, res) => {
  try {
    const faces = await Face.find({}, "name descriptor");
    res.json({ faces });
  } catch (error) {
    console.error("Error fetching descriptors:", error);
    res.status(500).json({ error: "Failed to fetch descriptors" });
  }
});

// Update recognition count
app.post("/api/recognize/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const updatedFace = await Face.findOneAndUpdate(
      { name },
      {
        $inc: { recognitionCount: 1 },
        $set: { lastSeen: new Date() },
      },
      { new: true }
    );

    if (!updatedFace) {
      return res.status(404).json({ error: "Face not found" });
    }

    res.json({
      message: `Recognition count updated for ${name}`,
      recognitionCount: updatedFace.recognitionCount,
    });
  } catch (error) {
    console.error("Error updating recognition:", error);
    res.status(500).json({ error: "Failed to update recognition" });
  }
});

// Delete face
app.delete("/api/faces/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const deletedFace = await Face.findOneAndDelete({ name });

    if (!deletedFace) {
      return res.status(404).json({ error: "Face not found" });
    }

    res.json({ message: `${name} deleted successfully` });
  } catch (error) {
    console.error("Error deleting face:", error);
    res.status(500).json({ error: "Failed to delete face" });
  }
});

// Get recognition history
app.get("/api/history", async (req, res) => {
  try {
    const faces = await Face.find({})
      .sort({ lastSeen: -1 })
      .select("name recognitionCount lastSeen registeredAt");

    res.json({ history: faces });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
