const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { HandleError, HandleSuccess } = require("./Base.Controller");

// Simple email regex for basic validation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = {

    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Type-check all inputs (prevent NoSQL injection via objects)
            if (!name || typeof name !== 'string' ||
                !email || typeof email !== 'string' ||
                !password || typeof password !== 'string') {
                return HandleError(res, "All fields are required and must be strings.");
            }

            // Validate email format
            if (!EMAIL_RE.test(email)) {
                return HandleError(res, "Invalid email format.");
            }

            // Validate name length
            if (name.trim().length < 2 || name.trim().length > 100) {
                return HandleError(res, "Name must be between 2 and 100 characters.");
            }

            // Enforce password strength
            if (password.length < 8 || password.length > 128) {
                return HandleError(res, "Password must be between 8 and 128 characters.");
            }

            if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
                return HandleError(res, "Password must contain uppercase, lowercase, and a number.");
            }

            const exist = await User.findOne({ email: email.toLowerCase().trim() });
            if (exist) return HandleError(res, "User already exists.");

            const hashed = await bcrypt.hash(password, 12); // Increased from 10 to 12 rounds

            await User.create({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashed
            });

            return HandleSuccess(res, null, "User registered successfully.");
        } catch (err) {
            console.error("Register error:", err.message);
            return HandleError(res, "Registration failed. Please try again.");
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Type-check inputs (CRITICAL: prevents NoSQL injection like {"$gt": ""})
            if (!email || typeof email !== 'string' ||
                !password || typeof password !== 'string') {
                return HandleError(res, "Email & Password required.");
            }

            // Validate email format
            if (!EMAIL_RE.test(email)) {
                return HandleError(res, "Invalid email or password.");
            }

            const user = await User.findOne({ email: email.toLowerCase().trim() });
            if (!user) return HandleError(res, "Invalid email or password.");

            const match = await bcrypt.compare(password, user.password);
            if (!match) return HandleError(res, "Invalid email or password.");

            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d",
                    algorithm: 'HS256',  // Explicit algorithm prevents confusion attacks
                }
            );

            return HandleSuccess(res, { token }, "Login Successful.");
        } catch (err) {
            console.error("Login error:", err.message);
            return HandleError(res, "Login failed. Please try again.");
        }
    }
};
