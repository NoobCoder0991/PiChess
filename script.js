// Required Modules
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const bodyParser = require("body-parser");
const playOnlineConnections = require("./play_online_connections");
const playMycomputerConnections = require("./play_mycomputer_connections");
const stockfishConnections = require("./stockfish_connections");
const helper_functions = require("./helper_functions");

app.use(bodyParser.json());
app.use(express.static("public"));
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

/**Main */
var onlineRequests = [];

io.on("connection", (socket) => {
  socket.on("play-online-request", (data) => {
    if (onlineRequests.length == 0) {
      onlineRequests.push(socket);
    } else {
      let url1 = helper_functions.generateURL(8);
      let url2 = helper_functions.generateURL(8);
      onlineRequests[0].emit("play-online-responce", { url: url1 });
      socket.emit("play-online-responce", { url: url2 });

      app.get("/" + url1, (req, res) => {
        res.sendFile(__dirname + "/public/main1.html");
      });
      app.get("/" + url2, (req, res) => {
        res.sendFile(__dirname + "/public/main2.html");
      });
      onlineRequests = [];
    }
  });
  socket.on("cancel-play-online-request", (data) => {
    let index = onlineRequests.indexOf(socket);
    if (index != -1) {
      onlineRequests.splice(index, 1);
    }
  });
});

const online = io.of("/playOnline");

playOnlineConnections.handlePlayOnlineConnections(online);
playMycomputerConnections.handlePlayMyComputerRequests(io, app);
stockfishConnections.handleStockfishConnections(io, app);

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
