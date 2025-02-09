import Event from "../models/eventModel.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import fs from "fs";
import mongoose from "mongoose"; // ✅ Required to validate user ID

// ✅ Set up Multer for temporary file storage
const upload = multer({ dest: "uploads/" }); 

// @desc Create a new event (Handles Image Upload)
// @route POST /api/events
// @access Private
export const createEvent = async (req, res) => {
    try {
        console.log("Incoming Request Body:", req.body);
        console.log("Uploaded File:", req.file);

        const { title, description, date, location, category } = req.body;

        if (!title || !description || !date || !location || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let userId = req.user?._id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            userId = null; 
        }

        let imageUrl = "";
        if (req.file) {
            try {
                const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path);
                imageUrl = cloudinaryResponse.secure_url; 
                fs.unlinkSync(req.file.path);
            } catch (error) {
                console.error("Cloudinary Upload Error:", error);
                return res.status(500).json({ message: "Failed to upload image to Cloudinary" });
            }
        }

        // ✅ Ensure MongoDB stores `imageUrl` correctly
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            imageUrl, // ✅ Ensure this field is stored correctly
            user: userId,
        });

        console.log("Event Created Successfully:", event);
        res.status(201).json(event); // ✅ Ensure the response includes `imageUrl`
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// @desc Get all events
// @route GET /api/events
// @access Public
export const getEvents = async (req, res) => {
    try {
        const { category, location, sort } = req.query;

        let query = {};
        if (category) query.category = category;
        if (location) query.location = { $regex: location, $options: "i" };

        let events = Event.find(query).select("title date location category imageUrl attendees"); // ✅ Include `attendees`

        if (sort === "date") events = events.sort({ date: 1 });
        if (sort === "title") events = events.sort({ title: 1 });

        events = await events.exec();

        // ✅ Ensure attendees is always an array
        const updatedEvents = events.map(event => ({
            ...event.toObject(),
            attendees: event.attendees || []
        }));

        res.status(200).json(updatedEvents);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

  
  
  

// @desc Update an event
// @route PUT /api/events/:id
// @access Private
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        event.title = req.body.title || event.title;
        event.date = req.body.date || event.date;
        event.location = req.body.location || event.location;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc Delete an event
// @route DELETE /api/events/:id
// @access Private
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        await event.deleteOne();
        res.json({ message: "Event deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const registerForEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user?._id; // This should be set from authentication middleware

        console.log("🔹 Incoming Register Request:");
        console.log("   📌 Event ID:", eventId);
        console.log("   📌 User ID:", userId);
        console.log("   📌 Request Headers:", req.headers);

        if (!eventId) {
            console.error("❌ Missing Event ID");
            return res.status(400).json({ message: "Event ID is missing" });
        }
        if (!userId) {
            console.error("❌ Missing User ID (Authentication issue)");
            return res.status(401).json({ message: "User is not authenticated" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            console.error("❌ Event Not Found");
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.attendees.includes(userId)) {
            console.error("❌ User already registered for this event");
            return res.status(400).json({ message: "User already registered" });
        }

        event.attendees.push(userId);
        await event.save();

        const updatedEvent = await Event.findById(eventId).populate("attendees", "name email");

        console.log("✅ Successfully Registered:", updatedEvent);

        return res.status(200).json({
            message: "Successfully registered for the event",
            event: updatedEvent
        });

    } catch (error) {
        console.error("❌ Error registering for event:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};






  export const getEventById = async (req, res) => {
    try {
      const event = await Event.findById(req.params.id).populate("attendees", "name email"); // ✅ Fetch attendee names & emails
      if (!event) return res.status(404).json({ message: "Event not found" });
  
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  };

  export const unregisterFromEvent = async (req, res) => {
    try {
        const { id } = req.params; // Event ID
        const userId = req.user._id; // Logged-in user ID

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // ✅ Remove user from attendees list
        event.attendees = event.attendees.filter(attendeeId => attendeeId.toString() !== userId.toString());
        await event.save();

        const updatedEvent = await Event.findById(id).select("attendees"); // ✅ Ensure attendees is included

        res.json({ message: "Successfully unregistered from the event", event: updatedEvent });
    } catch (error) {
        console.error("❌ Error unregistering from event:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


  
  
  
  
