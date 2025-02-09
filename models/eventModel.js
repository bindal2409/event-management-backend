import mongoose from "mongoose";

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Tech", "Music", "Education", "Business", "Sports"],
    },
    imageUrl: { type: String }, // ✅ Image Hosting Support
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ Attendee Tracking
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // ✅ User is now OPTIONAL
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
