var socket = io("/play/computer");

var pieceLocations = [];

let Depth = 4;
let moveSound = new Audio("../../assets/sound-files/lichess-move.ogg");
let captureSound = new Audio("../../assets/sound-files/lichess-capture.ogg");
let background = new Audio("../../assets/sound-files/background.mp3");
let castleSound = new Audio("../../assets/sound-files/castle.mp3");
let promotionSound = new Audio("../../assets/sound-files/promote.mp3");
let checkSound = new Audio("../../assets/sound-files/move-check.wav");
let gameEnd = new Audio("../../assets/sound-files/end.webm");
let gameStart = new Audio("../../assets/sound-files/gameStart-alt.mp3");
let warningSound = new Audio("../../assets/sound-files/warning.mp3")

let chessboard = document.getElementById("chessBoard");

const urlParams = new URLSearchParams(window.location.search);
var perspective = parseInt(urlParams.get("perspective"));

if (!perspective) {
  perspective = 1;
}

var str;

str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq";
// str = "kbK5/pp6/1P6/8/8/8/8/R7 w"; //good puzzle(mate in 2)
// str = "8/8/8/2P3R1/5B2/2rP1p2/p1P1PP2/RnQ1K2k w Q"; //Best Mate in 2 i have ever seen

let enPassantForWhite = [false, -1];
let enPassantForBlack = [false, -1];
let whiteCastle = [false, false];
let blackCastle = [false, false];

var board = setUpBoard(str, perspective);

var transpositionTable = new TranspositionTable();

var bitboard = new Bitboard();
bitboard._initializeBitboards();

function setUpBoard(position, perspective) {
  let board = generateBoard(position, perspective);
  putPieceOnBoard(board);
  return board;
}


let chessPieces = document.getElementsByClassName("piece");
let squares = document.getElementsByClassName("square");
createCirclesOnSquares();
var turn = 1;
var moveCount = 0;
var Moves = [];
var moveTypes = [];
var pointer = 0;
var activeMoves = [];
// //initial indices of kings
var indexOfWhiteKing = FindIndexOfWhiteKing(str);
var indexOfBlackKing = FindIndexOfBlackKing(str);

var whiteOccupiedSquares = whiteSquares(str);
var blackOccupiedSquares = blackSquares(str);




let nodesEvaluated = 0;
let transpositionsCount = 0;
var gameOver = false;
//Generalized maps for the pieces
var whitePawnMap = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 2, 3, 3, 2, 1, 1, 0, 0, 0, 2, 2, 0, 0, 0, 1, -1, 2, 3, 3, 2, 1, -1, 1, -1, 3, 2, 2, 3, 1, -1, 3, 3, 1, 1, 1, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,];
var blackPawnMap = [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 1, 1, 1, 1, 3, 3, -1, 1, 3, 2, 2, 3, 1, -1, -1, 1, 2, 3, 3, 2, 1, -1, 0, 0, 0, 2, 2, 0, 0, 0, 1, 1, 2, 3, 3, 2, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,];

var whiteKnightMap = [-6, -5, -4, -3, -3, -4, -5, -6, -5, -3, 0, 1, 1, 0, -3, -5, -4, 1, 2, 3, 3, 2, 1, -4, -3, 0, 3, 4, 4, 3, 0, -3, -3, 1, 3, 4, 4, 3, 1, -3, -4, 0, 2, 3, 3, 2, 0, -4, -5, -3, 0, 0, 0, 0, -3, -5, -6, -5, -4, -3, -3, -4, -5, -6,];
var blackKnightMap = [-6, -5, -4, -3, -3, -4, -5, -6, -5, -3, 0, 1, 1, 0, -3, -5, -4, 1, 2, 3, 3, 2, 1, -4, -3, 0, 3, 4, 4, 3, 0, -3, -3, 1, 3, 4, 4, 3, 1, -3, -4, 0, 2, 3, 3, 2, 0, -4, -5, -3, 0, 0, 0, 0, -3, -5, -6, -5, -4, -3, -3, -4, -5, -6,];

var whiteBishopMap = [-4, -3, -2, -1, -1, -2, -3, -4, -3, 0, 1, 2, 2, 1, 0, -3, -2, 1, 2, 3, 3, 2, 1, -2, -1, 2, 3, 4, 4, 3, 2, -1, -1, 2, 3, 4, 4, 3, 2, -1, -2, 1, 1, 2, 2, 1, 1, -2, -3, 0, 0, 0, 0, 0, 0, -3, -4, -3, -2, -1, -1, -2, -3, -4,];

var blackBishopMap = [-4, -3, -2, -1, -1, -2, -3, -4, -3, 0, 0, 0, 0, 0, 0, -3, -2, 1, 1, 1, 1, 1, 1, -2, -1, 2, 2, 2, 2, 2, 2, -1, -1, 2, 2, 2, 2, 2, 2, -1, -2, 1, 1, 1, 1, 1, 1, -2, -3, 0, 1, 2, 2, 1, 0, -3, -4, -3, -2, -1, -1, -2, -3, -4,];

var whiteRookMap = [0, 0, 0, 1, 1, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0,];
var blackRookMap = [0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 1, 1, 0, 0, 0,];

var whiteQueenMap = [-4, -2, -2, -1, -1, -2, -2, -4, -2, 0, 1, 1, 1, 1, 0, -2, -2, 1, 2, 2, 2, 2, 1, -2, -1, 1, 2, 3, 3, 2, 1, -1, -1, 1, 2, 3, 3, 2, 1, -1, -2, 1, 2, 2, 2, 2, 1, -2, -2, 0, 1, 1, 1, 1, 0, -2, -4, -2, -2, -1, -1, -2, -2, -4,];
var blackQueenMap = [-4, -2, -2, -1, -1, -2, -2, -4, -2, 0, 1, 1, 1, 1, 0, -2, -2, 1, 2, 2, 2, 2, 1, -2, -1, 1, 2, 3, 3, 2, 1, -1, -1, 1, 2, 3, 3, 2, 1, -1, -2, 1, 2, 2, 2, 2, 1, -2, -2, 0, 1, 1, 1, 1, 0, -2, -4, -2, -2, -1, -1, -2, -2, -4,];

var whiteKingMap = [-3, -4, -4, -5, -5, -4, -4, -3, -3, -4, -4, -5, -5, -4, -4, -3, -3, -4, -4, -5, -5, -4, -4, -3, -3, -4, -4, -5, -5, -4, -4, -3, -2, -3, -3, -4, -4, -3, -3, -2, -1, -2, -2, -2, -2, -2, -2, -1, 1, 1, 0, 0, 0, 0, 1, 1, 2, 3, 1, 1, 1, 1, 3, 2,];
var blackKingMap = [2, 3, 1, 1, 1, 1, 3, 2, 1, 1, 0, 0, 0, 0, 1, 1, -1, -2, -2, -2, -2, -2, -2, -1, -2, -3, -3, -4, -4, -3, -3, -2, -3, -4, -4, -5, -5, -4, -4, -3, -3, -4, -4, -5, -5, -4, -4, -3, -3, -4, -4, -5, -5, -4, -4, -3, -3, -4, -4, -5, -5, -4, -4, -3,];

// //
socket.emit("fetch-data-request", { url: window.location.href });
socket.on("fetch-data-responce", (data) => {
  if (data && data.board != undefined) {
    let tempMoves = Object.values(data.Moves);

    for (let i = 0; i < tempMoves.length; i++) {
      MakeMove(board, tempMoves[i], true);
    }

    if (gameOver) {
      document.getElementsByClassName("gameover-wrapper")[0].style.display =
        "none";
      chessboard.style.pointerEvents = "none";
    }

    document.getElementsByClassName("second-board")[0].style.display = "flex";
  } else {
    document.getElementsByClassName(
      "opponent-selection-board"
    )[0].style.display = "flex";
  }
});


let newGame = document.getElementsByClassName("new-game")[0];
let resignButton = document.getElementsByClassName("resign")[0];
let drawButton = document.getElementsByClassName("draw")[0];
let abortButton = document.getElementsByClassName("abort")[0];
let rematchButton = document.getElementsByClassName("rematch")[0];

newGame.addEventListener("click", (e) => {
  if (newGame.classList.contains("active-action")) {
    newGame.classList.remove("active-action");
    socket.emit("play-computer-request", null);
    socket.on("play-computer-responce", (url) => {
      window.location.href = url;
    });
  } else {
    newGame.classList.add("active-action");
    setTimeout(() => {
      newGame.classList.remove("active-action");
    }, 2000);
  }
});
resignButton.addEventListener("click", (e) => {
  if (resignButton.classList.contains("active-action")) {
    gameOver = true;
    removeBottomActions();
    document.getElementsByClassName("save-game")[0].style.display = "flex";
    document.getElementsByClassName("rematch")[0].style.display = "flex";
    gameEnd.play();
    document.getElementsByClassName("board")[0].style.pointerEvents = "none";

    printResult(true, "Black", "Resignation");
  } else {
    resignButton.classList.add("active-action");
    let ht = resignButton.innerHTML;
    setTimeout(() => {
      resignButton.classList.remove("active-action");
    }, 2000);
  }
});
drawButton.addEventListener("click", (e) => {
  if (moveCount >= 2) {
    drawButton.classList.remove("disabled");
    drawButton.classList.add("enabled");
    if (drawButton.classList.contains("active-action")) {
    } else {
      drawButton.classList.add("active-action");
      setTimeout(() => {
        drawButton.classList.remove("active-action");
      }, 2000);
    }
  }
});
abortButton.addEventListener("click", (e) => {
  if (abortButton.classList.contains("active-action")) {
    gameOver = true;
    removeBottomActions();
    document.getElementsByClassName("save-game")[0].style.display = "flex";

    document.getElementsByClassName("rematch")[0].style.display = "flex";
    gameEnd.play();
    chessboard.pointerEvents = "none";

    printResult(false, "Aborted");
  } else {
    abortButton.classList.add("active-action");
    setTimeout(() => {
      abortButton.classList.remove("active-action");
    }, 2000);
  }
});
rematchButton.addEventListener("click", (e) => {
  socket.emit("new-game-request", { perspective: -perspective });
  socket.on("new-game-responce", (data) => {
    window.location.href = data.url;
  });
});

addMoveBehaviourToPieces();

function putPieceOnBoard(board) {
  //creating elements
  let count = 0;
  for (let i = 0; i < 64; i++) {
    let squares = document.getElementsByClassName("square");

    let rect1 = squares[0].getBoundingClientRect();
    let rect2 = squares[i].getBoundingClientRect();
    if (i % 8 == 0) {
      let yCoordinate = document.createElement("div");
      yCoordinate.classList.add("yCoordinate");
      if (i % 16 == 0) {
        yCoordinate.classList.add("dark-coordinate");
      } else {
        yCoordinate.classList.add("light-coordinate");
      }
      yCoordinate.innerHTML = Rank(i);
      yCoordinate.style.transform = `translate(0px, ${rect2.top - rect1.top
        }px)`;
      chessboard.appendChild(yCoordinate);
    }

    if (Math.floor(i / 8) == 7) {
      let xCoordinate = document.createElement("div");
      xCoordinate.classList.add("xCoordinate");
      if (i % 2 == 0) {
        xCoordinate.classList.add("light-coordinate");
      } else {
        xCoordinate.classList.add("dark-coordinate");
      }
      xCoordinate.innerHTML = File(i);
      xCoordinate.style.transform = `translate(${rect2.left - rect1.left + rect1.width / 1.2
        }px, 
      ${7.6 * rect1.height}px)`;
      chessboard.appendChild(xCoordinate);
    }

    if (board[i] == 0) {
      continue;
    }
    let piece = document.createElement("img");
    piece.classList.add("piece");
    piece.src = "../../assets/image-files/piece-images/" + board[i] + ".png";

    piece.style.transform = `translate(${rect2.left - rect1.left}px, ${rect2.top - rect1.top
      }px)`;
    chessboard.appendChild(piece);
    pieceLocations.push({ domIndex: count, squareIndex: i });
    count++;
  }
}

