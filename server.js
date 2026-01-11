const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/vw-service", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bookingSchema = new mongoose.Schema({
  id: String,
  model: String,
  reg: String,
  tasks: [String],
  date: String,
  time: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

app.post("/api/bookings", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: "Booking saved" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save booking" });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
