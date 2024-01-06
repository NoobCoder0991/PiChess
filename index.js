
//testing



//Main server file to handle connections

// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create an Express application
const app = express();

// Create an HTTP server using Express
const server = http.createServer(app);

// Create a Socket.IO server that listens to the HTTP server
const io = socketIo(server);

// Serve static files (e.g., HTML, CSS, JavaScript)
app.use(express.static('public'));

//players online

let playersOnline = [];
let sockets = [];


let connectedSockets = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})


//handling playoneline requests

let onlineurls=[]
let onlineData=[]
let onlineRooms=[]
let timeRemaining=[]

//handling the time remaing for black and white

let online = io.of('/playOnline')

online.on('connection', socket => {
  
  let clientUrl=socket.request.headers.referer
  if(onlineurls.includes(clientUrl)){
     
    //this socket has to be connected to the room of the initial socket of the same url
    for(let i=0;i<onlineRooms.length;i++){
      let url=onlineRooms[i].url
      if(url==clientUrl){
      
        socket.join(`${onlineRooms[i].roomId}`)
        
        socket.room=onlineRooms[i].roomId
        
        
      }
    }
    for(let i=0;i<timeRemaining.length;i++){
      
      let url=timeRemaining[i].url
      if(url==clientUrl){
        //saving the timme
        socket.time=timeRemaining[i].timeRemaining
        socket.countdown=timeRemaining[i].countdown
        socket.initialTime=timeRemaining[i].initialTime
        socket.oppositeSocket=timeRemaining[i].oppositeSocket
        timeRemaining[i].oppositeSocket.oppositeSocket=socket
        
        
      }
    }
    
  }
  else{
    onlineurls.push(clientUrl)
    onlineData.push({url:clientUrl})
    timeRemaining.push({url:clientUrl,timeRemaining:600000,countdown:false,initialTime:new Date()})
    // socket.time=600000
    // socket.countdown=false
    // socket.initialTime=new Date()
    
    
    
    
  
  }
  if (connectedSockets.length >= 1) {
    let oldSocket = connectedSockets.shift();
    let roomId = generateId();
  
    socket.join(`${roomId}`)
    onlineRooms.push({url:socket.request.headers.referer, roomId:`${roomId}`})
    
    oldSocket.join(`${roomId}`)
    onlineRooms.push({url:oldSocket.request.headers.referer, roomId:`${roomId}`})
    socket.room = `${roomId}`
    oldSocket.room = `${roomId}`

    oldSocket.countdown=false
    oldSocket.time=600000
    oldSocket.initialTime=new Date()
    socket.countdown=true
    socket.time=600000
    socket.initialTime=new Date()
    socket.oppositeSocket=oldSocket
    oldSocket.oppositeSocket=socket
    
    
  }
  else {
    // onlineRooms.push({url:socket.request.headers.referer, roomId:roomId})
    connectedSockets.push(socket)
  }
  socket.on('save-board-data-online',data=>{
    let currenturl=socket.request.headers.referer
    for(obj of onlineData){
      if(obj.url==currenturl){
        let a=JSON.parse(data)
        obj.board=Object.values(a.board)
        obj.turn=a.turn
        obj.moveCount=a.moveCount
        obj.moveTypes=a.moveTypes
        obj.pointer=a.pointer
        obj.indexOfBlackKing=a.indexOfBlackKing
        obj.indexOfWhiteKing=a.indexOfWhiteKing
        obj.gameOver=a.gameOver
        obj.analysisBoard=a.analysisBoard
        obj.analysisBoardMobile=a.analysisBoardMobile
        obj.depth=a.depth
        obj.boards=a.boards
      }
    }
  })

  socket.on('fetch-data-request-online',url=>{
    let found=false
    for(let i=0;i<onlineData.length;i++){
      if(onlineData[i].url==url){
        found=true
        socket.emit('fetch-data-responce-online',onlineData[i])
      }
    }
    if(!found){
      //socket was not found
      socket.emit('fetch-data-responce-online',false)
    }
  })


  //handling gameover
  socket.on('white-sent-message', message => {
    io.of('/playOnline').to(socket.room).emit('white-message', message);

  })
  socket.on('black-sent-message', message => {
    

    io.of('/playOnline').to(socket.room).emit('black-message', message);
  })

  socket.on('gameOver', data => {
    console.clear()
    io.of('/playOnline').to(socket.room).emit('quit', data)
  })


  // socket.on('readyok',data=>{


  // })

  socket.on('updateTime',color=>{

    let flag=socket.countdown
    let time=socket.time;
    if(flag){
      let currenTime=new Date()
      let timeElpased=currenTime-socket.initialTime
      time=socket.time-timeElpased
      socket.time=time
      socket.initialTime=new Date()
      
      for(let i=0;i<timeRemaining.length;i++){
        let url=timeRemaining[i].url
        if(url==socket.request.headers.referer){
          timeRemaining[i].timeRemaining=socket.time
          timeRemaining[i].initialTime=socket.initialTime
          timeRemaining[i].countdown=socket.countdown
          timeRemaining[i].oppositeSocket=socket.oppositeSocket
        }
      }
      
      
      
    }
    else{
      
      
      
      time=socket.time
      socket.time=time
      socket.initialTime=new Date()
      
      for(let i=0;i<timeRemaining.length;i++){
        let url=timeRemaining[i].url
        if(url==socket.request.headers.referer){
          timeRemaining[i].timeRemaining=socket.time
          timeRemaining[i].initialTime=socket.initialTime
          timeRemaining[i].countdown=socket.countdown
        }
      }
    }
    io.of('playOnline').to(socket.room).emit('updateTimeResponce',{color:color,time:time})
    // socket.emit('updateTimeResponce',{color:color,time:time})

  })

  socket.on('whitePlayedMove', data => {



    io.of('/playOnline').to(socket.room).emit('whiteResponce', data)
    
    socket.countdown=false
    socket.oppositeSocket.countdown=true
    
    
    
  })
  
  socket.on('blackPlayedMove', data => {
    
    
    io.of('playOnline').to(socket.room).emit('blackResponce', data)
    // io.of('/playOnline').to(socket.room).countdown=true
    socket.countdown=false
    socket.oppositeSocket.countdown=true
      

  })

  socket.on('disconnect', () => {
    connectedSockets = connectedSockets.filter((element) => element != socket)

  })

})
///