function refreshWholeBoard() {
  let rect1 = squares[0].getBoundingClientRect();

  for (let i = 0; i < chessPieces.length; i++) {
    let element = chessPieces[i];
    let squareIndex = pieceLocations.find(
      (obj) => obj.domIndex === i
    ).squareIndex;

    if (squareIndex >= 0 && squareIndex < 64) {


      let rect2 = squares[squareIndex].getBoundingClientRect();
      element.style.transform = `translate(${rect2.left - rect1.left}px, ${rect2.top - rect1.top
        }px)`;
    }

  }

  let xCoordinate = document.getElementsByClassName("xCoordinate");
  let yCoordinate = document.getElementsByClassName("yCoordinate");
  for (let i = 0; i < 8; i++) {
    xCoordinate[i].style.transform = `translate(${squares[i].getBoundingClientRect().left - rect1.left + rect1.width / 1.2
      }px, 
      ${7.6 * rect1.height}px)`;
  }
  for (let i = 0; i < 8; i++) {
    yCoordinate[i].style.transform = `translate(0px, ${squares[8 * i].getBoundingClientRect().top - rect1.top
      }px)`;
  }


  let highlightCircles = document.getElementsByClassName('highlight-circle')
  let rect0 = squares[0].getBoundingClientRect();
  let w = parseFloat(window.getComputedStyle(highlightCircles[0]).width);
  for (let i = 0; i < 64; i++) {
    let rect = squares[i].getBoundingClientRect();
    highlightCircles[i].style.transform = `translate(${rect.left + rect.width / 2 - w / 2 - rect0.left
      }px, ${rect.top + rect.height / 2 - w / 2 - rect0.top}px)`;

  }
}

window.addEventListener("resize", (e) => {
  e.preventDefault();
  refreshWholeBoard();
});


function createCirclesOnSquares() {
  for (let i = 0; i < 64; i++) {
    let rect = squares[i].getBoundingClientRect();
    let rect0 = squares[0].getBoundingClientRect();
    let circle = document.createElement("div");
    circle.classList.add("highlight-circle");
    chessboard.appendChild(circle);

    let w = parseFloat(window.getComputedStyle(circle).width);
    circle.style.transform = `translate(${rect.left + rect.width / 2 - w / 2 - rect0.left
      }px, ${rect.top + rect.height / 2 - w / 2 - rect0.top}px)`;
  }
}

function coordinatesToIndex(arr) {
  return arr[0] + 8 * arr[1];
}

function isOutsideBoard(coordinates) {
  if (
    coordinates[0] < 0 ||
    coordinates[0] >= 8 ||
    coordinates[1] < 0 ||
    coordinates[1] >= 8
  ) {
    return true;
  } else {
    return false;
  }
}

//remove function
function removeOptions() {
  let options = document.getElementsByClassName("options");
  let len = options.length;

  for (let i = 0; i < len; i++) {
    document.getElementById("chessBoard").removeChild(options[0]);
  }
}

function generateBoard(str, perspective) {
  let board = [];
  let map = {
    R: 6,
    N: 3,
    B: 4,
    Q: 10,
    K: 2,
    P: 1,
    r: -6,
    n: -3,
    b: -4,
    q: -10,
    k: -2,
    p: -1,
  };
  let fragments = str.split(" ");

  let i = 0;

  for (char of fragments[0]) {
    if (map.hasOwnProperty(char)) {
      if (perspective == 1) {
        board[i] = map[char];
      } else {
        board[63 - i] = map[char];
      }
      i++;
    } else {
      let num = parseInt(char);

      for (j = 0; j < num; j++) {
        if (perspective == 1) {
          board[i] = 0;
        } else {
          board[63 - i] = 0;
        }
        i++;
      }
    }
  }

  if (fragments[1] != null) {
    turn = fragments[1] == "w" ? 1 : -1;
  }

  if (fragments[2] != null) {
    for (let char of fragments[2]) {
      switch (char) {
        case "K":
          whiteCastle[0] = true;
          break;
        case "Q":
          whiteCastle[1] = true;
          break;
        case "k":
          blackCastle[0] = true;
          break;
        case "q":
          blackCastle[1] = true;
          break;
      }
    }
  }

  return board;
}

/*Alpha Beta search*/

function alphaBetaSearch(
  board,
  color,
  depth,
  alpha,
  beta,
  bestmoves,
  startTime,
  thinkingTime,
  recommendedMoves
) {
  let hashValue = calculateHash(board);
  let eval = transpositionTable.lookup(hashValue);
  if (eval && eval.turn == color && eval.depth >= depth) {
    transpositionsCount++;
    return { eval: eval.evaluation, bestMoves: eval.bestmoves };
  }

  if (depth == 0 || new Date().getTime() - startTime > thinkingTime) {
    let eval = evaluatePosition(board, color);
    if (depth == 0) {
      transpositionTable.insert(hashValue, {
        evaluation: eval,
        bestmoves: bestmoves,
        turn: color,
        depth: depth,
      });
    }
    return { eval: eval, bestMoves: bestmoves };
  }

  let legalMovesForEngine = allLegalMoves(board, color);
  let len = legalMovesForEngine.length;
  legalMovesForEngine = orderMoves(board, legalMovesForEngine, recommendedMoves);
  if (len == 0) {
    let check = isUnderCheck(board, color);
    if (check) {
      // checkmate
      transpositionTable.insert(hashValue, {
        evaluation: -Infinity,
        bestmoves: bestmoves,
        turn: color,
        depth: depth,
      });
      return { eval: -Infinity, bestMoves: bestmoves, checkmate: true };
    }
    //stalemate
    transpositionTable.insert(hashValue, {
      evaluation: 0,
      bestmoves: bestmoves,
      turn: color,
      depth: depth,
    });
    return { eval: 0, bestMoves: bestmoves, stalemate: true };
  }

  let bestEvaluation = -Infinity;
  for (let i = 0; i < len; i++) {
    let move = legalMovesForEngine[i];

    let cRights = storeCastlingRights();
    let eRights = storeEnPassantRights();

    playMove(board, move);
    nodesEvaluated++;
    let value = -alphaBetaSearch(board, -color, depth - 1, -beta, -alpha, bestmoves, startTime, thinkingTime, recommendedMoves
    ).eval;

    if (value == Infinity && isUnderCheck(board, -color)) {
      unMove(board, move, cRights, eRights);

      bestEvaluation = Infinity;
      bestmoves = [move];

      return { eval: bestEvaluation, bestMoves: bestmoves, checkmate: true };
    } else if (value > bestEvaluation) {
      bestEvaluation = value;
      bestmoves = [move];
    }
    unMove(board, move, cRights, eRights);

    if (value >= beta) {
      return { eval: beta, bestMoves: bestmoves };
    }
    alpha = Math.max(alpha, value);
  }

  transpositionTable.insert(hashValue, {
    evaluation: alpha,
    bestmoves: bestmoves,
    turn: color,
    depth: depth,
  });

  return { eval: alpha, bestMoves: bestmoves };
}

function iterativeDeepening(board, color, thinkingTime, maxDepth) {
  let startTime = new Date().getTime();
  let prevBestMoves = [];
  let depth;
  for (depth = 1; depth <= maxDepth; depth++) {
    searchResult = alphaBetaSearch(
      board,
      color,
      depth,
      -Infinity,
      Infinity,
      [],
      startTime,
      thinkingTime,

      prevBestMoves

    );
    if (new Date().getTime() - startTime > thinkingTime) {
      break;
    }
    prevBestMoves = searchResult.bestMoves;
    if (searchResult.checkmate) {
      break;
    }
  }

  return { bestmoves: prevBestMoves, searchedDepth: depth };
}

function orderMoves(board, legalmoves, recommendedMoves) {
  legalmoves.sort((a, b) => rank(board, b, recommendedMoves) - rank(board, a, recommendedMoves));
  return legalmoves;
}

function rank(board, move, recommendedMoves) {
  let val = 0;
  //promotion is probably a good move
  if (move.isPromotion) {
    val = 10 * Math.abs(move.promotionPiece);
  }
  //capturing piece of high value with piece of low value
  if (Math.abs(board[move.startSquare]) < Math.abs(board[move.targetSquare])) {
    val =
      10 +
      Math.abs(board[move.startSquare]) -
      Math.abs(board[move.targetSquare]);
  }
  if (
    board[move.startSquare] * perspective > 0 &&
    board[move.targetSquare] == 0 &&
    (board[move.startSquare - 7] * perspective == -1 ||
      board[move.startSquare - 9] * perspective == -1)
  ) {
    val -= 10 * board[move.startSquare];
  }
  if (
    board[move.startSquare] * perspective < 0 &&
    board[move.targetSquare] * perspective == 0 &&
    (board[move.startSquare + 9] * perspective == 1 ||
      board[move.startSquare + 7] * perspective == 1)
  ) {
    val += 10 * board[move.startSquare];
  }

  if (recommendedMoves.includes(move)) {
    val += 100;
  }
  return val;
}



function checkForCastlingRights(move) {
  let initial = move.startSquare, final = move.targetSquare;
  if (initial == indexOfWhiteKing) {
    whiteCastle = [false, false];
  }
  else if (initial == indexOfBlackKing) {
    blackCastle = [false, false];
  }



  if (initial == 63) {
    perspective == 1 ? whiteCastle[0] = false : blackCastle[1] = false;
  }
  else if (initial == 56) {
    perspective == 1 ? whiteCastle[1] = false : blackCastle[0] = false;
  }
  else if (initial == 7) {
    perspective == 1 ? blackCastle[0] = false : whiteCastle[1] = false;
  }
  else if (initial == 0) {
    perspective == 1 ? blackCastle[1] = false : whiteCastle[0] = false;
  }

  return;

}

//checking for en passant rights

function checkForEnPassantRights(board, initial, final, color) {
  let y1 = Math.floor(initial / 8);
  let y2 = Math.floor(final / 8);

  if (
    board[final] == perspective &&
    y1 == 6 &&
    y2 == 4 &&
    color == perspective
  ) {
    if (perspective == 1) {
      enPassantForWhite = [false, -1];
      enPassantForBlack = [true, final];
    } else {
      enPassantForWhite = [true, final];
      enPassantForBlack = [false, -1];
    }
  } else if (
    board[final] == -perspective &&
    y1 == 1 &&
    y2 == 3 &&
    color == -perspective
  ) {
    if (perspective == 1) {
      enPassantForBlack = [false, -1];
      enPassantForWhite = [true, final];
    } else {
      enPassantForBlack = [true, final];
      enPassantForWhite = [false, -1];
    }
  } else {
    enPassantForBlack = [false, -1];
    enPassantForWhite = [false, -1];
  }
}

function storeCastlingRights() {
  let rights1 = [...whiteCastle];
  let rights2 = [...blackCastle];
  return [rights1, rights2];
}

function storeEnPassantRights() {
  let b1 = [...enPassantForWhite];
  let b2 = [...enPassantForBlack];
  return [b1, b2];
}

function updateIndicesOfKings(initial, final) {
  if (initial == indexOfWhiteKing) {
    indexOfWhiteKing = final;
  } else if (initial == indexOfBlackKing) {
    indexOfBlackKing = final;
  }
}

