// Required Modules
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require("path")

const db = require("./database/dbmethods")
const helper_functions = require("./helper_functions");
const stockfishConnections = require("./stockfish_connections");
const chess = require("./chess")
const playOnlineConnections = require("./play_online_connections");
const playMycomputerConnections = require("./play_mycomputer_connections");
const signupConnections = require("./signup")


app.use(cookieParser())
const sessionMiddleware = session({
  secret: 'ddfd58d8f5d53#@%hgg55$#',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 3600000 // Session expiration time in milliseconds (1 hour in this example)
  }
});

app.use(sessionMiddleware);

app.set('view engine', 'pug');

// Set the directory where your Pug templates are located
app.set('views', path.join(__dirname, '/views'));


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));


const isAuthenticated = (req, res, next) => {
  let sessionId = req.session.sessionId;
  const user = db.findOne('session_tokens', { token: { session_id: sessionId, expired: false } });
  if (user) {
    // User is authenticated, allow access to the next middleware or route handler
    next();
  } else {
    // User is not authenticated, redirect to the login page
    res.redirect('/login');
  }
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/src/HTML_Files/index.html"))
});
app.get('/profile', (req, res) => {
  let sessionId = req.session.sessionId;
  const user = db.findOne('session_tokens', { token: { session_id: sessionId, expired: false } });
  if (user) {
    const userid = user.userid;
    const userInfo = db.findOne('game_info', { userid: userid }).info;

    res.render('profile', userInfo)
  }
  else {
    res.redirect('/login?returnUrl=profile')
  }

})

app.get("/signup", (req, res) => {
  // res.sendFile(
  //   path.join(__dirname, "/public/src/HTML_Files/signup.html")
  // );
  res.send("<h1>404- Not Found</h1><br><a href='/'>Home</a>")
});
app.get("/login", (req, res) => {
  let sessionId = req.session.sessionId;
  const user = db.findOne('session_tokens', { token: { session_id: sessionId, expired: false } });
  if (user) {
    res.redirect('/play')
  }
  else {

    res.sendFile(
      path.join(__dirname, "/public/src/HTML_Files/login.html")
    );
  }
});

app.get("/play", isAuthenticated, (req, res) => {

  res.sendFile(path.join(__dirname, "/public/src/HTML_Files/play.html"))



});

app.get("/play/puzzle", (req, res) => {
  res.send("This is a puzzle")
})

/**handling post request */
app.post('/recape-game', (req, res) => {
  const data = req.body.gameInfo
  console.log('data', data)
  const game = chess.decodeGame(data.game, data.perspective);
  data.game = game
  let sessionId = req.session.sessionId;
  const user = db.findOne('session_tokens', { token: { session_id: sessionId, expired: false } });
  if (user) {
    let url = '/games/' + helper_functions.generateURL(8);
    res.send({ ok: true, url: url })
    app.get(url, (req, res) => {
      res.render('completed_game', { gameInfo: JSON.stringify(data) })
    })
  }

})
/**Main */

signupConnections.handleSignUp(app);
var onlineRequests = [];

io.of("/play").on("connection", (socket) => {


  socket.on("play-online-request", (data) => {
    if (onlineRequests.length == 0) {
      socket.userInfo = data
      onlineRequests.push(socket);
    }
    else if (onlineRequests[0].userInfo.userid === data.userid && false) {
      /**already searching a match */
      socket.emit('play-online-responce', { ok: false, errMessage: "Already searching an online match in another device or tab!" });
    }
    else {
      let url1 = "/play/online/" + helper_functions.generateURL(8);
      let url2 = "/play/online/" + helper_functions.generateURL(8);

      onlineRequests[0].emit("play-online-responce", { ok: true, url: url1 + "?userid=" + onlineRequests[0].userInfo.userid });
      socket.emit("play-online-responce", { ok: true, url: url2 + "?userid=" + data.userid });


      app.get(url1, (req, res) => {
        res.sendFile(
          path.join(__dirname, "/public/src/HTML_Files/white.html")
        );
      });
      app.get(url2, (req, res) => {
        res.sendFile(
          path.join(__dirname, "/public/src/HTML_Files/black.html")
        );
      });
      onlineRequests = [];
    }
    socket.on('cancel-online-request', data => {
      onlineRequests = onlineRequests.filter(element => element.userInfo.userid != data.userid);
      socket.emit('cancel-online-responce', { ok: true })
    })
    socket.on('disconnect', () => {
      onlineRequests = onlineRequests.filter(element => element.userInfo.userid != socket.userInfo.userid);
    })

  });


  socket.on("fetch-puzzle-request", (data) => {
    const puzzle = handlesPuzzleRequests.fetchRandomPuzzle();

    socket.emit("fetch-puzzle-responce", puzzle);
  });
});

const online = io.of("/play/online");

playOnlineConnections.handlePlayOnlineConnections(online);
playMycomputerConnections.handlePlayMyComputerRequests(io, app);
stockfishConnections.handleStockfishConnections(io, app);

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
