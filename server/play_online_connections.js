const db = require("../database/dbmethods");
const chess = require("./chess");
const helper_functions = require("./helper_functions");
function handlePlayOnlineConnections(online) {
  var onlinePlayers = [];

  var roomCount = 1;

  online.on("connection", (socket) => {
    socket.on("ready", (data) => {
      let match = onlinePlayers.find((obj) => obj.url == data.url);
      if (match) {
        retrieveSocketData(socket, match);
        socket.emit("ready-ok", {
          myInfo: socket.userInfo,
          opponentInfo: socket.oppositeSocket.userInfo,
        });

        socket.oppositeSocket.emit("ready-ok", null);
        if (socket.gameOver || socket.oppositeSocket.gameOver) {
          socket.emit("gameover", { ok: false });
        } else {
          updateTimer(socket);
        }
      } else if (onlinePlayers.length % 2 == 0) {
        socket.userid = data.userid;
        socket.url = data.url;
        onlinePlayers.push({
          socket: socket,
          url: data.url,
          userid: socket.userid,
        });
      } else {
        let roomName = `room${roomCount}`;
        socket.userid = data.userid;
        socket.url = data.url;
        onlinePlayers.push({
          socket: socket,
          url: data.url,
          userid: socket.userid,
        });
        let len = onlinePlayers.length;
        let socket1 = onlinePlayers[len - 2].socket;
        let socket2 = onlinePlayers[len - 1].socket;

        socket1.join(roomName);
        socket2.join(roomName);

        socket1.room = roomName;
        socket2.room = roomName;
        socket1.startTime = new Date().getTime();
        socket2.startTime = new Date().getTime();
        socket1.remainingTime = 30000;
        socket2.remainingTime = 30000;

        socket1.oppositeSocket = socket2;
        socket2.oppositeSocket = socket1;

        if (data.color == 1) {
          socket1.countDown = false;
          socket2.countDown = false;
          socket2.color = 1;
          socket1.color = -1;
          onlinePlayers[len - 1].game_details = {
            board: chess.startPos(1),
            pgn: "",
            turn: 1,
            Moves: [],
            whiteCastle: [true, true],
            blackCastle: [true, true],
            enPassantForWhite: [false, -1],
            enPassantForBlack: [true, -1],
          };
          onlinePlayers[len - 2].game_details = {
            board: chess.startPos(-1),
            pgn: "",
            turn: 1,
            Moves: [],
            whiteCastle: [true, true],
            blackCastle: [true, true],
            enPassantForWhite: [false, -1],
            enPassantForBlack: [true, -1],
          };
          onlinePlayers[len - 1].socket.game_details = {
            board: chess.startPos(1),
            pgn: "",
            turn: 1,
            Moves: [],
            whiteCastle: [true, true],
            blackCastle: [true, true],
            enPassantForWhite: [false, -1],
            enPassantForBlack: [true, -1],
          };
          onlinePlayers[len - 2].socket.game_details = {
            board: chess.startPos(-1),
            pgn: "",
            turn: 1,
            Moves: [],
            whiteCastle: [true, true],
            blackCastle: [true, true],
            enPassantForWhite: [false, -1],
            enPassantForBlack: [true, -1],
          };
        } else {
          socket1.countDown = false;
          socket2.countDown = false;
          socket1.color = 1;
          socket2.color = -1;
          onlinePlayers[len - 2].game_details = {
            board: chess.startPos(1),
            pgn: "",
            turn: 1,
            Moves: [],
            whiteCastle: [true, true],
            blackCastle: [true, true],
            enPassantForWhite: [false, -1],
            enPassantForBlack: [false, -1],
          };
          onlinePlayers[len - 1].game_details = {
            board: chess.startPos(-1),
            pgn: "",
            turn: 1,
            Moves: [],
            whiteCastle: [true, true],
            blackCastle: [true, true],
            enPassantForWhite: [false, -1],
            enPassantForBlack: [false, -1],
          };
          onlinePlayers[len - 2].socket.game_details = {
            board: chess.startPos(1),
            pgn: "",
            turn: 1,
            Moves: [],
            whiteCastle: [true, true],
            blackCastle: [true, true],
            enPassantForWhite: [false, -1],
            enPassantForBlack: [false, -1],
          };
          onlinePlayers[len - 1].socket.game_details = {
            board: chess.startPos(-1),
            pgn: "",
            turn: 1,
            Moves: [],
            whiteCastle: [true, true],
            blackCastle: [true, true],
            enPassantForWhite: [false, -1],
            enPassantForBlack: [false, -1],
          };
        }

        roomCount++;
        const userInfo1 = db.findOne("game_info", {
          userid: socket1.userid,
        }).info;
        const userInfo2 = db.findOne("game_info", {
          userid: socket2.userid,
        }).info;
        socket1.userInfo = userInfo1;
        socket2.userInfo = userInfo2;

        socket1.gameOver = false;
        socket2.gameOver = false;

        socket1.emit("ready-ok", {
          myInfo: userInfo1,
          opponentInfo: userInfo2,
        });
        socket2.emit("ready-ok", {
          myInfo: userInfo2,
          opponentInfo: userInfo1,
        });

        updateTimer(socket1);
        updateTimer(socket2);
      }

      socket.on("whitePlayedMove", (data) => {
        if (socket.gameOver) {
          return;
        }

        const url = socket.url;
        const oppositeUrl = socket.oppositeSocket.url;
        let match = onlinePlayers.find((obj) => obj.url == url);
        let oppositeMatch = onlinePlayers.find((obj) => obj.url == oppositeUrl);
        let gameState = match.game_details;
        let oppositeGameState = oppositeMatch.game_details;
        const userid = match.userid;
        const opponentUserid = oppositeMatch.userid;
        if (gameState.turn == -1) {
          /**cheating (against turn)*/
          return;
        }
        let legal = chess.isLegal(
          gameState.board,
          1,
          1,
          gameState.whiteCastle,
          gameState.blackCastle,
          gameState.enPassantForWhite,
          gameState.enPassantForBlack,
          data.move
        );
        if (legal.ok) {
          let transformedMove = chess.transformMove(data.move);
          online.to(socket.room).emit("whiteResponce", transformedMove);
          if (socket.game_details.Moves.length) {
            socket.countDown = false;
            socket.oppositeSocket.countDown = true;
            socket.remainingTime += 2000;
          }
          match.game_details.Moves.push(data.move);
          match.game_details.pgn += legal.move + " "
          match.socket.game_details.Moves.push(data.move);
          match.socket.game_details.pgn += legal.move + " ";
          oppositeMatch.game_details.Moves.push(chess.transformMove(data.move));
          oppositeMatch.game_details.pgn += legal.move + " ";
          oppositeMatch.socket.game_details.Moves.push(
            chess.transformMove(data.move)
          );
          oppositeMatch.socket.game_details.pgn += legal.move + " "
          let result = chess.playMove(gameState.board, data.move, 1, 1, gameState.whiteCastle, gameState.blackCastle, gameState.enPassantForWhite, gameState.enPassantForBlack, true);
          chess.playMove(oppositeGameState.board, transformedMove, 1, -1, oppositeGameState.whiteCastle, oppositeGameState.blackCastle, oppositeGameState.enPassantForWhite, oppositeGameState.enPassantForBlack);
          chess.playMove(socket.game_details.board, data.move, 1, 1, socket.game_details.whiteCastle, socket.game_details.blackCastle, socket.game_details.enPassantForWhite, socket.game_details.enPassantForBlack, true);
          chess.playMove(socket.oppositeSocket.game_details.board, transformedMove, 1, -1, socket.oppositeSocket.game_details.whiteCastle, socket.oppositeSocket.game_details.blackCastle, socket.oppositeSocket.game_details.enPassantForWhite, socket.oppositeSocket.game_details.enPassantForBlack, true);
          match.game_details.turn = -1;
          match.socket.game_details.turn = -1;
          oppositeMatch.game_details.turn = -1;
          oppositeMatch.socket.game_details.turn = -1;

          if (result.gameOver) {

            if (result.result == "checkmate") {
              updateUserInfo(
                socket,
                userid,
                opponentUserid,
                gameState,
                oppositeGameState,
                1,
                result.result
              );
            } else if (result.result == "stalemate") {
              updateUserInfo(
                socket,
                (socket.color == 1 ? userid : opponentUserid),
                (socket.color == 1 ? opponentUserid : userid),
                (socket.color == 1 ? gameState : oppositeGameState),
                (socket.color == 1 ? oppositeGameState : gameState),

                0,
                result.result
              );
            }
          }
        } else {
          socket.emit("played-illegal-move", {
            move: data.move,
            cRights: chess.storeCastlingRights(
              gameState.whiteCastle,
              gameState.blackCastle
            ),
            eRights: chess.storeEnPassantRights(
              gameState.enPassantForWhite,
              gameState.enPassantForBlack
            ),
          });
        }
      });
      socket.on("blackPlayedMove", (data) => {
        if (socket.gameOver) {
          return;
        }

        const url = data.url;
        const oppositeUrl = socket.oppositeSocket.url;
        let match = onlinePlayers.find((obj) => obj.url == url);
        let oppositeMatch = onlinePlayers.find((obj) => obj.url == oppositeUrl);
        let gameState = match.game_details;
        let oppositeGameState = oppositeMatch.game_details;
        const userid = match.userid;
        const opponentUserid = oppositeMatch.userid;
        if (gameState.turn == 1) {
          /**cheating (against turn)*/
          return;
        }
        let legal = chess.isLegal(
          gameState.board,
          -1,
          -1,
          gameState.whiteCastle,
          gameState.blackCastle,
          gameState.enPassantForWhite,
          gameState.enPassantForBlack,
          data.move
        );

        if (legal.ok) {
          console.log("black played legal move");

          let transformedMove = chess.transformMove(data.move);
          online.to(socket.room).emit("blackResponce", transformedMove);
          if (socket.game_details.Moves.length) {
            socket.countDown = false;
            socket.oppositeSocket.countDown = true;
          }
          if (socket.game_details.Moves.length > 1) {
            socket.remainingTime += 2000;
          }
          match.game_details.Moves.push(data.move);
          match.game_details.pgn += legal.move + " "
          match.socket.game_details.Moves.push(data.move);
          match.socket.game_details.pgn += legal.move + " ";
          oppositeMatch.game_details.Moves.push(transformedMove);
          oppositeMatch.game_details.pgn += legal.move + " ";
          oppositeMatch.socket.game_details.Moves.push(transformedMove);
          oppositeMatch.socket.game_details.pgn += legal.move + " ";

          let result = chess.playMove(gameState.board, data.move, -1, -1, gameState.whiteCastle, gameState.blackCastle, gameState.enPassantForWhite, gameState.enPassantForBlack, true);
          chess.playMove(oppositeGameState.board, transformedMove, -1, 1, oppositeGameState.whiteCastle, oppositeGameState.blackCastle, oppositeGameState.enPassantForWhite, oppositeGameState.enPassantForBlack);
          chess.playMove(socket.game_details.board, data.move, -1, -1, socket.game_details.whiteCastle, socket.game_details.blackCastle, socket.game_details.enPassantForWhite, socket.game_details.enPassantForBlack, true);
          chess.playMove(socket.oppositeSocket.game_details.board, transformedMove, -1, 1, socket.oppositeSocket.game_details.whiteCastle, socket.oppositeSocket.game_details.blackCastle, socket.oppositeSocket.game_details.enPassantForWhite, socket.oppositeSocket.game_details.enPassantForBlack, true);

          match.game_details.turn = 1;
          match.socket.game_details.turn = 1;
          oppositeMatch.game_details.turn = 1;
          oppositeMatch.socket.game_details.turn = 1;
          if (result.gameOver) {

            if (result.result == "checkmate") {
              updateUserInfo(
                socket,
                userid,
                opponentUserid,
                gameState,
                oppositeGameState,
                -1,
                result.result
              );
            } else if (result.result == "stalemate") {
              updateUserInfo(
                socket,
                (socket.color == 1 ? userid : opponentUserid),
                (socket.color == 1 ? opponentUserid : userid),
                (socket.color == 1 ? gameState : oppositeGameState),
                (socket.color == 1 ? oppositeGameState : gameState),
                0,
                result.result
              );
            }
          }
        } else {
          /**cheating detected(illegal move) */
          console.log("black played Ilegal move");
          socket.emit("played-illegal-move", {
            move: data.move,
            cRights: chess.storeCastlingRights(
              gameState.whiteCastle,
              gameState.blackCastle
            ),
            eRights: chess.storeEnPassantRights(
              gameState.enPassantForWhite,
              gameState.enPassantForBlack
            ),
          });
        }
      });

      socket.on("fetch-data-request-online", (data) => {
        let match = onlinePlayers.find((obj) => obj.url == data.url);

        socket.emit("fetch-data-responce-online", match.game_details);
      });

      socket.on("disconnect", () => {
        socket.disconnected = true;
        socket.oppositeSocket.emit("opponent-lost-connection");
      });

      socket.on('resign', data => {
        const userid = socket.userid;
        const opponentUserid = socket.oppositeSocket.userid
        updateUserInfo(socket.oppositeSocket, opponentUserid, userid, socket.oppositeSocket.game_details, socket.game_details, -socket.color, "Resignation"
        );

      })

      socket.on('draw', data => {
        if (socket.game_details.Moves.length < 2) {
          return;
        }
        socket.offeredDraw = true;
        socket.oppositeSocket.emit("draw-offer");
        setTimeout(() => {

          socket.offeredDraw = false;
        }, 5000);
      })
      socket.on('draw-acknowledge', data => {
        if (socket.oppositeSocket.offeredDraw) {

          const userid = socket.userid;
          const opponentUserid = socket.oppositeSocket.userid
          updateUserInfo((socket.color == 1 ? socket : socket.oppositeSocket), (socket.color == 1 ? userid : opponentUserid), (socket.color == 1 ? opponentUserid : userid), (socket.color == 1 ? socket.game_details : socket.oppositeSocket.game_details), (socket.color == 1 ? socket.oppositeSocket.game_details : socket.game_details), 0, "Mutual Settlement"
          );
        }
      })
      socket.on('draw-decline', data => {
        socket.oppositeSocket.offeredDraw = false;
      })
    });
  });
}