function updateOccupationIndices(move, reverse) {
  if (reverse) {
    let currentIndices =
      board[move.startSquare] > 0 ? whiteOccupiedSquares : blackOccupiedSquares;
    let oppositeIndices =
      board[move.startSquare] > 0 ? blackOccupiedSquares : whiteOccupiedSquares;
    if (move.isCastle) {
      let c1 = false,
        c2 = false;
      for (let i = 0; i < currentIndices.length; i++) {
        if (currentIndices[i] == move.targetSquare) {
          currentIndices[i] = move.startSquare;
          c1 = true;
        }
        if (currentIndices[i] == move.castleEnd) {
          currentIndices[i] = move.castleStart;
          c2 = true;
        }
        if (c1 && c2) {
          break;
        }
      }
    } else if (move.isEnPassant) {
      for (let i = 0; i < currentIndices.length; i++) {
        if (currentIndices[i] == move.targetSquare) {
          currentIndices[i] = move.startSquare;
          break;
        }
      }
      oppositeIndices.push(move.enPassantSquare);
      if (board[move.startSquare] > 0) {
        blackOccupiedSquares = oppositeIndices;
      } else {
        whiteOccupiedSquares = oppositeIndices;
      }
    } else if (move.capturePiece) {
      for (let i = 0; i < currentIndices.length; i++) {
        if (currentIndices[i] == move.targetSquare) {
          currentIndices[i] = move.startSquare;
          break;
        }
      }
      oppositeIndices.push(move.targetSquare);
      if (board[move.startSquare] > 0) {
        blackOccupiedSquares = oppositeIndices;
      } else {
        whiteOccupiedSquares = oppositeIndices;
      }
    } else {
      /**Normal move */

      for (let i = 0; i < currentIndices.length; i++) {
        if (currentIndices[i] == move.targetSquare) {
          currentIndices[i] = move.startSquare;
          break;
        }
      }
    }

    return;
  }

  let currentIndices =
    board[move.targetSquare] > 0 ? whiteOccupiedSquares : blackOccupiedSquares;
  let oppositeIndices =
    board[move.targetSquare] > 0 ? blackOccupiedSquares : whiteOccupiedSquares;

  if (move.isCastle) {
    /**castle */
    let c1 = false,
      c2 = false;
    for (let i = 0; i < currentIndices.length; i++) {
      if (currentIndices[i] == move.startSquare) {
        currentIndices[i] = move.targetSquare;
        c1 = true;
      }
      if (currentIndices[i] == move.castleStart) {
        currentIndices[i] = move.castleEnd;
        c2 = true;
      }
      if (c1 && c2) {
        break;
      }
    }
  } else if (move.isEnPassant) {
    /**En passant move */
    for (let i = 0; i < currentIndices.length; i++) {
      if (currentIndices[i] == move.startSquare) {
        currentIndices[i] = move.targetSquare;
        break;
      }
    }
    oppositeIndices = oppositeIndices.filter(
      (index) => index != move.enPassantSquare
    );
    if (board[move.targetSquare] > 0) {
      blackOccupiedSquares = oppositeIndices;
    } else {
      whiteOccupiedSquares = oppositeIndices;
    }
  } else if (move.capturePiece) {
    /**Capture */

    for (let i = 0; i < currentIndices.length; i++) {
      if (currentIndices[i] == move.startSquare) {
        currentIndices[i] = move.targetSquare;
        break;
      }
    }
    oppositeIndices = oppositeIndices.filter(
      (index) => index != move.targetSquare
    );
    if (board[move.targetSquare] > 0) {
      blackOccupiedSquares = oppositeIndices;
    } else {
      whiteOccupiedSquares = oppositeIndices;
    }
  } else {
    /**Normal move */

    for (let i = 0; i < currentIndices.length; i++) {
      if (currentIndices[i] == move.startSquare) {
        currentIndices[i] = move.targetSquare;
        break;
      }
    }
  }
}

function FindIndexOfWhiteKing(str) {
  let white = 0;
  let position = str.split(" ")[0];
  for (let i = 0; i < position.length; i++) {
    if (position[i] == "K") {
      return perspective == 1 ? white : 63 - white;
    } else if (parseInt(position[i]) > 0) {
      white += parseInt(position[i]);
    } else if (position[i] != "/") {
      white++;
    }
  }
}
function FindIndexOfBlackKing(str) {
  let black = 0;
  let position = str.split(" ")[0];
  for (let i = 0; i < position.length; i++) {
    if (position[i] == "k") {
      return perspective == 1 ? black : 63 - black;
    } else if (parseInt(position[i]) > 0) {
      black += parseInt(position[i]);
    } else if (position[i] != "/") {
      black++;
    }
  }
}

function whiteSquares(fenPosition) {
  let occupiedSquares = [];
  let index = 0;
  let position = fenPosition.split(" ")[0];
  for (let i = 0; i < position.length; i++) {
    if (position[i] >= "A" && position[i] <= "Z") {
      if (perspective === 1) {
        occupiedSquares.push(index);
      } else {
        occupiedSquares.push(63 - index);
      }
      index++;
    } else if (position[i] >= "a" && position[i] <= "z") {
      index++;
    } else if (position[i] != "/") {
      index += parseInt(position[i]);
    }
  }

  return occupiedSquares;
}

function blackSquares(fenPosition) {
  let occupiedSquares = [];
  let index = 0;
  let position = fenPosition.split(" ")[0];
  for (let i = 0; i < position.length; i++) {
    if (position[i] >= "A" && position[i] <= "Z") {
      index++;
    } else if (position[i] >= "a" && position[i] <= "z") {
      if (perspective === 1) {
        occupiedSquares.push(index);
      } else {
        occupiedSquares.push(63 - index);
      }
      index++;
    } else if (position[i] != "/") {
      index += parseInt(position[i]);
    }
  }

  return occupiedSquares;
}

function NameMove(move, startPiece, check) {
  let name;
  if (move.isCastle) {
    if (perspective == 1) {
      switch (move.castleStart) {
        case 63:
          name = "O-O";
          break;
        case 56:
          name = "O-O-O";
          break;
        case 7:
          name = "o-o";
          break;
        case 0:
          name = "o-o-o";
          break;
      }
    } else {
      switch (move.castleStart) {
        case 63:
          name = "o-o-o";
          break;
        case 56:
          name = "o-o";
          break;
        case 7:
          name = "O-O-O";
          break;
        case 0:
          name = "O-O";
          break;
      }
    }
  } else if (move.isPromotion) {
    if (move.capturePiece) {
      name =
        File(move.startSquare) +
        "x" +
        NameSquare(move.targetSquare) +
        "=" +
        pieceName(move.promotionPiece);
    } else {
      name =
        NameSquare(move.targetSquare) +
        "=" +
        pieceName(move.promotionPiece).toUpperCase();
    }
  } else if (move.isEnPassant) {
    name =
      File(move.startSquare) + "x" + NameSquare(move.enPassantSquare) + " e.p.";
  } else if (move.capturePiece) {
    if (Math.abs(startPiece) == 1) {
      name = File(move.startSquare) + "x" + NameSquare(move.targetSquare);
    } else {
      name =
        pieceName(startPiece).toUpperCase() +
        "x" +
        NameSquare(move.targetSquare);
    }
  } else {
    name = pieceName(startPiece).toUpperCase() + NameSquare(move.targetSquare);
  }

  if (check) {
    name += "+";
  }
  return name;
}

function pieceName(piece) {
  switch (piece) {
    case 10:
      return "Q";
    case 6:
      return "R";
    case 3:
      return "N";
    case 4:
      return "B";
    case 2:
      return "K";
    case 1:
      return "";
    case -10:
      return "q";
    case -6:
      return "r";
    case -3:
      return "n";
    case -4:
      return "b";
    case -2:
      return "k";
    case -1:
      return "";
    default:
      return piece;
  }
}

function Rank(index) {
  let y = Math.floor(index / 8);
  return perspective == 1 ? 8 - y : y + 1;
}

function File(index) {
  let str = "abcdefgh";
  let x = index % 8;

  return perspective == 1 ? str[x] : str[7 - x];
}

function NameSquare(index) {
  let rank = Rank(index);
  let file = File(index);
  return file + rank.toString();
}

function highlight(moves, index) {
  document
    .getElementsByClassName("square")
  [index].classList.add("click-square");
  for (move of moves) {
    document.getElementsByClassName("highlight-circle")[move].style.display =
      "flex";
  }
}

function unHightlight() {
  let clickSquare = document.getElementsByClassName("click-square");
  if (clickSquare.length) {
    clickSquare[0].classList.remove("click-square");
  }

  for (let i = 0; i < 64; i++) {
    squares[i].classList.remove("odd-colored-square");
    squares[i].classList.remove("even-colored-square");

  }

  let circles = document.getElementsByClassName("highlight-circle");
  for (let i = 0; i < circles.length; i++) {
    circles[i].style.display = "none";
  }
}

function highlightLastMove(initial, final) {
  let prev1 = document.getElementsByClassName("start-square");
  let prev2 = document.getElementsByClassName("target-square");
  if (prev1.length && prev2.length) {
    prev1[0].classList.remove("start-square");
    prev2[0].classList.remove("target-square");
  }

  let checkSquare = document.getElementsByClassName("check-square");
  if (checkSquare.length) {
    checkSquare[0].classList.remove("check-square");
  }

  document
    .getElementsByClassName("square")
  [initial].classList.add("start-square");
  document
    .getElementsByClassName("square")
  [final].classList.add("target-square");
}

function highlightOccupiedSquares() {
  for (let i = 0; i < 64; i++) {
    document
      .getElementsByClassName("highlight-circle")
    [i].classList.remove("white-occupied");
    document
      .getElementsByClassName("highlight-circle")
    [i].classList.remove("black-occupied");
  }
  for (let i = 0; i < whiteOccupiedSquares.length; i++) {
    // squares[whiteOccupiedSquares[i]].classList.add("white-occupied-square");
    document
      .getElementsByClassName("highlight-circle")
    [whiteOccupiedSquares[i]].classList.add("white-occupied");
    document.getElementsByClassName("highlight-circle")[
      whiteOccupiedSquares[i]
    ].innerHTML = "<span class='num'>" + whiteOccupiedSquares[i] + "</span>";
  }
  for (let i = 0; i < blackOccupiedSquares.length; i++) {
    // squares[blackOccupiedSquares[i]].classList.add("black-occupied-square");
    document
      .getElementsByClassName("highlight-circle")
    [blackOccupiedSquares[i]].classList.add("black-occupied");
    document.getElementsByClassName("highlight-circle")[
      blackOccupiedSquares[i]
    ].innerHTML = "<span class='num'>" + blackOccupiedSquares[i] + "</span>";
  }
}

function checkKingIndex(color) {
  if (color == 1) {
    document
      .getElementsByClassName("square")
    [indexOfWhiteKing].classList.add("check-square");
  } else {
    document
      .getElementsByClassName("square")
    [indexOfBlackKing].classList.add("check-square");
  }
}
// //adding drag and drop behaviour
let draggedElementIndex = null;

function addMoveBehaviourToPieces() {
  for (let i = 0; i < chessPieces.length; i++) {
    chessPieces[i].addEventListener("dragstart", (e) => {
      e.preventDefault();
    });
  }
  let draggedIndex = null;
  let draggedSquareIndex = null;
  let isdragging;
  let isClick;

  let clickCoordinates = null;

  chessboard.addEventListener("mousedown", (e) => {
    let i = FindTargetSquare(e);
    let pieceIndex = pieceLocations.find((obj) => obj.squareIndex === i);
    if (pieceIndex != null && !activeMoves.length && board[i] * turn > 0) {
      activeMoves = finalLegalMoves(board, i, turn);
      highlight(
        activeMoves.map((obj) => obj.targetSquare),
        i
      );
      draggedIndex = pieceIndex.domIndex;
      draggedSquareIndex = i;
      isdragging = true;
      isClick = true;

      clickCoordinates = [e.clientX, e.clientY];
    } else if (activeMoves.length) {
      let targetSquare = FindTargetSquare(e);
      let playedMove = activeMoves.find(
        (obj) => obj.targetSquare === targetSquare
      );
      if (playedMove) {
        if (playedMove.isPromotion && false) {
          createPromotionOptions(move);

        }
        else {
          MakeMove(board, playedMove, true);
          chessPieces[draggedIndex].style.zIndex = "100";
          let legalSquares = document.getElementsByClassName("legal-square");
          for (let i = 0; i < legalSquares.length; i++) {
            document
              .getElementsByClassName("legal-square")
            [i].classList.remove("legal-square");
          }

          setTimeout(() => {
            gameEngine(board, turn);
          }, 300);
        }

      } else {
        let rect1 = squares[0].getBoundingClientRect();
        let rect2 = squares[draggedSquareIndex].getBoundingClientRect();

        chessPieces[draggedIndex].style.transform = `translate(${rect2.left - rect1.left
          }px, ${rect2.top - rect1.top}px)`;
      }

      unHightlight();
      activeMoves = [];
      draggedIndex = null;
      draggedSquareIndex = null;
      isdragging = false;
    }
  });
  chessboard.addEventListener("mousemove", (e) => {
    let targetSquare = FindTargetSquare(e);

    if (isdragging) {
      let rect = squares[0].getBoundingClientRect();

      chessPieces[draggedIndex].style.transform = `translate(${e.clientX - rect.width / 2 - rect.left
        }px, ${e.clientY - rect.height / 2 - rect.top}px)`;
      chessPieces[draggedIndex].style.zIndex = "102";
      let legalSquares = document.getElementsByClassName("legal-square");
      for (let i = 0; i < legalSquares.length; i++) {
        document
          .getElementsByClassName("legal-square")
        [i].classList.remove("legal-square");
      }

      if (activeMoves.some((obj) => obj.targetSquare === targetSquare)) {
        squares[targetSquare].classList.add("legal-square");
      }
    }
    isClick = false;
  });
  chessboard.addEventListener("mouseup", (e) => {


    let targetSquare = FindTargetSquare(e);

    if (clickCoordinates) {

      if (clickCoordinates[0] == e.clientX && clickCoordinates[1] == e.clientY) {
        isdragging = false;
      }
    }


    if (isdragging) {
      let playedMove = activeMoves.find(
        (obj) => obj.targetSquare === targetSquare
      );
      if (playedMove) {
        if (playedMove.isPromotion && false) {

          createPromotionOptions(playedMove);

        }
        else {

          MakeMove(board, playedMove, false);
          chessPieces[draggedIndex].style.zIndex = "100";
          let legalSquares = document.getElementsByClassName("legal-square");
          for (let i = 0; i < legalSquares.length; i++) {
            document
              .getElementsByClassName("legal-square")
            [i].classList.remove("legal-square");
          }

          setTimeout(() => {
            gameEngine(board, turn);
          }, 300);
        }
      } else {
        let rect1 = squares[0].getBoundingClientRect();
        let rect2 = squares[draggedSquareIndex].getBoundingClientRect();

        chessPieces[draggedIndex].style.transform = `translate(${rect2.left - rect1.left
          }px, ${rect2.top - rect1.top}px)`;
      }

      unHightlight();
      activeMoves = [];
      draggedIndex = null;
      draggedSquareIndex = null;
      isdragging = false;
    } else if (isClick) {
      let i = FindTargetSquare(e);
      let pieceIndex = pieceLocations.find((obj) => obj.squareIndex === i);
      if (pieceIndex != null && !activeMoves.length) {
        activeMoves = finalLegalMoves(board, i, turn);
        highlight(
          activeMoves.map((obj) => obj.targetSquare),
          i
        );
        if (activeMoves.length) {
          draggedIndex = pieceIndex.domIndex;
          draggedSquareIndex = i;
          isdragging = true;
          isClick = true;
        }
      }
    }
  });
}

