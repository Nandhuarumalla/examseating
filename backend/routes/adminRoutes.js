import express from "express";
import Room from "../models/Room.js";

const router = express.Router();

// Create Room
router.post("/rooms", async (req, res) => {
  try {
    const { blockName, floorNo, roomNumber, rows, columns } = req.body;
    const capacity = rows * columns;
    const room = await Room.create({ blockName, floorNo, roomNumber, rows, columns, capacity });
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get All Rooms
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Room
router.put("/rooms/:id", async (req, res) => {
  try {
    const { blockName, floorNo, roomNumber, rows, columns } = req.body;
    const capacity = rows * columns;
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { blockName, floorNo, roomNumber, rows, columns, capacity },
      { new: true }
    );
    res.status(200).json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Room
router.delete("/rooms/:id", async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
