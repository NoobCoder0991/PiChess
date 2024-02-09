const { spawn } = require("child_process");
const helper_functions = require("./helper_functions");

async function stockfish_ouput(fenPosition, depth) {
  const fileLocation =
    "C:/Users/shafa/Downloads/stockfish/stockfish-windows-x86-64-avx2.exe";
  const stockfish = spawn(fileLocation);
  let bestMove;

  stockfish.stdout.on("data", async (data) => {
    const lines = (await data.toString()).split("\n");
    for (const line of lines) {
      if (line.startsWith("bestmove")) {
        bestMove = line.split(" ")[1];
        // Emit or handle the best move here
        break; // Exit loop once best move is found
      }
    }
  });

  stockfish.stdin.write(`position fen ${fenPosition}\n`);
  stockfish.stdin.write(`go depth ${depth}\n`);
  stockfish.stdin.end();

  // Return a promise if you need to wait for the best move
  return new Promise((resolve, reject) => {
    // Resolve with the best move when available
    stockfish.on("close", () => {
      resolve(decodeBestMove(bestMove));
    });
  });
}

function decodeBestMove(algebraicNotation) {
  const files = "abcdefgh";
  const ranks = "87654321";

  // Extract the file and rank of the starting square
  const startFile = algebraicNotation[0];
  const startRank = algebraicNotation[1];

  // Extract the file and rank of the target square
  const targetFile = algebraicNotation[2];
  const targetRank = algebraicNotation[3];

  // Convert file and rank to indices
  const startIndex = files.indexOf(startFile) + ranks.indexOf(startRank) * 8;
  const targetIndex = files.indexOf(targetFile) + ranks.indexOf(targetRank) * 8;

  return { startIndex, targetIndex, flag: 10 };
}

function handleStockfishConnections(io, app) {
  var connected = [];
  io.on("connection", (socket) => {
    socket.on("play-stockfish-request", (data) => {
      const url = helper_functions.generateURL(8);
      app.get("/play-stockfish/" + url, (req, res) => {
        res.sendFile(__dirname + "/public/stockfish.html");
      });
      socket.emit("play-stockfish-responce", { url: "/play-stockfish/" + url });
    });
  });

  const stockfishNamespace = io.of("/play-stockfish");
  stockfishNamespace.on("connection", (socket) => {
    socket.on("fetch-data-request-stockfish", (data) => {
      let match = connected.find((obj) => obj.url == data.url);
      if (match) {
        socket.emit("fetch-data-responce-stockfish", match.game_details);
      } else {
        connected.push({ socket: socket, url: data.url });
        socket.emit("fetch-data-responce-stockfish", {});
      }
    });

    socket.on("save-board-data", (data) => {
      const requestData = JSON.parse(data);
      let match = connected.find((obj) => obj.url == requestData.url);
      if (match) {
        match.game_details = requestData;
      }
    });

    socket.on("fetch-move", (data) => {
      const fen = data.fen,
        depth = data.depth;
      stockfish_ouput(fen, depth).then((data) => {
        console.log("Move", data);
        socket.emit("fetch-move-responce", data);
      });
    });
  });
}

module.exports = { handleStockfishConnections };