function FindTargetSquare(e) {
  let rect = chessboard.getBoundingClientRect();
  let x = Math.floor(((e.clientX - rect.left) / rect.width) * 8);
  let y = Math.floor(((e.clientY - rect.top) / rect.height) * 8);

  return x + 8 * y;
}

function addClickBehaviour(index) {
  let element = chessPieces[index];
  element.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!activeMoves.length) {
      let i = pieceLocations.find((obj) => obj.domIndex === index).squareIndex;
      activeMoves = finalLegalMoves(board, i, turn);
      highlight(
        activeMoves.map((obj) => obj["targetSquare"]),
        i
      );
    } else {
      let target = pieceLocations.find(
        (obj) => obj.domIndex === index
      ).squareIndex;
      let playedMove = activeMoves.find((obj) => obj.targetSquare == target);
      if (playedMove) {
        MakeMove(board, playedMove, true);
        setTimeout(() => {
          gameEngine(board, -turn);
        }, 300);
        document.getElementsByTagName("title")[0].innerHTML =
          "Computer playing-PiChess play with computer";
      } else {
        unHightlight();
      }
      activeMoves = [];
    }
  });
}

function changeTurn() {
  if (turn == 1) turn = -1;
  else turn = 1;
}

function attackedSquares(board, color) {
  let arr = [];
  let indices = color == 1 ? whiteOccupiedSquares : blackOccupiedSquares;

  for (i of indices) {
    let legal = legalMoves(board, i, color);
    legal.forEach((move) => {
      if (!arr.includes(move.targetSquare)) {
        arr.push(move.targetSquare);
      }
    });
    if (board[i] * color == 1) {
      if (color == 1 && board[i - 7] == 0) arr.push(i - 7);
      if (color == 1 && board[i - 9] == 0) arr.push(i - 9);
      if (color == -1 && board[i + 7] == 0) arr.push(i + 7);
      if (color == -1 && board[i + 9] == 0) arr.push(i + 9);
    }
  }

  return arr;
}


function slidingPieceMoves(board, index, turn) {
  let color, piece;
  if (board[index] > 0) {
    color = 1;
    piece = board[index];
  } else if (board[index] < 0) {
    color = -1;
    piece = -board[index];
  }
  if (board[index] == 0 || turn != color) {
    return [];
  }

  if (piece == 6) {
    /**rook */
    let friendlyBitboard = (color == 1) ? bitboard.getWhiteBitBoard() : bitboard.getBlackBitboard();
    let blockerBitboard = (bitboard.getWhiteBitBoard() | bitboard.getBlackBitboard()) & rook.blockermasks[index];
    let i = ((rookMagicNumbers[index] * blockerBitboard) & 0xffffffffffffffffn) >> 50n;
    let moveBoard = rook.legalMoves[index][i] & ~(friendlyBitboard);
    return extractLegalMoves(board, moveBoard, index);
  }

  else if (piece == 4) {
    /**Bishop */
    let friendlyBitboard = (color == 1) ? bitboard.getWhiteBitBoard() : bitboard.getBlackBitboard();
    let blockerBitboard = (bitboard.getWhiteBitBoard() | bitboard.getBlackBitboard()) & bishop.blockermasks[index];
    let i = ((bishopMagicNumbers2[index] * blockerBitboard) & 0xffffffffffffffffn) >> 50n;
    let moveBoard = bishop.legalMoves[index][i] & ~(friendlyBitboard);
    return extractLegalMoves(board, moveBoard, index);
  }

  else if (piece == 10) {
    let friendlyBitboard = (color == 1) ? bitboard.getWhiteBitBoard() : bitboard.getBlackBitboard();
    let blockerBitboard = (bitboard.getWhiteBitBoard() | bitboard.getBlackBitboard()) & rook.blockermasks[index];
    let blockerBitboard1 = (bitboard.getWhiteBitBoard() | bitboard.getBlackBitboard()) & bishop.blockermasks[index];
    let i = ((rookMagicNumbers[index] * blockerBitboard) & 0xffffffffffffffffn) >> 50n;
    let moveBoard = rook.legalMoves[index][i] & ~(friendlyBitboard);

    let i1 = ((bishopMagicNumbers2[index] * blockerBitboard1) & 0xffffffffffffffffn) >> 50n;
    moveBoard = moveBoard | (bishop.legalMoves[index][i1] & ~(friendlyBitboard));
    return extractLegalMoves(board, moveBoard, index);

  }

}

function decodeLegalMoves(board, moveBoard, index) {
  let str = toBinaryStringWithLeadingZeros(moveBoard);
  let arr = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i] == '1') {
      arr.push({ startSquare: index, targetSquare: i, isCastle: false, isEnPassant: false, isPromotion: false, capturePiece: board[i] })
    }

  }

  return arr;


}
function extractLegalMoves(board, moveBoard, index) {
  let legalMoves = [];
  let position = 0; // Start from the 0th position

  // Loop through each bit of the 64-bit integer
  while (moveBoard !== 0n) {
    // Check if the current bit is set (equals to 1)
    if (moveBoard & 1n) {
      // If set, add the position to the legal moves array
      legalMoves.push({ startSquare: index, targetSquare: 63 - position, isCastle: false, isEnPassant: false, isPromotion: false, capturePiece: board[63 - position] });
    }

    // Shift the bitboard to the right by 1 (moving to the next bit)
    moveBoard = moveBoard >> 1n;
    position++; // Move to the next position
  }

  return legalMoves;
}

function rookMoves(board, index, color) {
  let legalmoves = []
  let x = index % 8, y = Math.floor(index / 8)
  let top = [x, y - 1],
    left = [x - 1, y],
    bottom = [x, y + 1],
    right = [x + 1, y];

  let directions = [top, bottom, left, right]
  let vectors = [
    [0, -1], [0, 1], [-1, 0], [1, 0]
  ]
  for (let i = 0; i < directions.length; i++) {
    let direction = directions[i];

    while (!isOutsideBoard(direction)) {
      let squareIndex = coordinatesToIndex(direction)
      if (board[squareIndex] == 0) {
        legalmoves.push({
          startSquare: index,
          targetSquare: squareIndex,
          capturePiece: 0,
          isCastle: false,
          isPromotion: false,
          isEnPassant: false,
        });
      } else if (board[squareIndex] * color > 0) {
        break;
      } else {
        legalmoves.push({
          startSquare: index,
          targetSquare: squareIndex,
          capturePiece: board[squareIndex],
          isCastle: false,
          isPromotion: false,
          isEnPassant: false,
        });

        break;
      }

      direction[0] += vectors[i][0];
      direction[1] += vectors[i][1];
    }
  }

  return legalmoves;
}

function bishopMoves(board, index, color) {

  let legalmoves = []
  let x = index % 8, y = Math.floor(index / 8)
  let topRight = [x + 1, y - 1],
    topLeft = [x - 1, y - 1],
    bottomRight = [x + 1, y + 1],
    bottomLeft = [x - 1, y + 1];
  let directions = [topRight, topLeft, bottomRight, bottomLeft]
  let vectors = [
    [1, -1], [-1, -1], [1, 1], [-1, 1]
  ]
  for (let i = 0; i < directions.length; i++) {
    let direction = directions[i];

    while (!isOutsideBoard(direction)) {
      let squareIndex = coordinatesToIndex(direction)
      if (board[squareIndex] == 0) {
        legalmoves.push({
          startSquare: index,
          targetSquare: squareIndex,
          capturePiece: 0,
          isCastle: false,
          isPromotion: false,
          isEnPassant: false,
        });
      } else if (board[squareIndex] * color > 0) {
        break;
      } else {
        legalmoves.push({
          startSquare: index,
          targetSquare: squareIndex,
          capturePiece: board[squareIndex],
          isCastle: false,
          isPromotion: false,
          isEnPassant: false,
        });

        break;
      }

      direction[0] += vectors[i][0];
      direction[1] += vectors[i][1];
    }
  }

  return legalmoves;

}



function rookMovesUsingBitboards(board, index, color) {
  let m = []
  let blockerBitboard = (bitboard.getWhiteBitBoard() | bitboard.getBlackBitboard()) & rook.blockermasks[index];
  let i = ((rookMagicNumbers[index] * blockerBitboard) & 0xffffffffffffffffn) >> 50n;
  let moves = rook.legalMoves[index][i];
  for (move of moves) {
    move.capturePiece = board[move.targetSquare];
    if (board[move.targetSquare] * color <= 0) {
      m.push(move)
    }
  }

  return m;
}



function bishopMovesUsingBitboards(board, index, color) {
  let m = []
  let blockerBitboard = (bitboard.getWhiteBitBoard() | bitboard.getBlackBitboard()) & bishop.blockermasks[index];
  let i = ((bishopMagicNumbers[index] * blockerBitboard) & 0xffffffffffffffffn) >> 50n;
  let moves = bishop.legalMoves[index][i];
  for (move of moves) {
    move.capturePiece = board[move.targetSquare];
    if (board[move.targetSquare] * color <= 0) {
      m.push(move)
    }
  }

  return m;
}




