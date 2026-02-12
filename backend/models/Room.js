import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  blockName: { type: String, required: true },
  floorNo: { type: Number, required: true },
  roomNumber: { type: String, required: true },
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  capacity: { type: Number, required: true }, // calculated as rows*columns
});

const Room = mongoose.model("Room", roomSchema);
export default Room;


