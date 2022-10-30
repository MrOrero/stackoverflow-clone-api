const { Client } = require("@elastic/elasticsearch");

const client = new Client({
    cloud: {
        id: process.env.CLOUD_ID,
    },
    auth: {
        username: process.env.CLOUD_USERNAME,
        password: process.env.CLOUD_PASSWORD,
    },
});

module.exports = client;