function legalMoves(board, index, turn) {
  let color, piece;
  if (board[index] > 0) {
    color = 1;
    piece = board[index];
  } else if (board[index] < 0) {
    color = -1;
    piece = -board[index];
  }
  if (board[index] == 0 || turn != color) {
    return [];
  }
  let legalmoves = [];
  let x = index % 8;
  let y = Math.floor(index / 8);
  if (piece == 6) {
    legalmoves = legalmoves.concat(rookMoves(board, index, color))
    // legalmoves = legalmoves.concat(rookMovesUsingBitboards(board, index, color))



  }

  else if (piece == 4) {
    legalmoves = legalmoves.concat(bishopMoves(board, index, color))
    // legalmoves = legalmoves.concat(bishopMovesUsingBitboards(board, index, color))



  }

  else if (piece == 10) {
    legalmoves = legalmoves.concat(rookMoves(board, index, color))
    legalmoves = legalmoves.concat(bishopMoves(board, index, color))
    // legalmoves = legalmoves.concat(rookMovesUsingBitboards(board, index, color))
    // legalmoves = legalmoves.concat(bishopMovesUsingBitboards(board, index, color))

  }


  else if (piece == 3) {
    let coordinates = [
      [x + 2, y + 1],
      [x + 2, y - 1],
      [x - 2, y + 1],
      [x - 2, y - 1],
      [x + 1, y + 2],
      [x - 1, y + 2],
      [x - 1, y - 2],
      [x + 1, y - 2],
    ];
    let allowedPositions = [];

    coordinates.forEach((coordinate) => {
      let squareIndex = coordinatesToIndex(coordinate)

      if (!isOutsideBoard(coordinate) && board[squareIndex] * color <= 0) {
        legalmoves.push({
          startSquare: index,
          targetSquare: squareIndex,
          capturePiece: board[squareIndex],
          isCastle: false,
          isPromotion: false,
          isEnPassant: false,
        });
      }
    });


  }


  //legal moves for king
  else if (piece == 2) {
    let coordinates = [
      [x, y + 1],
      [x, y - 1],
      [x + 1, y],
      [x - 1, y],
      [x + 1, y - 1],
      [x - 1, y - 1],
      [x - 1, y + 1],
      [x + 1, y + 1],
    ];
    coordinates.forEach((coordinate) => {
      let squareIndex = coordinatesToIndex(coordinate)

      if (!isOutsideBoard(coordinate) && board[squareIndex] * color <= 0) {

        legalmoves.push({
          startSquare: index,
          targetSquare: squareIndex,
          capturePiece: board[squareIndex],
          isCastle: false,
          isPromotion: false,
          isEnPassant: false,
        });

      }
    });
  }

  // legal moves for pawn
  else if (piece == 1) {
    if (color * perspective == 1) {
      if (y == 6) {
        if (board[index - 8] == 0 && board[index - 16] == 0) {
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 16,
            capturePiece: board[index - 16],
            isCastle: false,
            isPromotion: false,
            isEnPassant: false,
          });
        }
      }
      if (!isOutsideBoard([x, y - 1]) && board[index - 8] == 0) {
        if (Math.floor(index / 8) == 1) {
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 8,
            capturePiece: board[index - 8],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 10 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 8,
            capturePiece: board[index - 8],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 6 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 8,
            capturePiece: board[index - 8],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 4 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 8,
            capturePiece: board[index - 8],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 3 * perspective,
            isEnPassant: false,
          });
        } else {
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 8,
            capturePiece: board[index - 8],
            isCastle: false,
            isPromotion: false,
            isEnPassant: false,
          });
        }
      }
      if (
        !isOutsideBoard([x + 1, y - 1]) &&
        board[index - 7] * perspective < 0
      ) {
        if (Math.floor(index / 8) == 1) {
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 7,
            capturePiece: board[index - 7],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 10 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 7,
            capturePiece: board[index - 7],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 6 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 7,
            capturePiece: board[index - 7],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 4 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 7,
            capturePiece: board[index - 7],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 3 * perspective,
            isEnPassant: false,
          });
        } else {
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 7,
            capturePiece: board[index - 7],
            isCastle: false,
            isPromotion: false,
            isEnPassant: false,
          });
        }
      }
      if (
        !isOutsideBoard([x - 1, y - 1]) &&
        board[index - 9] * perspective < 0
      ) {
        if (Math.floor(index / 8) == 1) {
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 9,
            capturePiece: board[index - 9],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 10 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 9,
            capturePiece: board[index - 9],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 6 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 9,
            capturePiece: board[index - 9],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 4 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 9,
            capturePiece: board[index - 9],
            isCastle: false,
            isPromotion: true,
            promotionPiece: 3 * perspective,
            isEnPassant: false,
          });
        } else {
          legalmoves.push({
            startSquare: index,
            targetSquare: index - 9,
            capturePiece: board[index - 9],
            isCastle: false,
            isPromotion: false,
            isEnPassant: false,
          });
        }
      }
    } else {
      //for black pawns
      if (Math.floor(index / 8) == 1) {
        if (board[index + 8] == 0 && board[index + 16] == 0) {
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 16,
            capturePiece: board[index + 16],
            isCastle: false,
            isPromotion: false,
            isEnPassant: false,
          });
        }
      }

      if (!isOutsideBoard([x, y + 1]) && board[index + 8] == 0) {
        if (Math.floor(index / 8) == 6) {
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 8,
            capturePiece: board[index + 8],
            isCastle: false,
            isPromotion: true,
            promotionPiece: -10 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 8,
            capturePiece: board[index + 8],
            isCastle: false,
            isPromotion: true,
            promotionPiece: -6 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 8,
            capturePiece: board[index + 8],
            isCastle: false,
            isPromotion: true,
            promotionPiece: -4 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 8,
            capturePiece: board[index + 8],
            isCastle: false,
            isPromotion: true,
            promotionPiece: -3 * perspective,
            isEnPassant: false,
          });
        } else {
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 8,
            capturePiece: board[index + 8],
            isCastle: false,
            isPromotion: false,
            isEnPassant: false,
          });
        }
      }
      if (
        !isOutsideBoard([x + 1, y + 1]) &&
        board[index + 9] * perspective > 0
      ) {
        if (Math.floor(index / 8) == 6) {
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 9,
            isCastle: false,
            capturePiece: board[index + 9],
            isPromotion: true,
            promotionPiece: -10 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 9,
            isCastle: false,
            capturePiece: board[index + 9],
            isPromotion: true,
            promotionPiece: -6 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 9,
            isCastle: false,
            capturePiece: board[index + 9],
            isPromotion: true,
            promotionPiece: -4 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 9,
            isCastle: false,
            capturePiece: board[index + 9],
            isPromotion: true,
            promotionPiece: -3 * perspective,
            isEnPassant: false,
          });
        } else {
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 9,
            capturePiece: board[index + 9],
            isCastle: false,
            isPromotion: false,
            isEnPassant: false,
          });
        }
      }
      if (
        !isOutsideBoard([x - 1, y + 1]) &&
        board[index + 7] * perspective > 0
      ) {
        if (Math.floor(index / 8) == 6) {
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 7,
            capturePiece: board[index + 7],
            isCastle: false,
            isPromotion: true,
            promotionPiece: -10 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 7,
            capturePiece: board[index + 7],
            isCastle: false,
            isPromotion: true,
            promotionPiece: -6 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 7,
            capturePiece: board[index + 7],
            isCastle: false,
            isPromotion: true,
            promotionPiece: -4 * perspective,
            isEnPassant: false,
          });
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 7,
            capturePiece: board[index + 7],
            isCastle: false,
            isPromotion: true,
            promotionPiece: -3 * perspective,
            isEnPassant: false,
          });
        } else {
          legalmoves.push({
            startSquare: index,
            targetSquare: index + 7,
            capturePiece: board[index + 7],
            isCastle: false,
            isPromotion: false,
            isEnPassant: false,
          });
        }
      }
    }
  }

  return legalmoves;
}
// //end of the legal moves function
function isUnderCheck(board, color) {
  var indexOfKing = positionOfKing(color);
  let indices = color == 1 ? blackOccupiedSquares : whiteOccupiedSquares;
  for (let i of indices) {
    if (
      legalMoves(board, i, -color).some(
        (obj) => obj.targetSquare === indexOfKing
      )
    ) {
      return true;
    }
  }
  return false;
}

function isUnderCheckAlt(color) {

  let indexOfKing = positionOfKing(color);
  let opponentIndices = color == 1 ? blackOccupiedSquares : whiteOccupiedSquares;
  for (let index of opponentIndices) {
    if (squaresUnderAttack[index] == indexOfKing) {
      return true;
    }


  }

  return false;
}

// //legal moves along with check checking
function finalLegalMoves(board, index, color) {
  let legalmoves = legalMoves(board, index, color);
  let newLegalMoves = [];
  let attacked = attackedSquares(board, -color);
  //special moves
  let check = attacked.includes(positionOfKing(color));

  //Castling
  if (!check) {
    let perspectiveOffset = perspective == 1 ? 0 : -1;
    if (index == 60 + perspectiveOffset && board[index] * perspective == 2) {
      //it may have right to castle
      let shortCastle = perspective == 1 ? whiteCastle[0] : blackCastle[0];
      let longCastle = perspective == 1 ? whiteCastle[1] : blackCastle[1];

      if (
        shortCastle &&
        board[index + perspective] == 0 &&
        board[index + 2 * perspective] == 0 &&
        !attacked.includes(index + perspective)
      ) {
        legalmoves.push({
          startSquare: index,
          targetSquare: index + 2 * perspective,
          capturePiece: 0,
          isCastle: true,
          castleStart: index + 3 * perspective,
          castleEnd: index + perspective,
          isPromotion: false,
          isEnPassant: false,
        });
      }
      if (
        longCastle &&
        board[index - perspective] == 0 &&
        board[index - 2 * perspective] == 0 &&
        board[index - 3 * perspective] == 0 &&
        !attacked.includes(index - perspective)
      ) {
        legalmoves.push({
          startSquare: index,
          targetSquare: index - 2 * perspective,
          capturePiece: 0,
          isCastle: true,
          castleStart: index - 4 * perspective,
          castleEnd: index - perspective,
          isPromotion: false,
          isEnPassant: false,
        });
      }
    }
    if (index == 4 + perspectiveOffset && board[index] * perspective == -2) {
      let shortCastle = perspective == 1 ? blackCastle[0] : whiteCastle[0];
      let longCastle = perspective == 1 ? blackCastle[1] : whiteCastle[1];
      if (
        shortCastle &&
        board[index + perspective] == 0 &&
        board[index + 2 * perspective] == 0 &&
        !attacked.includes(index + perspective)
      ) {
        legalmoves.push({
          startSquare: index,
          targetSquare: index + 2 * perspective,
          capturePiece: 0,
          isCastle: true,
          castleStart: index + 3 * perspective,
          castleEnd: index + perspective,
          isPromotion: false,
          isEnPassant: false,
        });
      }
      if (
        longCastle &&
        board[index - perspective] == 0 &&
        board[index - 2 * perspective] == 0 &&
        board[index - 3 * perspective] == 0 &&
        !attacked.includes(index - perspective)
      ) {
        legalmoves.push({
          startSquare: index,
          targetSquare: index - 2 * perspective,
          capturePiece: 0,
          isCastle: true,
          castleStart: index - 4 * perspective,
          castleEnd: index - perspective,
          isPromotion: false,
          isEnPassant: false,
        });
      }
    }
  }

  //en passant
  if (color == 1 && enPassantForWhite[0] == true) {
    let position = enPassantForWhite[1];
    if (
      Math.abs(index - position) == 1 &&
      board[index] == 1 &&
      Math.floor(index / 8) == Math.floor(position / 8)
    ) {
      legalmoves.push({
        startSquare: index,
        targetSquare: position - 8 * perspective,
        capturePiece: 0,
        isCastle: false,
        isPromotion: false,
        isEnPassant: true,
        enPassantSquare: position,
      });
    }
  }
  if (color == -1 && enPassantForBlack[0] == true) {
    let position = enPassantForBlack[1];
    if (
      Math.abs(index - position) == 1 &&
      board[index] == -1 &&
      Math.floor(index / 8) == Math.floor(position / 8)
    ) {
      legalmoves.push({
        startSquare: index,
        targetSquare: position + 8 * perspective,
        capturePiece: 0,
        isCastle: false,
        isPromotion: false,
        isEnPassant: true,
        enPassantSquare: position,
      });
    }
  }

  if (!check) {
    legalmoves.forEach((move) => {
      let c = storeCastlingRights();
      let e = storeEnPassantRights();
      playMove(board, move);
      if (isUnderCheck(board, color)) {
      } else {
        newLegalMoves.push(move);
      }
      unMove(board, move, c, e);
    });
    // newLegalMoves = legalmoves;
  } else {
    legalmoves.forEach((move) => {
      let c = storeCastlingRights();
      let e = storeEnPassantRights();
      playMove(board, move);
      if (!isUnderCheck(board, color)) {
        newLegalMoves.push(move);
      } else {
      }
      unMove(board, move, c, e);
    });
  }

  return newLegalMoves;
}
function unMakeMove(move, smooth, type) {
  let rect1 = squares[0].getBoundingClientRect();
  let rect2 = squares[move.startSquare].getBoundingClientRect();
  let pieceIndex = pieceLocations.find(
    (obj) => obj.squareIndex === move.targetSquare
  ).domIndex;
  let pieceIndex2 = pieceLocations.find(
    (obj) => obj.squareIndex === move.startSquare
  );

  setTimeout(() => {
    chessPieces[pieceIndex].classList.remove("smooth-piece");
  }, 300);

  chessPieces[pieceIndex].style.transform = `translate(${rect2.left - rect1.left
    }px, ${rect2.top - rect1.top}px)`;

  if (smooth) {
    chessPieces[pieceIndex].classList.add("smooth-piece");
  }
  if (move.isCastle) {
    pieceLocations.find(
      (obj) => obj.squareIndex === move.targetSquare
    ).squareIndex = move.startSquare;
    let castlePieceIndex = pieceLocations.find(
      (obj) => obj.squareIndex === move.castleEnd
    ).domIndex;
    chessPieces[castlePieceIndex].classList.add("smooth-piece");
    setTimeout(() => {
      chessPieces[castlePieceIndex].classList.remove("smooth-piece");
    }, 300);
    chessPieces[castlePieceIndex].style.transform = `translate(${squares[move.castleStart].getBoundingClientRect().left - rect1.left
      }px, ${squares[move.castleStart].getBoundingClientRect().top - rect1.top
      }px)`;
    let elementIndex = pieceLocations.find(
      (obj) => obj.squareIndex === move.castleEnd
    );

    elementIndex.squareIndex = move.castleStart;
  } else if (move.isEnPassant) {
    pieceLocations.find(
      (obj) => obj.squareIndex === move.targetSquare
    ).squareIndex = move.startSquare;
    let enPassantPiece = pieceLocations.find(
      (obj) =>

        obj.squareIndex == generateUniqueNumber(move.enPassantSquare, -board[move.targetSquare])
    );

    chessPieces[enPassantPiece.domIndex].style.display = "flex";
    enPassantPiece.squareIndex = move.enPassantSquare;
  } else if (move.isPromotion) {
    pieceLocations.find(
      (obj) => obj.squareIndex === move.targetSquare
    ).squareIndex = move.startSquare;
    chessPieces[pieceIndex].src =
      "../../assets/image-files/piece-images/" +
      (board[move.targetSquare] >= 0 ? 1 : -1) +
      ".png";

    if (move.capturePiece) {

      let capturedPiece = pieceLocations.find(
        (obj) => obj.squareIndex == generateUniqueNumber(move.targetSquare, move.capturePiece)
      );
      chessPieces[capturedPiece.domIndex].style.display = "flex";
      capturedPiece.squareIndex = move.targetSquare;
    }
  } else if (move.capturePiece) {
    pieceLocations.find(
      (obj) => obj.squareIndex === move.targetSquare
    ).squareIndex = move.startSquare;
    let elementIndex = pieceLocations.find(
      (obj) => obj.squareIndex === generateUniqueNumber(move.targetSquare, move.capturePiece)
    );
    chessPieces[elementIndex.domIndex].style.display = "flex";
    elementIndex.squareIndex = move.targetSquare;
  } else {
    pieceLocations.find(
      (obj) => obj.squareIndex === move.targetSquare
    ).squareIndex = move.startSquare;
  }


  playSoundEffects(type);

  document.getElementsByClassName('action')[3].classList.remove('disabled-recapeButton')
  document.getElementsByClassName('action')[4].classList.remove('disabled-recapeButton')

}

