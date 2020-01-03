const dotenv = require("dotenv");
dotenv.config();

const { client } = require("./postgres");
client.initialize();
const { startServer } = require("./server");
startServer();
