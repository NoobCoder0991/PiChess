// const { spawn } = require("child_process");
const helper_functions = require("./helper_functions");

// async function stockfish_ouput(fenPosition, depth) {
//   return new Promise((resolve, reject) => {
//     const fileLocation =
//       "C:/Users/shafa/Downloads/stockfish/stockfish-windows-x86-64-avx2.exe";
//     const stockfish = spawn(fileLocation);
//     let bestMove;

//     stockfish.stdout.on("data", async (data) => {
//       const lines = (await data.toString()).split("\n");
//       for (const line of lines) {
//         if (line.startsWith("bestmove")) {
//           bestMove = line.split(" ")[1];
//           // bestMove = bestMove.substring(0, bestMove.length);
//           console.log(bestMove);
//           console.log(bestMove.length);

//           // Emit or handle the best move here
//           break; // Exit loop once best move is found
//         }
//       }
//     });

//     stockfish.stdin.write(`position fen ${fenPosition}\n`);
//     stockfish.stdin.write(`go depth ${depth}\n`);
//     stockfish.stdin.end();

//     // Return a promise if you need to wait for the best move
//     // Resolve with the best move when available
//     stockfish.on("close", () => {
//       resolve(decodeBestMove(bestMove));
//     });
//   });
// }
// function decodeBestMove(algebraicNotation) {
//   const files = "abcdefgh";
//   const ranks = "87654321";

//   // Check if the move is a castling move
//   if (algebraicNotation === "O-O") {
//     // King-side castling for white
//     return {
//       startSquare: 60,
//       targetSquare: 62,
//       isCastle: true,
//       isPromotion: false,
//       capturePiece: 0,
//       castleStart: 63,
//       castleEnd: 60,
//     }; // Assuming standard board indexing
//   } else if (algebraicNotation === "O-O-O") {
//     // Queen-side castling for white
//     return {
//       startSquare: 60,
//       targetSquare: 58,
//       isCastle: true,
//       isPromotion: false,
//       capturePiece: 0,
//       castleStart: 56,
//       castleEnd: 59,
//     }; // Assuming standard board indexing
//   } else if (algebraicNotation === "o-o") {
//     // King-side castling for black
//     return {
//       startSquare: 4,
//       targetSquare: 6,
//       isCastle: true,
//       isPromotion: false,
//       capturePiece: 0,
//       castleStart: 7,
//       castleEnd: 5,
//     }; // Assuming standard board indexing
//   } else if (algebraicNotation === "o-o-o") {
//     // Queen-side castling for black
//     return {
//       startSquare: 4,
//       targetSquare: 2,
//       isCastle: true,
//       isPromotion: false,
//       capturePiece: 0,
//       castleStart: 0,
//       castleEnd: 3,
//     }; // Assuming standard board indexing
//   }

//   // Extract the file and rank of the starting square
//   const startFile = algebraicNotation[0];
//   const startRank = algebraicNotation[1];

//   // Extract the file and rank of the target square
//   const targetFile = algebraicNotation[2];
//   const targetRank = algebraicNotation[3];

//   // Convert file and rank to indices
//   const startIndex = files.indexOf(startFile) + ranks.indexOf(startRank) * 8;
//   const targetIndex = files.indexOf(targetFile) + ranks.indexOf(targetRank) * 8;

//   // Check if the move is a promotion move
//   if (algebraicNotation[4] >= "a" && algebraicNotation <= "z") {
//     // Promotion move, extract promotion piece and update the flag accordingly
//     const promotionPiece = algebraicNotation[4];
//     let promotionFlag;
//     switch (promotionPiece) {
//       case "q": // Queen promotion
//         promotionFlag = 10;
//         break;
//       case "r": // Rook promotion
//         promotionFlag = 6;
//         break;
//       case "b": // Bishop promotion
//         promotionFlag = 4;
//         break;
//       case "n": // Knight promotion
//         promotionFlag = 3;
//         break;
//       default:
//         promotionFlag = 0; // No promotion specified
//     }
//     return {
//       startSquare: startIndex,
//       targetSquare: targetIndex,
//       isCastle: false,
//       isPromotion: true,
//       promotionPiece: promotionFlag,
//     };
//   }

//   // Regular move
//   return {
//     startSquare: startIndex,
//     targetSquare: targetIndex,
//     isCastle: false,
//     isPromotion: false,
//     isEnPassant: false,
//   };
// }

function handleStockfishConnections(io, app) {
  return;
  var connected = [];
  io.of("/play").on("connection", (socket) => {
    socket.on("play-stockfish-request", (data) => {
      const url = helper_functions.generateURL(8);
      app.get("/play/stockfish/" + url, (req, res) => {
        res.sendFile(
          "C:/Users/shafa/Desktop/BIG_FOLDER/Chess Pro Test - 4/public/src/HTML_Files/stockfish.html"
        );
      });
      socket.emit("play-stockfish-responce", { url: "/play/stockfish/" + url });
    });
  });

  const stockfishNamespace = io.of("/play/stockfish");
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
      stockfish_ouput(fen, depth)
        .then((data) => {
          socket.emit("fetch-move-responce", data);
        })
        .catch((err) => {
          console.log("error occured");
        });
    });
  });
}

console.log("At the End");

module.exports = { handleStockfishConnections };