function refreshBoard(move, smooth, type) {
  let rect1 = squares[0].getBoundingClientRect();
  let rect2 = squares[move.targetSquare].getBoundingClientRect();
  let pieceIndex = pieceLocations.find(
    (obj) => obj.squareIndex === move.startSquare
  ).domIndex;
  let pieceIndex2 = pieceLocations.find(
    (obj) => obj.squareIndex === move.targetSquare
  );
  if (smooth) {
    chessPieces[pieceIndex].classList.add("smooth-piece");
  }
  setTimeout(() => {
    chessPieces[pieceIndex].classList.remove("smooth-piece");
  }, 300);

  chessPieces[pieceIndex].style.transform = `translate(${rect2.left - rect1.left
    }px, ${rect2.top - rect1.top}px)`;
  if (move.capturePiece) {
    let elementIndex = pieceLocations.find(
      (obj) => obj.squareIndex === move.targetSquare
    );
    chessPieces[elementIndex.domIndex].style.display = "none";
    elementIndex.squareIndex = generateUniqueNumber(move.targetSquare, move.capturePiece)
  }
  if (move.isCastle) {
    let castlePieceIndex = pieceLocations.find(
      (obj) => obj.squareIndex === move.castleStart
    ).domIndex;
    chessPieces[castlePieceIndex].classList.add("smooth-piece");
    setTimeout(() => {
      chessPieces[castlePieceIndex].classList.remove("smooth-piece");
    }, 300);
    chessPieces[castlePieceIndex].style.transform = `translate(${squares[move.castleEnd].getBoundingClientRect().left - rect1.left
      }px, ${squares[move.castleEnd].getBoundingClientRect().top - rect1.top}px)`;
    let elementIndex = pieceLocations.find(
      (obj) => obj.squareIndex === move.castleStart
    );
    elementIndex.squareIndex = move.castleEnd;
  } else if (move.isPromotion) {
    chessPieces[pieceIndex].src =
      "../../assets/image-files/piece-images/" +
      board[move.targetSquare] +
      ".png";
  } else if (move.isEnPassant) {
    let enPassantPiece = pieceLocations.find(
      (obj) => obj.squareIndex == move.enPassantSquare
    );

    chessPieces[enPassantPiece.domIndex].style.display = "none";

    enPassantPiece.squareIndex = generateUniqueNumber(move.enPassantSquare, -board[move.targetSquare]);
  }
  pieceLocations.find(
    (obj) => obj.squareIndex === move.startSquare
  ).squareIndex = move.targetSquare;
  highlightLastMove(move.startSquare, move.targetSquare);
  playSoundEffects(type);
  document.getElementsByClassName('action')[1].classList.remove('disabled-recapeButton')
  document.getElementsByClassName('action')[2].classList.remove('disabled-recapeButton')
  let active = document.getElementsByClassName('active-move');
  if (active.length) {
    let pcActiveMove = active[1]
    document.getElementsByClassName('analysis-board')[0].scrollTop = pcActiveMove.offsetTop
  }

}
//Main Game Engine(New optimized,fast and powerful)
function gameEngine(board, color) {

  document.getElementsByTagName("title")[0].innerHTML =
    "Computer playing-PiChess Play with computer";
  nodesEvaluated = 0;
  transpositionsCount = 0;
  let depth = Depth;
  let bestmoves;
  let startTime = new Date().getTime();
  let searchResult = iterativeDeepening(board, color, 100 * depth, 5 * depth);
  let endTime = new Date().getTime();
  bestmoves = searchResult.bestmoves;
  let deltaT = endTime - startTime;
  document.getElementsByClassName("depth-count")[0].innerHTML =
    searchResult.searchedDepth;
  document.getElementsByClassName("time-count")[0].innerHTML = deltaT + "ms";
  document.getElementsByClassName("transpositions-count")[0].innerHTML =
    transpositionsCount;
  document.getElementsByClassName("nodes-count")[0].innerHTML = nodesEvaluated;
  let move;

  if (bestmoves.length == 0) {
    let temp = allLegalMoves(board, color);
    let len = temp.length;
    if (len) {
      move = temp[Math.round((len - 1) * Math.random())];
    }
  } else {
    let rand = Math.round((bestmoves.length - 1) * Math.random());
    move = bestmoves[rand];
  }
  if (turn * perspective == 1) moveCount++;
  MakeMove(board, move, true);

  document.getElementsByTagName("title")[0].innerHTML =
    "Your Turn- PiChess Play with computer";
}

//sound effects
function playSoundEffects(type) {
  switch (type) {
    case "check":
      checkSound.play();
      break;
    case "castle":
      castleSound.play();
      break;
    case "promotion":
      promotionSound.play();
      break;
    case "capture":
      captureSound.play();
      break;
    case "move":
      moveSound.play();
      break;

    default:
      moveSound.play();
  }
}

//Main min-max search function

function search(board, color, depth) {
  if (depth == 0) {
    return [evaluatePosition(board, color)];
  }
  let legalMovesForEngine = allLegalMoves(board, color);
  let len = legalMovesForEngine.length;
  if (len == 0) {
    let check = isUnderCheck(board, color);
    if (check) {
      //checkmate
      return [-Infinity];
    }
    //stalemate
    return [0];
  }
  let bestEvaluation = -Infinity;

  let index = [];

  for (let i = 0; i < len; i++) {
    let move = legalMovesForEngine[i];

    //store the castling and en passant rights in a sepatete variable and them pass them into the unMove fuction
    let cRights = storeCastlingRights();
    let eRights = storeEnPassantRights();

    playMove(board, move);
    nodesEvaluated++;
    let value = -search(board, -color, depth - 1)[0];

    if (value == Infinity && isUnderCheck(board, -color)) {
      unMove(board, move, cRights, eRights);

      bestEvaluation = value;
      index = [];
      index.push(move);
      return [bestEvaluation, index];
    } else if (value > bestEvaluation) {
      bestEvaluation = value;
      index = [];
      index.push(move);
    } else if (bestEvaluation == value && !index.includes(move)) {
      index.push(move);
    }

    unMove(board, move, cRights, eRights);
  }

  return [bestEvaluation, index];
}

function runPerformanceTest(board, color, depth) {
  if (depth == 0) {
    return 1;
  }
  let legalMovesForEngine = allLegalMoves(board, color);
  let len = legalMovesForEngine.length;
  let positions = 0;
  for (let i = 0; i < len; i++) {
    let move = legalMovesForEngine[i];

    //store the castling and en passant rights in a sepatete variable and them pass them into the unMove fuction
    let cRights = storeCastlingRights();
    let eRights = storeEnPassantRights();

    playMove(board, move);
    positions += runPerformanceTest(board, -color, depth - 1);

    unMove(board, move, cRights, eRights);
  }

  return positions;
}

function evaluatePosition(board, color) {
  let myColorValue = material(board, color),
    oppositeColorValue = material(board, -color);

  return (
    myColorValue -
    oppositeColorValue +
    endgameEvaluation(color) +
    mapEvaluation(board, color) -
    mapEvaluation(board, -color)
  );
}

//Altering the evaluation function to make the engine play endgame (like a pro)

function endgameEvaluation(board, color) {
  let endgameFactor = totalPieces(board, -color);
  // let endgameFactor = material(board,-color)
  let evaluation = 0;
  let indexOfMyKing = positionOfKing(color);
  let indexOfOpponentKing = positionOfKing(-color);
  let x1 = indexOfOpponentKing % 8,
    y1 = Math.floor(indexOfOpponentKing / 8);

  let distance = Math.abs(x1 - 3.5) + Math.abs(y1 - 3.5); // distance of opponent king from the center
  let x2 = indexOfMyKing % 8,
    y2 = Math.floor(indexOfMyKing / 8);
  //distance between kings

  let kingsDistance = Math.abs(x1 - x2) + Math.abs(y1 - y2);
  if (color == turn) {
    evaluation += distance;
    if (x1 == 0 || y1 == 0 || x1 == 7 || y1 == 7) {
      evaluation += 6 / kingsDistance;
    }
  }

  evaluation = evaluation / endgameFactor;
  return evaluation;
}
//function for map evaluation
function mapEvaluation(board, color) {
  let myColorMap = 0;
  let maxPossible = 0;
  let indices = color == 1 ? whiteOccupiedSquares : blackOccupiedSquares;

  for (let index of indices) {
    switch (board[index] * perspective) {
      case 10:
        myColorMap += whiteQueenMap[index] / 3;
        break;
      case 6:
        myColorMap += whiteRookMap[index] / 5;
        break;
      case 4:
        myColorMap += whiteBishopMap[index] / 4;
        break;
      case 3:
        myColorMap += whiteKnightMap[index] / 4;
        break;
      case 2:
        myColorMap += whiteKingMap[index] / 3;
        break;
      case 1:
        myColorMap += whitePawnMap[index] / 5;
        break;
      case -10:
        myColorMap += blackQueenMap[index] / 3;
        break;
      case -6:
        myColorMap += blackRookMap[index] / 5;
        break;
      case -4:
        myColorMap += blackBishopMap[index] / 4;
        break;
      case -3:
        myColorMap += blackKnightMap[index] / 4;
        break;
      case -2:
        myColorMap += blackKingMap[index] / 3;
        break;
      case -1:
        myColorMap += blackPawnMap[index] / 5;
        break;
    }
  }

  return myColorMap;
}


