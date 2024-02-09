const helper_functions = require("./helper_functions");

function handlePlayMyComputerRequests(io, app) {
  var connected = [];
  io.on("connection", (socket) => {
    socket.on("play-mycomputer-request", (data) => {
      const url = helper_functions.generateURL(8);
      app.get("/play-computer/" + url, (req, res) => {
        res.sendFile(__dirname + "/public/m-engine.html");
      });
      socket.emit("play-mycomputer-responce", { url: "/play-computer/" + url });
    });
  });

  const computerNamespace = io.of("/play-computer");
  computerNamespace.on("connection", (socket) => {
    console.log("connected to computer namespace");
    socket.on("fetch-data-request", (data) => {
      let match = connected.find((obj) => obj.url == data.url);
      if (match) {
        socket.emit("fetch-data-responce", match.game_details);
      } else {
        connected.push({ socket: socket, url: data.url });
        socket.emit("fetch-data-responce", {});
      }
    });

    socket.on("save-board-data", (data) => {
      const requestData = JSON.parse(data);
      let match = connected.find((obj) => obj.url == requestData.url);
      if (match) {
        match.game_details = requestData;
      }
    });
  });
}

module.exports = { handlePlayMyComputerRequests };
