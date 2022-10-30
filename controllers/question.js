const client = require("../elasticsearch-init");
const Question = require("../models/question");
const User = require("../models/user");
const Comment = require("../models/comment");
const { singleSearch, doubleSearch } = require("../util/search-helper");
const INDEX = "stackoverflow";

exports.createQuestion = async (req, res, next) => {
    try {
        const { title, text, tags, username } = req.body;
        const existingUser = await User.findOne({ user: username });
        if (!existingUser) {
            return console.log("create user account first");
        }
        const question = new Question({
            title: title,
            text: text,
            tags: tags,
            creator: existingUser._id,
        });
        const createdQuestion = await question.save();

        const newQuestion = await Question.findById(
            createdQuestion._id
        ).populate("creator", "username");
        const indexId = createdQuestion._id.toString();

        delete Object.assign(createdQuestion._doc, { id: createdQuestion._id })[
            "_id"
        ];

        await client.update({
            index: INDEX,
            id: indexId,
            script: "ctx._source.new_field = 'value_of_new_field'",
            upsert: {
                ...createdQuestion._doc,
            },
        });

        res.status(201).json({
            message: "Question created Successfully",
            data: newQuestion,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        return next(error);
    }
};

exports.getQuestion = async (req, res, next) => {
    try {
        const { title, text, tags } = req.query;

        if (!text && !tags) {
            const data = await singleSearch(title, "title");
            res.status(201).json({
                message: "success",
                data: data,
            });
        } else if (!text && !title) {
            const data = await singleSearch(tags, "tags");
            res.status(201).json({
                message: "success",
                data: data,
            });
        } else if (!title && !tags) {
            const data = await singleSearch(text, "text");
            res.status(201).json({
                message: "success",
                data: data,
            });
        } else if (!text) {
            const data = await doubleSearch({ title, tags }, "text");
            res.status(201).json({
                message: "sucess",
                data: data,
            });
        } else if (!title) {
            const data = await doubleSearch({ text, tags }, "title");
            res.status(201).json({
                message: "sucess",
                data: data,
            });
        } else if (!tags) {
            const data = await doubleSearch({ text, title }, "tags");
            res.status(201).json({
                message: "sucess",
                data: data,
            });
        } else {
            return console.log("invalid parameters");
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        return next(error);
    }
};

exports.addComment = async (req, res, next) => {
    try {
        const { comment, questionId, username } = req.body;
        const existingUser = await User.findOne({ user: username });
        if (!existingUser) {
            return console.log("create user account first");
        }
        const question = await Question.findById(questionId);
        if (!question) {
            return console.log("no question");
        }

        const newComment = new Comment({
            comment: comment,
            creator: existingUser._id,
            question: question._id,
        });

        const savedComment = await newComment.save();

        question.comments.push(savedComment._id);
        await question.save();

        const updatedQuestion = await Question.findById(questionId).populate(
            "comments"
        );

        await client.update({
            index: INDEX,
            id: questionId,
            script: {
                lang: "painless",
                source: "ctx._source.comments = params.allComments",
                params: { allComments: question.comments },
            },
        });

        res.status(201).json({
            message: "Question created Successfully",
            data: updatedQuestion,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        return next(error);
    }
};
