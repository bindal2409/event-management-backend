import express from "express";
import multer from "multer";
import { 
  createEvent, 
  getEvents, 
  updateEvent, 
  deleteEvent, 
  registerForEvent, 
  getEventById, 
  unregisterFromEvent, 
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // ✅ Ensure images are temporarily stored

// ✅ Event CRUD Operations
router.post("/", protect, upload.single("image"), createEvent); // ✅ Create Event (with Image Upload)
router.get("/", getEvents); // ✅ Get All Events
router.get("/:id", getEventById); // ✅ Get Single Event
router.put("/:id", protect, upload.single("image"), updateEvent); // ✅ Update Event (with Image Upload)
router.delete("/:id", protect, deleteEvent); // ✅ Delete Event

// ✅ Event Registration & Unregistration
router.post("/:id/register", protect, registerForEvent); // ✅ Register for Event
router.delete("/:id/unregister", protect, unregisterFromEvent); // ✅ Unregister from Event
//router.put("/:id/attendees", protect, updateEventAttendees);


export default router;
