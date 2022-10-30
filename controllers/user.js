const User = require("../models/user");

exports.createUser = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return console.log("user already exists");
        }
        const user = new User({
            username: username,
            password: password,
        });
        await user.save();
        res.status(201).json({ message: "User created Successfully" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        return next(error);
    }
};
