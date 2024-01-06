


//sounds
let moveSound = new Audio('/sound-effects/move-self.mp3')
let captureSound= new Audio('/sound-effects/capture.mp3')
let background=new Audio('/sound-effects/background.mp3');
let castleSound=new Audio('/sound-effects/castle.mp3')
let promotionSound=new Audio('/sound-effects/promote.mp3')
let checkSound=new Audio('/sound-effects/move-check.mp3')


//making chess board
let chessboard = document.getElementById('chessBoard');


chessBoard.style.width=`${window.innerWidth/2-70}px`
chessBoard.style.height=`${window.innerWidth/2-70}px`

let evaluationBar=document.getElementById('evaluationBar');
evaluationBar.style.height=`${window.innerWidth/2-70}px`


createBoard();
var perspective=1;
let str1="rnbqkbnrpppppppp8888PPPPPPPPRNBQKBNR"
let str2="RNBQKBNRPPPPPPPP8888pppppppprnbqkbnr"
let str=perspective==1?str1:str2;


let board=generateLightBoard(str)
console.log('initial board',board)

board=invertBoard(board,perspective);
console.log('generate board',board)

dummy(board);

let chessPieces = document.getElementsByClassName('piece');

let squares = document.getElementsByClassName('square');


var turn=perspective;


var totalPositionsEvaluated=0;
var unmoveCount=0;
var moveCount=0;
var Boards=[];
//initial indices of kings
var indexOfWhiteKing=FindIndexOfWhiteKing(board);
var indexOfBlackKing=FindIndexOfBlackKing(board);

console.log("indices",indexOfWhiteKing,indexOfBlackKing)

//counting the number of moves
var whiteMoveCouunt=0;
var blackMoveCount=0;


let diff=0;

var gameOver=false;



//some varibles for checking the availability of castling 



//some variables for checking the availability of en passant
let  enPassantForWhite=[false,-1];
let  enPassantForBlack=[false,-1];   
//alternate castling variables

let whiteCastle=[true,true];
let blackCastle=[true,true];

        

let legal=[];
let moveActive=[false,-1]
let previousIndex=0;
let Source=-1, Target=-1;
let source1,target1;
let sourceBackgroundColor;
let targetBackgroundColor;

for(let i=0;i<chessPieces.length;i++){
    chessPieces[i].addEventListener('click',()=>{
        humanMove(board,i);
        
    })

    dragAndDrop(chessPieces[i],i)
}





        



   