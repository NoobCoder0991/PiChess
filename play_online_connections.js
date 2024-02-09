function handlePlayOnlineConnections(online) {
  var onlineRequests = [];
  var onlinePlayers = [];
  var roomCount = 1;

  online.on("connection", (socket) => {
    socket.on("ready", (data) => {
      let match = onlinePlayers.find((obj) => obj.url == data.url);
      if (match) {
        socket.join(match.socket.room);
        socket.room = match.socket.room;
        socket.countDown = match.socket.countDown;
        socket.oppositeSocket = match.socket.oppositeSocket;
        socket.oppositeSocket.oppositeSocket = socket;
        socket.remainingTime = match.socket.remainingTime;
        socket.startTime = match.socket.startTime;
        match.socket = socket;
        socket.emit("ready-ok");
      } else if (onlinePlayers.length % 2 == 0)
        onlinePlayers.push({ socket: socket, url: data.url });
      else {
        let roomName = `room${roomCount}`;
        onlinePlayers.push({ socket: socket, url: data.url });
        let len = onlinePlayers.length;
        let socket1 = onlinePlayers[len - 2].socket;
        let socket2 = onlinePlayers[len - 1].socket;

        socket1.join(roomName);
        socket2.join(roomName);

        socket1.room = roomName;
        socket2.room = roomName;
        socket1.startTime = new Date().getTime();
        socket2.startTime = new Date().getTime();
        socket1.remainingTime = 600000;
        socket2.remainingTime = 600000;

        socket1.oppositeSocket = socket2;
        socket2.oppositeSocket = socket1;

        if (data.color == 1) {
          socket1.countDown = false;
          socket2.countDown = true;
        } else {
          socket1.countDown = true;
          socket2.countDown = false;
        }

        roomCount++;
        socket1.emit("ready-ok");
        socket2.emit("ready-ok");
      }

      socket.on("updateTime", (data) => {
        if (socket.countDown) {
          socket.remainingTime =
            socket.remainingTime - (new Date().getTime() - socket.startTime);
        }

        socket.startTime = new Date().getTime();

        socket.emit("updateTimeResponce", {
          myTime: socket.remainingTime,
          oppositeTime: socket.oppositeSocket.remainingTime,
        });
      });

      socket.on("whitePlayedMove", (move) => {
        online.to(socket.room).emit("whiteResponce", move);
        socket.countDown = false;
        socket.oppositeSocket.countDown = true;
      });
      socket.on("blackPlayedMove", (move) => {
        online.to(socket.room).emit("blackResponce", move);
        socket.countDown = false;
        socket.oppositeSocket.countDown = true;
      });

      socket.on("save-board-data-online", (data) => {
        const requestData = JSON.parse(data);
        let match = onlinePlayers.find((obj) => obj.url == requestData.url);
        match.game_details = requestData;
      });

      socket.on("fetch-data-request-online", (data) => {
        let match = onlinePlayers.find((obj) => obj.url == data.url);

        socket.emit("fetch-data-responce-online", match.game_details);
      });
    });
  });
}

module.exports = { handlePlayOnlineConnections };