// //function to find the index of the king of the given color
function positionOfKing(color) {
  if (color == 1) {
    return indexOfWhiteKing;
  } else if (color == -1) {
    return indexOfBlackKing;
  }
}

// //function to return the number of pieces of a particular color
function totalPieces(color) {
  let indices = color == 1 ? whiteOccupiedSquares : blackOccupiedSquares;

  return indices.length;
}
function material(board, color) {
  let pieceMaterial = 0;
  let indices = color == 1 ? whiteOccupiedSquares : blackOccupiedSquares;
  for (let i of indices) {
    pieceMaterial += board[i] * color;
    if (Math.abs(board[i]) == 4) pieceMaterial -= 0.8;
    if (Math.abs(board[i]) == 2) pieceMaterial -= 2;
  }

  return pieceMaterial;
}

function allLegalMoves(board, color) {
  let data = [];
  let indices = color == 1 ? whiteOccupiedSquares : blackOccupiedSquares;
  for (let index of indices) {
    data = data.concat(finalLegalMoves(board, index, color));
  }
  return data;
}

function playMove(board, move) {
  updateBitBoard(board, move, false);
  if (move.isCastle) {
    board[move.targetSquare] = board[move.startSquare];
    board[move.startSquare] = 0;
    board[move.castleEnd] = board[move.castleStart];
    board[move.castleStart] = 0;
  } else if (move.isPromotion) {
    board[move.targetSquare] = move.promotionPiece;
    board[move.startSquare] = 0;
  } else if (move.isEnPassant) {
    board[move.targetSquare] = board[move.startSquare];
    board[move.startSquare] = 0;
    board[move.enPassantSquare] = 0;
  } else {
    board[move.targetSquare] = board[move.startSquare];
    board[move.startSquare] = 0;
  }

  checkForCastlingRights(move);
  checkForEnPassantRights(board, move.startSquare, move.targetSquare, turn);
  updateIndicesOfKings(move.startSquare, move.targetSquare);
  updateOccupationIndices(move, false);

  return;
}

function unMove(board, move, cRights, eRights) {
  if (move.isCastle) {
    board[move.startSquare] = board[move.targetSquare];
    board[move.targetSquare] = 0;
    board[move.castleStart] = board[move.castleEnd];
    board[move.castleEnd] = 0;
  } else if (move.isPromotion) {
    board[move.targetSquare] = move.capturePiece;
    if (Math.floor(move.startSquare / 8) == 1) {
      board[move.startSquare] = perspective;
    } else {
      board[move.startSquare] = -perspective;
    }
  } else if (move.isEnPassant) {
    board[move.startSquare] = board[move.targetSquare];
    board[move.targetSquare] = 0;
    board[move.enPassantSquare] = -board[move.startSquare];
  } else {
    board[move.startSquare] = board[move.targetSquare];
    board[move.targetSquare] = move.capturePiece;
  }
  whiteCastle[0] = cRights[0][0];
  whiteCastle[1] = cRights[0][1];
  blackCastle[0] = cRights[1][0];
  blackCastle[1] = cRights[1][1];

  enPassantForWhite = eRights[0];
  enPassantForBlack = eRights[1];

  updateIndicesOfKings(move.targetSquare, move.startSquare);
  updateOccupationIndices(move, true);
  updateBitBoard(board, move, true);
}
function addMoveToAnalysisBoard(board, movePlayed, check) {
  if (turn == -1) {
    let div = document.createElement("move");
    div.classList.add("move");
    div.classList.add("move-pc");
    //highlightine the current move
    let currentMove = document.getElementsByClassName("active-move");
    let len = currentMove.length;
    for (let i = 0; i < len; i++) {
      currentMove[0].classList.remove("active-move");
    }
    div.classList.add("active-move");
    let moveDiv = document.getElementsByClassName("moveDiv");
    let d = moveDiv[moveDiv.length - 1];
    let move = NameMove(movePlayed, board[movePlayed.targetSquare], check);
    div.innerHTML = `${move}`;
    d.appendChild(div.cloneNode(true));
    div.classList.add("move-mobile");
    div.classList.remove("move-pc");
    moveDiv[moveDiv.length / 2 - 1].appendChild(div);

    return;
  }

  let move = NameMove(movePlayed, board[movePlayed.targetSquare], check);
  let moveDiv = document.createElement("div");
  moveDiv.classList.add("moveDiv");
  let numberDiv = document.createElement("div");
  numberDiv.classList.add("number-div");
  numberDiv.innerHTML = `${moveCount}`;
  // numberDiv.classList.add('move')
  let div = document.createElement("div");
  div.classList.add("move");
  div.classList.add("move-pc");
  div.innerHTML = `${move}`;
  //
  //highlightine the current move
  let currentMove = document.getElementsByClassName("active-move");
  let len = currentMove.length;
  for (let i = 0; i < len; i++) {
    currentMove[0].classList.remove("active-move");
  }
  div.classList.add("active-move");
  //
  moveDiv.appendChild(numberDiv);

  moveDiv.appendChild(div);
  document
    .getElementsByClassName("analysis-board")[0]
    .appendChild(moveDiv.cloneNode(true));
  div.classList.add("move-mobile");
  div.classList.remove("move-pc");
  document
    .getElementsByClassName("analysis-board-mobile")[0]
    .appendChild(moveDiv.cloneNode(true));


}

function MoveType(move) {
  if (move.isPromotion) {
    return "promotion";
  }
  //checking for castling
  else if (move.isCastle) {
    return "castle";
  }
  //checking for en passant
  else if (move.isEnPassant || move.capturePiece) {
    return "capture";
  }
  return "move";
}

/*event listener on the save game button*/
document
  .getElementsByClassName("save-game")[0]
  .addEventListener("click", (e) => {
    let date = new Date();
    let filename = date;
    downloadGame(filename);
  });

function printResult(resultFlag, name, reason) {
  if (resultFlag) {
    /*some one won the game*/
    document.getElementsByClassName(
      "winner-name"
    )[0].innerHTML = `${name} wins <i class="fas fa-trophy"></i>`;
    document.getElementsByClassName("win-reason")[0].innerHTML = `(${reason})`;

    if (name == "White") {
      document.getElementsByClassName("my-side")[0].classList.add("winner");
      document
        .getElementsByClassName("opposite-side")[0]
        .classList.add("loser");
    } else {
      document.getElementsByClassName("my-side")[0].classList.add("loser");
      document
        .getElementsByClassName("opposite-side")[0]
        .classList.add("winner");
    }
  } else {
    if (name == "Draw") {
      document.getElementsByClassName(
        "winner-name"
      )[0].innerHTML = `Draw  <i class="fas fa-balance-scale"></i>`;
      document.getElementsByClassName(
        "win-reason"
      )[0].innerHTML = `(${reason})`;
    } else {
      document.getElementsByClassName(
        "winner-name"
      )[0].innerHTML = `Aborted <i class="fas fa-balance-scale"></i>`;
    }
  }

  document.getElementsByClassName("gameover-box-wrapper")[0].style.display =
    "flex";
}

//function for enabling options
function enableOptions() {
  document.getElementsByClassName("resign")[0].classList.remove("disabled");
  document.getElementsByClassName("resign")[0].classList.add("enabled");
  document.getElementsByClassName("abort")[0].classList.remove("enabled");
  document.getElementsByClassName("abort")[0].classList.add("disabled");
  document.getElementsByClassName("abort")[0].style.pointerEvents = "none";
}

function sendDataToServer() {
  let obj = {
    url: window.location.href,
    board: board,
    Moves: Moves,
    pieceLocations: pieceLocations,
    turn: turn,
    depth: Depth,
    moveCount: moveCount,
    moveTypes: moveTypes,
    pointer: pointer,
    indexOfBlackKing: indexOfBlackKing,
    indexOfWhiteKing: indexOfWhiteKing,
    gameOver: gameOver,
    analysisBoard:
      document.getElementsByClassName("analysis-board")[0].innerHTML,
    analysisBoardMobile: document.getElementsByClassName(
      "analysis-board-mobile"
    )[0].innerHTML,
  };

  socket.emit("save-board-data", JSON.stringify(obj));
}

function getGameData() {
  let moves = document.getElementsByClassName("move");
  let moveSerial = document.getElementsByClassName("number-div");
  let text = "";
  for (let i = 0; i < moves.length / 2; i++) {
    text +=
      i / 2 +
      1 +
      "." +
      " " +
      moves[i].innerHTML +
      " " +
      moves[i + 1].innerHTML +
      "  ";
    i++;
  }
  return text;
}