function retrieveSocketData(socket, match) {
  socket.join(match.socket.room);
  socket.room = match.socket.room;
  socket.color = match.socket.color;
  socket.url = match.socket.url;
  socket.gameOver = match.socket.gameOver;
  socket.game_details = match.socket.game_details;
  socket.userInfo = match.socket.userInfo;
  socket.userid = match.socket.userid;
  socket.countDown = match.socket.countDown;
  socket.oppositeSocket = match.socket.oppositeSocket;
  socket.oppositeSocket.oppositeSocket = socket;
  socket.remainingTime = match.socket.remainingTime;
  socket.startTime = match.socket.startTime;
  match.socket = socket;
}

function updateUserInfo(
  socket,
  winnerId,
  loserId,
  winnerGameState,
  loseGameState,
  winner,
  reason
) {
  socket.gameOver = true;
  socket.oppositeSocket.gameOver = true;
  let perspective = socket.color
  let winnerRatingChange, loserRatingChange;
  let winnerInfo = db.findOne("game_info", { userid: winnerId }).info;
  let loserInfo = db.findOne("game_info", { userid: loserId }).info;
  let simplifiedWinnerGame = "";
  for (move of winnerGameState.Moves) {
    let m = chess.simplifyMoveNotation(move, perspective);
    simplifiedWinnerGame += m;
    simplifiedWinnerGame += " ";
  }
  let simplifiedLoserGame = "";
  for (move of loseGameState.Moves) {
    let m = chess.simplifyMoveNotation(move, -perspective);
    simplifiedLoserGame += m;
    simplifiedLoserGame += " ";
  }
  const date = helper_functions.getDate();
  const resultFen = chess.boardToFen(winnerGameState.board, perspective).split(" ")[0];
  winnerInfo.games.push(
    JSON.stringify({
      game: simplifiedWinnerGame,
      pgn: winnerGameState.pgn,
      perspective: perspective,
      myId: winnerId,
      opponentId: loserId,
      winnerUsername: winnerInfo.username,
      loserUsername: loserInfo.username,
      winnerRating: winnerInfo.rating,
      loserRating: loserInfo.rating,
      winner: winner,
      date: date,
      reason: reason,
      resultFen
    })
  );
  loserInfo.games.push(
    JSON.stringify({
      game: simplifiedLoserGame,
      pgn: loseGameState.pgn,
      perspective: -perspective,
      myId: loserId,
      opponentId: winnerId,
      winnerUsername: winnerInfo.username,
      loserUsername: loserInfo.username,
      winnerRating: winnerInfo.rating,
      loserRating: loserInfo.rating,
      winner: winner,
      date: date,
      reason: reason,
      resultFen
    })
  );

  if (winner) {
    // Constants
    const K_FACTOR1 = 800 / winnerInfo.total_games;
    const K_FACTOR2 = 800 / loserInfo.total_games;

    // Calculate expected scores
    const winnerExpectedScore =
      1 / (1 + 10 ** ((loserInfo.rating - winnerInfo.rating) / 400));
    const loserExpectedScore = 1 - winnerExpectedScore;

    // Update ratings
    winnerRatingChange = Math.round(K_FACTOR1 * (1 - winnerExpectedScore));
    loserRatingChange = Math.round(K_FACTOR2 * (0 - loserExpectedScore));

    // Return updated user info

    winnerInfo.rating = Math.max(250, winnerInfo.rating + winnerRatingChange);
    loserInfo.rating = Math.max(250, loserInfo.rating + loserRatingChange);
    winnerInfo.games_won++;
    loserInfo.games_lost++;
  }

  winnerInfo.total_games++;
  loserInfo.total_games++;

  if (winner == 1) {
    winnerInfo.games_won_as_white++;
  } else if (winner == -1) {
    winnerInfo.games_won_as_black++;
  } else {
    winnerInfo.games_draw++;
    loserInfo.games_draw++;
  }

  db.updateOne("game_info", { userid: winnerId }, "info", winnerInfo);
  db.updateOne("game_info", { userid: loserId }, "info", loserInfo);
  winnerInfo.ratingChange = winnerRatingChange;
  loserInfo.ratingChange = loserRatingChange;
  socket.emit("gameover", {
    winner: winner,
    reason: reason,
    winnerInfo: winnerInfo,
    loserInfo: loserInfo,
  });
  socket.oppositeSocket.emit("gameover", {
    winner: winner,
    reason: reason,
    winnerInfo: winnerInfo,
    loserInfo: loserInfo,
  });
}

function updateTimer(socket) {
  if (socket.disconnected) {
    return;
  }

  if (socket.gameOver) {
    socket.oppositeSocket.gameOver = true;
    return;
  }

  if (socket.remainingTime <= 0) {
    socket.remainingTime = 0;

    updateUserInfo(socket.oppositeSocket, socket.oppositeSocket.userid, socket.userid, socket.oppositeSocket.game_details, socket.game_details, -socket.color, "Timeout")
    return;
  }

  if (socket.countDown) {
    socket.remainingTime =
      socket.remainingTime - (new Date().getTime() - socket.startTime);
  }

  socket.startTime = new Date().getTime();

  socket.emit("updateTimeResponce", {
    myTime: socket.remainingTime,
    oppositeTime: socket.oppositeSocket.remainingTime,
  });

  setTimeout(() => {
    updateTimer(socket);
  }, 50);
}
module.exports = { handlePlayOnlineConnections };