// handling the home page connectoins
let computerRequestURLs=[]
let savedData=[]

io.on('connection', (socket) => {




  //handling request for playing with computer

  let playComputerURL = generateURL(8)
  
  socket.on('play-computer-request', data => {
    
    app.get('/play-computer/' + playComputerURL, (req, res) => {
      res.sendFile('C:\\Users\\shafa\\Desktop\\BIG_FOLDER\\awesome-chess -2\\public\\m-engine.html')
    })
    socket.emit('play-computer-responce', '/play-computer/'+playComputerURL);
    io.of('/play-computer').on('connection',socket=>{
      
      let  clientUrl = socket.request.headers.referer;
      if(computerRequestURLs.includes(clientUrl)){
        //existing player
        //need to fetch the data of this player , the board postion and the turn 

      }
      else{
        computerRequestURLs.push(clientUrl)
        savedData.push({url:clientUrl})
      }
      socket.on('save-board-data',data=>{
        let currenturl=socket.request.headers.referer
        for (obj of savedData){
          let url=obj.url
          if(url==currenturl){
            let a=JSON.parse(data)
            obj.board=Object.values(a.board)
            obj.turn=a.turn
            obj.moveCount=a.moveCount
            obj.moveTypes=a.moveTypes
            obj.pointer=a.pointer
            obj.indexOfBlackKing=a.indexOfBlackKing
            obj.indexOfWhiteKing=a.indexOfWhiteKing
            obj.gameOver=a.gameOver
            obj.analysisBoard=a.analysisBoard
            obj.analysisBoardMobile=a.analysisBoardMobile
            obj.depth=a.depth
            obj.boards=a.boards
            
          }
        }

      })


      socket.on('fetch-data-request',url=>{
        let found=false;
        let s=socket.request.headers.referer
        for(let i=0;i<savedData.length;i++){
          let obj=savedData[i]
          let currenturl=obj.url
          if(s==currenturl){
            
            socket.emit('fetch-data-responce',obj)
            found=true
            break;
          }
          
        }
        if(!found){
          socket.emit('fetch-data-responce',false)
          
        }

      })
      socket.on('new-game-request',data=>{
        let computerUrl=generateURL(8)
        app.get('/play-computer/'+computerUrl,(req,res)=>{
          res.sendFile('C:\\Users\\shafa\\Desktop\\BIG_FOLDER\\awesome-chess -2\\public\\m-engine.html')


        })
        socket.emit('new-game-responce','/play-computer/'+computerUrl)
      })

      
    })
 
  })

  

  //
  //contact page request
  socket.on('contact', message => {
    app.get('/contact', (req, res) => {
      res.sendFile(__dirname + '/public/contact.html')
    })
    socket.emit('contact-responce', '/contact')
  })

  //sign up page request
  socket.on('signup', data => {
    app.get('/signup', (req, res) => {
      res.sendFile(__dirname + '/public/signup.html')
    })
    socket.emit('signup-responce', '/signup')
  })

  socket.on('playOnlineRequest', (data) => {

    let id = generateId();
    let name = 'Player Anonymous';
    if (!sockets.includes(socket)) {

      playersOnline.push({ name: name, id: id });
      sockets.push(socket);



      joinPlayers(sockets, playersOnline)
    }




  })
  socket.on('cancel-request', data => {
    sockets = sockets.filter((Element) => Element != socket)
  })




  socket.on('disconnect', () => {
    sockets = sockets.filter((Element) => Element != socket)
  });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


function generateId() {
  let id = 0;
  for (let i = 7; i >= 0; i--) {
    let rand = Math.round(9 * Math.random());
    id += rand * Math.pow(10, i)


  }
  return id;
}

function joinPlayers(sockets, playersOnline) {


  let len = sockets.length;
  if (len >= 2) {

    // let roomName=`room-${roomCount}`;
    // sockets[0].join(roomName)
    // sockets[1].join(roomName)
    // sockets[0].room=roomName;
    // sockets[1].room=roomName;
    // console.log('assingned rooms',sockets[0].room,sockets[1].room)
    // console.log('joined to room',roomName)
    sockets[0].emit('playOnlineResponce', playersOnline[0]);
    sockets[1].emit('playOnlineResponce', playersOnline[1]);

    //

    //

    // //Now make a common page for them
    let url1 = `/playOnline/${playersOnline[0].id}`
    let url2 = `/playOnline/${playersOnline[1].id}`

    app.get(url1, (req, res) => {
      res.sendFile(__dirname + '/public/main1.html')
    })

    app.get(url2, (req, res) => {
      res.sendFile(__dirname + '/public/main2.html')
    })

    sockets.splice(0, 2)
    playersOnline.splice(0, 2)




  }
  // callback();
}

function generateURL(length) {
  let data = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let len = data.length
  let str = ''
  for (let i = 0; i < length; i++) {
    let rand = Math.floor((len - 1) * Math.random())
    str += data[rand]
  }
  return str
}