function downloadGame(filename) {
  // Assuming 'yourFileContent' is the content of your .pgn file
  let date = new Date();
  var heading = `[Event "Unratted PiChess Match"]\n[Date: "${date}"]\n[White "Player Anonymous"]\n[Black "Computer(depth ${Depth})"]\n\n`;
  var gameContent = heading + getGameData();

  var blob = new Blob([gameContent], { type: "application/octet-stream" });
  var url = URL.createObjectURL(blob);

  var a = document.createElement("a");
  a.href = url;
  a.download = filename + ".pgn";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function MakeMove(board, move, smooth) {
  document.getElementsByClassName("second-board")[0].style.display = "flex";
  document.getElementsByClassName("opponent-selection-board")[0].style.display =
    "none";

  let type = MoveType(move);
  if (turn == 1) moveCount++;
  playMove(board, move);
  Moves.push(move);
  pointer++;
  let oppositeLegalMoves = allLegalMoves(board, -turn);
  let len = oppositeLegalMoves.length;

  let check = false;

  if (isUnderCheck(board, -turn)) {
    check = true;
    if (len == 0) {
      gameOver = true;
    }

    type = "check";
  }

  moveTypes.push(type);
  addMoveToAnalysisBoard(board, move, check);
  refreshBoard(move, smooth, type);

  unHightlight();
  if (check) checkKingIndex(-turn);
  if (gameOver) {
    removeBottomActions();
    document.getElementsByClassName("save-game")[0].style.display = "flex";

    document.getElementsByClassName("rematch")[0].style.display = "flex";
    setTimeout(() => {
      gameEnd.play();

      if (turn == 1) {
        printResult(true, "White", "Checkmate");
        chessboard.pointerEvents = "none";
      } else {
        printResult(true, "Black", "Checkmate");
        chessboard.pointerEvents = "none";
      }
    }, 1000);
  }

  changeTurn();
  sendDataToServer();
  enableOptions();



}

function createGameoverSymbol(winnerIndex, loserIndex) {
  let div1 = document.createElement("div");
  div1.innerHTML = '<i class="fas fa-crown"></i>';
  div1.style.gridColumnStart = (winnerIndex % 8) + 1;
  div1.style.gridRowStart = Math.floor(winnerIndex / 8) + 1;
  div1.classList.add("winner-symbol");
  chessboard.appendChild(div1);

  let div2 = document.createElement("div");
  div2.classList.add("loser-symbol");
  div2.innerHTML = "#";
  div2.style.gridColumnStart = (loserIndex % 8) + 1;
  div2.style.gridRowStart = Math.floor(loserIndex / 8) + 1;
  chessboard.appendChild(div2);
}

function closeGameoverBoxDialog() {
  document.getElementsByClassName("gameover-box-wrapper")[0].style.display =
    "none";
}

function removeBottomActions() {
  document.getElementsByClassName("bottom-actions")[0].style.display = "none";
}

addEventListenerToMoveRecapeButtons();

function addEventListenerToMoveRecapeButtons() {
  let moveRecapeButtons = document.getElementsByClassName("action");
  moveRecapeButtons[1].addEventListener("click", (e) => {

    fastBackward()



  });
  moveRecapeButtons[2].addEventListener("click", (e) => {
    backward()



  });
  moveRecapeButtons[3].addEventListener("click", (e) => {
    forward()

  });
  moveRecapeButtons[4].addEventListener("click", (e) => {
    fastForward()

  });

  window.addEventListener('keydown', e => {
    if (e.key == 'ArrowLeft') {
      backward()

    }
    else if (e.key == 'ArrowRight') {
      forward()
    }
    else if (e.key == 'ArrowDown') {
      fastForward()
    }
    else if (e.key == 'ArrowUp') {
      fastBackward()
    }
  })
}

function forward() {
  let moveRecapeButtons = document.getElementsByClassName("action");

  if (pointer < Moves.length) {
    refreshBoard(Moves[pointer], true, moveTypes[pointer]);
    pointer++;
  }
  if (pointer >= Moves.length) {
    chessboard.style.pointerEvents = "auto";
    moveRecapeButtons[3].classList.add("disabled-recapeButton");
    moveRecapeButtons[4].classList.add("disabled-recapeButton");
  } else {
    chessboard.style.pointerEvents = "none";
  }

  let active = document.getElementsByClassName('active-move')
  let len = active.length
  for (let i = 0; i < len; i++) {
    active[0].classList.remove('active-move')
  }

  document
    .getElementsByClassName("move-pc")
  [pointer - 1].classList.add("active-move");
  document
    .getElementsByClassName("move-mobile")
  [pointer - 1].classList.add("active-move");

}

function backward() {
  let moveRecapeButtons = document.getElementsByClassName("action");

  if (pointer > 0) {
    unMakeMove(Moves[pointer - 1], true, moveTypes[pointer - 1]);
    if (Moves[pointer - 2]) {
      highlightLastMove(Moves[pointer - 2].startSquare, Moves[pointer - 2].targetSquare)
    }
    else {
      console.log("Unhigligted")
      unHightlight()
    }
    pointer--;
  }
  chessboard.style.pointerEvents = "none";
  if (pointer == 0) {
    moveRecapeButtons[2].classList.add("disabled-recapeButton");
    moveRecapeButtons[1].classList.add("disabled-recapeButton");
  }


  let active = document.getElementsByClassName('active-move')
  let len = active.length
  for (let i = 0; i < len; i++) {
    active[0].classList.remove('active-move')

  }
  if (pointer) {

    document
      .getElementsByClassName("move-pc")
    [pointer - 1].classList.add("active-move");
    document
      .getElementsByClassName("move-mobile")
    [pointer - 1].classList.add("active-move");

  }


}

function fastForward() {
  let moveRecapeButtons = document.getElementsByClassName("action");

  if (Moves.length) {
    while (pointer < Moves.length) {
      refreshBoard(Moves[pointer], true, moveTypes[pointer]);
      pointer++;
    }
    chessboard.style.pointerEvents = "auto";
  }
  moveRecapeButtons[4].classList.add("disabled-recapeButton");
  moveRecapeButtons[3].classList.add("disabled-recapeButton");

  let active = document.getElementsByClassName('active-move')
  let len = active.length
  for (let i = 0; i < len; i++) {
    active[0].classList.remove('active-move')

  }
  document
    .getElementsByClassName("move-pc")
  [pointer - 1].classList.add("active-move");
  document
    .getElementsByClassName("move-mobile")
  [pointer - 1].classList.add("active-move");

}

function fastBackward() {
  let moveRecapeButtons = document.getElementsByClassName("action");

  if (Moves.length) {
    while (pointer > 0) {
      unMakeMove(Moves[pointer - 1], true, moveTypes[pointer - 1]);
      if (Moves[pointer - 2]) {
        highlightLastMove(Moves[pointer - 2].startSquare, Moves[pointer - 2].targetSquare)
      }
      else {
        console.log("Unhgihlight")
        unHightlight()
      }
      pointer--;
    }
    chessboard.style.pointerEvents = "none";
    moveRecapeButtons[1].classList.add("disabled-recapeButton");
    moveRecapeButtons[2].classList.add("disabled-recapeButton");

    let active = document.getElementsByClassName('active-move')
    let len = active.length
    for (let i = 0; i < len; i++) {
      active[0].classList.remove('active-move')

    }
    document.getElementsByClassName('analysis-board')[0].scrollTop = 0
  }

}
function boardToFen(board, perspective) {
  let fen = "";
  let i = (perspective == 1) ? 0 : 63;
  let emptyStreak = 0;
  while (true) {
    if (board[i]) {
      if (emptyStreak) {
        fen += emptyStreak.toString();
        emptyStreak = 0;
      }
      switch (board[i]) {
        case 10:
          fen += "Q";
          break;
        case 6:
          fen += "R";
          break;
        case 3:
          fen += "N";
          break;
        case 4:
          fen += "B";
          break;
        case 1:
          fen += "P";
          break;
        case 2:
          fen += "K";
          break;
        case -10:
          fen += "q";
          break;
        case -6:
          fen += "r";
          break;
        case -3:
          fen += "n";
          break;
        case -4:
          fen += "b";
          break;
        case -1:
          fen += "p";
          break;
        case -2:
          fen += "k";
          break;
      }
    } else {
      emptyStreak++;
      if (i % 8 == 7) {
        fen += emptyStreak.toString();
        emptyStreak = 0;
      }
    }
    i += perspective;
    if (i < 0 || i > 63) break;
  }
  return fen;
}

function selectOpponent(element) {
  let bot_names = [
    "Timid Pawn",
    "Faltering Knight",
    "Vulnerable Bishop",
    "Doubting Rook",
    "Wavering Queen",
    "Fragile King",
    "Insecure Monarch",
    "Feeble Sovereign",
  ];
  var bot_descriptions = [
    "Hi, I am Timid Pawn(350). I may stumble in the face of challenges.",
    "Greetings, I am Faltering Knight(700). I strive to improve my skills.",
    "Salutations! I am Vulnerable Bishop(1050). My defenses are not impenetrable.",
    "Hello, I am Doubting Rook(1400). I sometimes second-guess my moves.",
    "Good day! I am Wavering Queen(1750). My confidence may waver under pressure.",
    "Greetings, I am Fragile King(2100). My reign is not without vulnerability.",
    "Hello, I am Insecure Monarch(2450). I may falter in my leadership.",
    "Greetings, I am Feeble Sovereign(2800). My strength is yet to be fully realized.",
  ];

  // Accessing the description of the first bot (Timid Pawn)
  var description_of_timid_pawn = bot_descriptions[0];

  // Accessing the description of the second bot (Faltering Knight)
  var description_of_faltering_knight = bot_descriptions[1];

  // Similarly, you can access descriptions of other bots using their respective indices

  document
    .getElementsByClassName("active-opponent")[0]
    .classList.remove("active-opponent");
  element.classList.add("active-opponent");

  Depth =
    Array.from(document.getElementsByClassName("opponent")).indexOf(element) +
    1;
  document.getElementsByClassName("opponent-profile-description")[0].innerHTML =
    bot_descriptions[Depth - 1];
  document.getElementsByClassName("opponent-profile-name")[0].innerHTML =
    bot_names[Depth - 1] + "(" + Depth * 350 + ")";

  document.getElementsByClassName("profile-name")[0].innerHTML =
    bot_names[Depth - 1];
  document.getElementsByClassName("profile-rating")[0].innerHTML =
    "(" + Depth * 350 + ")";
}

function beginPlay() {
  document.getElementsByClassName("second-board")[0].style.display = "flex";
  document.getElementsByClassName("opponent-selection-board")[0].style.display =
    "none";
  if (turn == -perspective) {
    setTimeout(() => {
      gameEngine(board, turn);
    }, 10);
  }
}

function highlightBitBoard(pieceName) {
  let currentBitBoard = bitboard
    .getBitBoard("_" + pieceName + "Bitboard")
    .toString(2);
  let len = currentBitBoard.length;
  for (let i = len - 1; i >= 0; i--) {
    if (currentBitBoard[i] == "1") {
      squares[63 + i - len + 1].classList.add(pieceName);
    } else {
      squares[63 + i - len + 1].classList.remove(pieceName);
    }
  }
  for (let i = 63 - len - 1; i >= 0; i--) {
    squares[i].classList.remove(pieceName);
  }
}

function setBitCount(str) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] == "1") {
      count++;
    }
  }

  return count;
}

function addDetailsToElement(event, content) {
  let div = document.createElement('div');
  div.classList.add('details-div');
  div.innerHTML = content;
  div.style.left = event.clientX + 'px'
  div.style.top = event.clientY + 'px'

  document.appendChild(div)
}

function createPromotionOptions(move) {
  let initial = move.startSquare, final = move.targetSquare;
  let color = board[move.startSquare] / Math.abs(board[move.startSquare])
  let promotionDivWrapper = document.createElement('div');
  promotionDivWrapper.classList.add('promotion-div-wrapper');
  let promotionOptions = document.createElement('div');
  promotionOptions.classList.add('promotion-options');
  let arr = [10, 6, 4, 3];
  for (let i = 0; i < 4; i++) {
    let promotionOption = document.createElement('img');
    promotionOption.classList.add('promotion-option');
    promotionOption.src = '../../assets/image-files/piece-images/' + arr[i] * color + '.png';
    promotionOptions.appendChild(promotionOption)
    promotionOption.addEventListener('click', e => {
      move.promotionPiece = arr[i] * color;
      promotionDivWrapper.style.display = 'none'
    })

  }

  let rect = squares[move.targetSquare].getBoundingClientRect();
  promotionOptions.style.transform = `translate(${rect.left}px, ${rect.top}px)`
  promotionDivWrapper.appendChild(promotionOptions);
  document.body.appendChild(promotionDivWrapper)

}


function algebraicNotationToMove(algebraicNotation) {

  let move = {};
  let files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  let ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  let startFile = files.indexOf(algebraicNotation[0]);
  let startRank = ranks.indexOf(algebraicNotation[1]);

  let targetFile = files.indexOf(algebraicNotation[2]);
  let targetRank = ranks.indexOf(algebraicNotation[3]);


  let initial = 8 * (7 - startRank) + startFile
  let final = 8 * (7 - targetRank) + targetFile


  move.startSquare = initial;
  move.targetSquare = final;

  if (algebraicNotation[4].toUpperCase() >= 'A' && algebraicNotation[4].toUpperCase() <= 'Z') {

    let arr = { 'Q': 10, 'R': 6, 'B': 4, 'N': 3 }

    move.isPromotion = true;
    move.promotionPiece = arr[algebraicNotation[4].toUpperCase()]

  }



  return move;



}

function generateUniqueNumber(squareIndex, piece) {
  // Prime numbers for hashing
  const prime1 = 17;
  const prime2 = 31;

  // Generate unique number using prime number multiplication
  return (squareIndex * prime1) + (piece * prime2);
}

function highlightVictoryIndex(index) {
  let rect1 = squares[0].getBoundingClientRect()
  let rect2 = squares[index].getBoundingClientRect()
  let victorySymbol = document.createElement('div');
  victorySymbol.classList.add('victory-symbol');
  victorySymbol.innerHTML = '<i class="fas fa-crown"></i>';
  victorySymbol.style.transform = `translate(${rect2.left - rect1.left}px, ${rect2.top - rect1.top}px)`;
  chessboard.appendChild(victorySymbol)

}
function highlightDefeatIndex(index) {
  let rect1 = squares[0].getBoundingClientRect()
  let rect2 = squares[index].getBoundingClientRect()
  let victorySymbol = document.createElement('div');
  victorySymbol.classList.add('defeat-symbol');
  victorySymbol.innerHTML = '<i class="fas fa-hashtag"></i>';
  victorySymbol.style.transform = `translate(${rect2.left - rect1.left}px, ${rect2.top - rect1.top}px)`;
  chessboard.appendChild(victorySymbol)

}
function highlightDrawIndex(index) {
  let rect1 = squares[0].getBoundingClientRect()
  let rect2 = squares[index].getBoundingClientRect()
  let victorySymbol = document.createElement('div');
  victorySymbol.classList.add('draw-symbol');
  victorySymbol.innerHTML = '&frac12;';
  victorySymbol.style.transform = `translate(${rect2.left - rect1.left}px, ${rect2.top - rect1.top}px)`;
  chessboard.appendChild(victorySymbol)

}
