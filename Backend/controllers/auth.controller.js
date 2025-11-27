const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { HandleError, HandleSuccess } = require("./Base.Controller");

module.exports = {

    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return HandleError(res, "All fields are required.");
            }

            const exist = await User.findOne({ email });
            if (exist) return HandleError(res, "User already exists.");

            const hashed = await bcrypt.hash(password, 10);

            await User.create({
                name,
                email,
                password: hashed
            });

            return HandleSuccess(res, null, "User registered successfully.");
        } catch (err) {
            return HandleError(res, err.message);
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return HandleError(res, "Email & Password required.");
            }

            const user = await User.findOne({ email });
            if (!user) return HandleError(res, "Invalid email or password.");

            const match = await bcrypt.compare(password, user.password);
            if (!match) return HandleError(res, "Invalid email or password.");

            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return HandleSuccess(res, { token }, "Login Successful.");
        } catch (err) {
            return HandleError(res, err.message);
        }
    }
};
