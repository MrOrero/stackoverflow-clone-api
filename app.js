const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const questionRoutes = require("./routes/question");
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

app.use("/api", userRoutes);
app.use("/api", questionRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode;
    const message = error.message;
    const data = error.data;
    return res.status(statusCode).json({
        message: message,
        data: data,
    });
});

mongoose
    .connect(process.env.MONGODB_URL)
    .then((result) => {
        console.log("Database connected");
        app.listen(process.env.PORT || 3000);
    })
    .catch((error) => {
        console.log(error);
    });
