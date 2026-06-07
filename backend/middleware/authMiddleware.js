import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";

// Verify User JWT
export const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Please login again." });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body = req.body || {};
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token invalid or expired." });
  }
};

// Verify Doctor JWT
export const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken)
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Please login again." });
    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);
    
    let finalDocId = decoded.id;
    
    // Fallback: If the token was issued using a unified user._id instead of doctor._id
    try {
      const userDoc = await userModel.findById(decoded.id);
      console.log("[authDoctor] userDoc found:", !!userDoc, "role:", userDoc?.role);
      if (userDoc && userDoc.role === "doctor") {
        const actualDoctor = await doctorModel.findOne({ email: userDoc.email });
        console.log("[authDoctor] actualDoctor found:", !!actualDoctor, "email:", userDoc.email);
        if (actualDoctor) {
          finalDocId = actualDoctor._id.toString();
        }
      }
    } catch (e) {
      console.error("[authDoctor] Fallback check error:", e.message);
    }
    
    console.log("[authDoctor] finalDocId:", finalDocId);
    req.body = req.body || {};
    req.body.docId = finalDocId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token invalid or expired." });
  }
};

// Verify Admin JWT
export const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken)
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Please login again." });
    const decoded = jwt.verify(atoken, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Forbidden. Admin access only." });
    req.body = req.body || {};
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token invalid or expired." });
  }
};
