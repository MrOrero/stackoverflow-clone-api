const client = require("../elasticsearch-init");
const Comment = require("../models/comment");
const INDEX = "stackoverflow";

exports.singleSearch = async (value, param) => {
    let response;
    switch (param) {
        case "title":
            response = await client.search({
                _source: ["text", "title", "tags", "creator", "comments", "id"],
                index: INDEX,
                query: {
                    match: {
                        title: value,
                    },
                },
            });
            break;
        case "text":
            response = await client.search({
                _source: ["text", "title", "tags", "creator", "comments", "id"],
                index: INDEX,
                query: {
                    match: {
                        text: value,
                    },
                },
            });
            break;
        case "tags":
            response = await client.search({
                _source: ["text", "title", "tags", "creator", "comments", "id"],
                index: INDEX,
                query: {
                    match: {
                        tags: value,
                    },
                },
            });
            break;
    }
    const results = response.hits.hits;
    return formatResult(results);
};

exports.doubleSearch = async (value, param) => {
    let response;
    switch (param) {
        case "text":
            response = await client.search({
                _source: [],
                index: INDEX,
                query: {
                    bool: {
                        must: [
                            {
                                match: {
                                    title: value.title,
                                },
                            },
                            {
                                match: {
                                    tags: value.tags,
                                },
                            },
                        ],
                    },
                },
            });
            break;
        case "title":
            response = await client.search({
                _source: [],
                index: INDEX,
                query: {
                    bool: {
                        must: [
                            {
                                match: {
                                    text: value.text,
                                },
                            },
                            {
                                match: {
                                    tags: value.tags,
                                },
                            },
                        ],
                    },
                },
            });
            break;
        case "tags":
            response = await client.search({
                _source: [],
                index: INDEX,
                query: {
                    bool: {
                        must: [
                            {
                                match: {
                                    title: value.title,
                                },
                            },
                            {
                                match: {
                                    text: value.text,
                                },
                            },
                        ],
                    },
                },
            });
            break;
    }
    const results = response.hits.hits;
    return formatResult(results);
};

const formatResult = async (results) => {
    const promises = results.map(async (result) => {
        if (result._source.comments.length) {
            const formattedComments = await Comment.find({
                _id: { $in: result._source.comments },
            });
            return { ...result._source, comments: formattedComments };
        }
        return { ...result._source };
    });
    const formattedResult = await Promise.all(promises);
    return formattedResult;
};
