import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      console.log("Received Token:", token); // ✅ Debugging

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.id === "guest-user-id") {
        req.user = { _id: "guest-user-id", name: "Guest User" }; // ✅ Allow guest access
      } else {
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
          return res.status(401).json({ message: "User not found, authorization denied" });
        }
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Invalid token, authorization denied" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};
