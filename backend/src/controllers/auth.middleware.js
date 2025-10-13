const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies.token; // JWT from cookie
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // verify token
    const decoded = jwt.verify(token, "ac6d24ff7e9e94cda2de74d17c3435d3a407734b");

    // attach user to request (without password)
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // make available in next function
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authenticateUser;
