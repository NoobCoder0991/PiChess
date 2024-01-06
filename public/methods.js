

//creating chessboard
let dark = '#b58863';
dark = '#779952'
let light = '#f0d9b5'
light = '#edeed1'
function createBoard() {
    let square = document.createElement('div');
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            square.classList.add('square');
            square.style.gridRowStart = i;
            square.style.gridColumnStart = j;

            if ((j + i) % 2 == 0) {
             

                square.style.backgroundColor = light;


            }


            else {

                square.style.backgroundColor = dark;
            }
            chessboard.appendChild(square.cloneNode(true))

        }
    }

}

function dummy(board) {
    //creating elements
    let piece = document.createElement('img')
    piece.style.width = `${(window.innerWidth / 2 - 70) / 8}px`

    for (let i = 0; i < 64; i++) {
        piece.classList.remove('blankImage');
        piece.classList.add('piece');
        piece.src = `/piece-images-2/${board[i]*perspective}.png`
        if (board[i] == 0) {
            piece.classList.add('blankImage');
        }
        piece.style.gridColumnStart = i % 8 + 1;
        piece.style.gridRowStart = Math.floor(i / 8) + 1;
        chessboard.appendChild(piece.cloneNode(true))

    }


}

//function for converting image source to piece name



function coordinatesToIndex(arr) {
    return arr[0] + 8 * arr[1];
}

function isOutsideBoard(coordinates) {
    if (coordinates[0] < 0 || coordinates[0] >= 8 || coordinates[1] < 0 || coordinates[1] >= 8) {
        return true;
    }
    else {
        return false;
    }


}

function humanMove(board, index) {

    // let board = representBoard();
    if (!moveActive[0]) {
        legal = finalLegalMoves(board, index, turn);
        moveActive[0] = true;
        moveActive[1] = index;

        highlight(legal, index);





    }
    else {
        if (!legal.includes(index)) {
            unHightlight();
            moveActive[0] = false;
            removeOptions()
            if (board[index] * turn > 0) {
                
                moveActive[0] = true;
                moveActive[1] = index;
                legal = finalLegalMoves(board, index, turn)
                highlight(legal, index)
            }
            return;
        }
        //move belongs to the legal moves

        if ((board[moveActive[1]] == 1 && Math.floor(moveActive[1] / 8) == 1)) {


            promotionMoveForWhite(index);
            return;


        }
        else if (board[moveActive[1]] == -1 && Math.floor(moveActive[1] / 8) == 6) {
            promotionMoveForBlack(index);
            return;

        }
        else {

            let type = MoveType(board, moveActive[1], index);
            playMove(board, moveActive[1], index, 10);

            let oppositeLegalMoves = allLegalMoves(board, -turn);
            let len = oppositeLegalMoves.length;

            let check = false;
            if (isUnderCheck(board, -turn)) {
                check = true
                type = 'check';

            };

            //
            playSoundEffects(type)
            materialBarWidth(board)

            refreshBoard(board, moveActive[1], index)


            unHightlight()
            legal = []
            moveActive[0] = false;


            if (len == 0) {
                if (check) {
                    //checkmate
                    gameOver = true;
                    text.innerHTML = 'CHECKMATE'
                    if (turn == 1) {
                        result.innerHTML = '(White Wins)'
                    }
                    else {
                        result.innerHTML = '(Black Wins)'
                    }

                }
                else {
                    gameOver = true;
                    text.innerHTML = 'STALEMATE'
                    result.innerHTML = '(Draw)'
                }
            }

            //highlighting last move
            highlightLastMove(index, moveActive[1])

            legal = []
            changeTurn()


        }
    }








}
//remove function
function removeOptions() {
    let options = document.getElementsByClassName('options');

    for (let i = 0; i < 4; i++) {
        document.getElementById('chessBoard').removeChild(options[0])
    }
}

//promotion move for white
function promotionMoveForWhite(index) {
    let arr = [10, 6, 4, 3]
    let options = document.createElement('img');
    options.classList.add('options');
    // options.style.gridColumnStart=moveActive[1]%8+1;
    options.style.gridColumnStart = 9
    options.style.width = `${window.innerWidth / 16 - 70 / 8}px`
    options.style.height = `${window.innerWidth / 16 - 70 / 8}px`
    for (let i = 0; i < 4; i++) {
        options.style.gridRowStart = i + 1;
        options.src = `/piece-images-2/${arr[i]*perspective}.png`
        chessBoard.appendChild(options.cloneNode(true))
    }
    let promotionOptions = document.getElementsByClassName('options');

    for (let i = 0; i < 4; i++) {
        promotionOptions[i].addEventListener('click', (e) => {
            e.preventDefault()

            e.stopPropagation();

            if (i == 0) flag = 10;
            else if (i == 1) flag = 6;
            else if (i == 2) flag = 4;
            else flag = 3;
            removeOptions();

            let type = MoveType(board, moveActive[1], index);
            playMove(board, moveActive[1], index, flag);
            let oppositeLegalMoves = allLegalMoves(board, -color);
            let len = oppositeLegalMoves.length;
            let check = false;
            if (isUnderCheck(board, -color)) {
                check = true
                type = 'check'

            };

            //
            playSoundEffects(type)
            materialBarWidth(board)


            refreshBoard(board, moveActive[1], index)


            unHightlight()
            legal = []
            moveActive[0] = false;

            if (len == 0) {
                if (check) {
                    //checkmate
                    gameOver = true;
                    text.innerHTML = 'CHECKMATE'
                    if (turn == 1) {
                        result.innerHTML = '(White Wins)'
                    }
                    else {
                        result.innerHTML = '(Black Wins)'
                    }

                }
                else {
                    gameOver = true;
                    text.innerHTML = 'STALEMATE'
                    result.innerHTML = '(Draw)'
                }
            }

            //highlighting last move
            highlightLastMove(index, moveActive[1])

            legal = []
            changeTurn()
            return;


        })
    }


}

//promotion move for black
function promotionMoveForBlack(index) {
    let arr = [-3, -4, -6, -10]
    let options = document.createElement('img');
    options.classList.add('options');
    // options.style.gridColumnStart=moveActive[1]%8+1;
    options.style.gridColumnStart = 9
    options.style.width = `${window.innerWidth / 16 - 70 / 8}px`
    options.style.height = `${window.innerWidth / 16 - 70 / 8}px`
    for (let i = 0; i < 4; i++) {
        options.style.gridRowStart = i + 5;
        options.src = `/piece-images-2/${arr[i]*perspective}.png`
        chessBoard.appendChild(options.cloneNode(true))
    }
    let promotionOptions = document.getElementsByClassName('options');

    for (let i = 0; i < 4; i++) {
        promotionOptions[i].addEventListener('click', (e) => {
            e.preventDefault()

            e.stopPropagation();

            if (i == 0) flag = 3;
            else if (i == 1) flag = 4;
            else if (i == 2) flag = 6;
            else flag = 10;
            removeOptions();


            let type = MoveType(board, moveActive[1], index);
            playMove(board, moveActive[1], index, flag);
            let oppositeLegalMoves = allLegalMoves(board, -color);
            let len = oppositeLegalMoves.length;
            let check = false;
            if (isUnderCheck(board, -color)) {
                check = true
                type = 'check'

            };

            //
            playSoundEffects(type)
            materialBarWidth(board)


            refreshBoard(board, moveActive[1], index)


            unHightlight()
            legal = []
            moveActive[0] = false;

            if (len == 0) {
                if (check) {
                    gameOver = true;
                    //checkmate
                    text.innerHTML = 'CHECKMATE'
                    if (turn == 1) {
                        result.innerHTML = '(White Wins)'
                    }
                    else {
                        result.innerHTML = '(Black Wins)'
                    }

                }
                else {
                    gameOver = true;
                    text.innerHTML = 'STALEMATE'
                    result.innerHTML = '(Draw)'
                }
            }

            //highlighting last move
            highlightLastMove(index, moveActive[1])

            legal = []
            changeTurn()
            return;


        })
    }


}

//function for changing the material bar width

function materialBarWidth(board) {
    let w = material(board, 1)
    let b = material(board, -1)
    percent = (w / (w + b)) * 100;
    document.getElementById('whiteH').style.height = `${percent}%`
    document.getElementById('blackH').style.height = `${100 - percent}%`
    return;
}


//generate board using strng

function generateLightBoard(string) {
    let b = generateBoard(string);
    let board = new Int8Array(64)

    for (let i = 0; i < 64; i++) {
        board[i] = b[i]
    }

    return board;


}
function generateBoard(string) {
    let board = []

    for (let i = 0; i < string.length; i++) {
        if (string[i] == 'R') { board.push(6) }
        else if (string[i] == 'B') { board.push(4) }
        else if (string[i] == 'N') { board.push(3) }
        else if (string[i] == 'Q') { board.push(10) }
        else if (string[i] == 'K') { board.push(2) }
        else if (string[i] == 'P') { board.push(1) }

        else if (string[i] == 'r') { board.push(-6) }
        else if (string[i] == 'b') { board.push(-4) }
        else if (string[i] == 'n') { board.push(-3) }
        else if (string[i] == 'q') { board.push(-10) }
        else if (string[i] == 'k') { board.push(-2) }
        else if (string[i] == 'p') { board.push(-1) }
        else {
            let num = parseInt(string[i]);

            for (j = 0; j < num; j++) {
                board.push(0);
            }
        }


    }
    return board;


}

function refreshWholeBoard(board) {
    let chessPieces = document.getElementsByClassName('piece')
    for (let i = 0; i < 64; i++) {
        chessPieces[i].src = `/piece-images-2/${board[i]*perspective}.png`
        if (board[i] == 0) {
            chessPieces[i].classList.add('blankImage');

        }
        else {
            chessPieces[i].classList.remove('blankImage');


        }
    }
}







//checking for castling rights

function checkForCastlingRights(initial, final) {

    if (initial == 60) {
        whiteCastle = [false, false];
    }
    if (initial == 4) {
        blackCastle = [false, false];
    }
    if (initial == 63 || final == 63) {
        whiteCastle[0] = false;
    }
    if (initial == 56 || final == 56) {
        whiteCastle[1] = false;
    }
    if (initial == 0 || final == 0) {
        blackCastle[1] = false;
    }
    if (initial == 7 || final == 7) {
        blackCastle[0] = false;
    }

}

//checking for en passant rights 

function checkForEnPassantRights(board, initial, final, color) {
    let y1 = Math.floor(initial / 8)
    let y2 = Math.floor(final / 8)

    if (board[final] == 1 && y1 == 6 && y2 == 4 && color == 1) {
        enPassantForWhite = [false, -1];
        enPassantForBlack = [true, final];
    }
    else if (board[final] == -1 && y1 == 1 && y2 == 3 && color == -1) {
        enPassantForBlack = [false, -1];
        enPassantForWhite = [true, final];
    }
    else {

        enPassantForBlack = [false, -1];
        enPassantForWhite = [false, -1];
    }



}

//storing castling rights 
function storeCastlingRights() {
    let rights1 = [...whiteCastle]
    let rights2 = [...blackCastle]
    return [rights1, rights2]
}

function storeEnPassantRights() {
    let b1 = [...enPassantForWhite]
    let b2 = [...enPassantForBlack]


    return [b1, b2]
}


//function for finding the positions of kings 
function updateIndicesOfKings(initial, final) {
    if (initial == indexOfWhiteKing) {
        indexOfWhiteKing = final;
    }
    else if (initial == indexOfBlackKing) {
        indexOfBlackKing = final;
    }

}

function FindIndexOfWhiteKing(board) {

  
  for(let i=0;i<63;i++){
    if(board[i]==2) return i;
  }
}
function FindIndexOfBlackKing(board) {
    for(let i=0;i<63;i++){
        if(board[i]==-2) return i;
    }
}


function NameMove(sourcePiece, targetPiece, sourceIndex, targetIndex) {
    if (sourceIndex == 60 && targetIndex == 62 && sourcePiece == 2) {
        return 'O-O'
    }
    if (sourceIndex == 60 && targetIndex == 58 && sourcePiece == 2) {
        return 'O-O-O'
    }
    if (sourceIndex == 4 && targetIndex == 6 && sourcePiece == -2) {
        return 'O-O'
    }
    if (sourceIndex == 4 && targetIndex == 2 && sourcePiece == -2) {
        return 'O-O-O'
    }

    let moveName = '';

    let sourcePieceName = '';
    if (Math.abs(sourcePiece) == 1) sourcePieceName = '';
    if (Math.abs(sourcePiece) == 6) sourcePieceName = 'R';
    if (Math.abs(sourcePiece) == 3) sourcePieceName = 'N';
    if (Math.abs(sourcePiece) == 4) sourcePieceName = 'B';
    if (Math.abs(sourcePiece) == 10) sourcePieceName = 'Q';
    if (Math.abs(sourcePiece) == 12) sourcePieceName = 'K';

    // let sourceSquare=NameSquare(sourceIndex)
    let targetSquare = NameSquare(targetIndex)
    if (targetPiece == 0) {
        moveName += `${sourcePieceName}${targetSquare}`
    }
    else {
        moveName += `${sourcePieceName}x${targetSquare}`
    }

    return moveName;
}

function NameSquare(index) {
    let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let name = ''
    let x = index % 8;
    let y = 8 - Math.floor(index / 8);
    name += letters[x];
    name += y.toString();
    return name;


}


//extra functions

function highlight(moves, index) {

    document.getElementsByClassName('square')[index].style.backgroundColor = 'rgba(255,200,0,0.7)'
    for (let i = 0; i < moves.length; i++) {
        if (i % 2 == 0) {

            document.getElementsByClassName('square')[moves[i]].style.backgroundColor = 'rgba(200,255,0,0.5)'
        }
        else {
            document.getElementsByClassName('square')[moves[i]].style.backgroundColor = 'rgba(200,255,0,0.4)'

        }
    }
}

function unHightlight() {

    for (let i = 0; i < 64; i++) {
        let x = i % 8;
        let y = Math.floor(i / 8)
        if ((x + y) % 2 == 0) {

            document.getElementsByClassName('square')[i].style.backgroundColor = light;
        }
        else {

            document.getElementsByClassName('square')[i].style.backgroundColor = dark;
        }
    }

}


function highlightLastMove(initial, final) {
    document.getElementsByClassName('square')[initial].style.backgroundColor = 'rgba(200,120,150,0.5)'
    document.getElementsByClassName('square')[initial].style.backgroundColor = '#ffff33'
    document.getElementsByClassName('square')[initial].style.backgroundColor = 'rgba(255,200,0,0.7)'
    document.getElementsByClassName('square')[final].style.backgroundColor = 'rgba(200,120,150,0.8)'
    document.getElementsByClassName('square')[final].style.backgroundColor = '#ffff33'
    document.getElementsByClassName('square')[final].style.backgroundColor = 'rgba(255,200,0,0.6)'
}


//adding drag and drop behaviour

function dragAndDrop(element, index) {
    element.addEventListener('dragstart', (e) => {
        console.log('dragged')
        e.dataTransfer.setData('text/plain', element.id);


        legal = finalLegalMoves(board, index, turn)
        highlight(legal, index)
        moveActive[1] = index;



    });



    element.addEventListener('dragover', (e) => {

        e.preventDefault();

        // source=(j-1)+(i-1)*8
    });

    element.addEventListener('drop', (e) => {

        if (legal.includes(index)) {

            // await addTransitionToMove(b,source,target)
            let type = MoveType(board, moveActive[1], index);
            playMove(board, moveActive[1], index, 10);
            let oppositeLegalMoves = allLegalMoves(board, -turn);
            let len = oppositeLegalMoves.length;
            let check = false;
            if (isUnderCheck(board, -turn)) {
                check = true
                type = 'check';

            };

            //
            playSoundEffects(type)
            materialBarWidth(board)

            refreshBoard(board, moveActive[1], index)


            // displayBoard(b)

            unHightlight();

            if (len == 0) {
                if (check) {
                    //checkmate
                    gameOver = true;
                    text.innerHTML = 'CHECKMATE'
                    if (turn == 1) {
                        result.innerHTML = '(White Wins)'
                    }
                    else {
                        result.innerHTML = '(Black Wins)'
                    }

                }
                else {
                    gameOver = true;
                    text.innerHTML = 'STALEMATE'
                    result.innerHTML = '(Draw)'
                }
            }

            //highlighting last move
            highlightLastMove(index, moveActive[1])

            legal = []
            changeTurn()
        }
        else {


            unHightlight();
            playerMoves = []
        }

    });
}

function changeTurn() {
    if (turn == 1) turn = -1;
    else turn = 1;
}

//function to convert a board to fen string

function boardToFen(board, color) {
    let fen = ''
    for (let i = 0; i < board.length; i++) {

        if (i != 0 && i % 8 == 0) {
            fen += '/'

        }

        if (board[i] == 1) fen += 'P';
        else if (board[i] == 2) fen += 'K'
        else if (board[i] == 6) fen += 'R'
        else if (board[i] == 3) fen += 'N'
        else if (board[i] == 4) fen += 'B'
        else if (board[i] == 10) fen += 'Q'
        else if (board[i] == -2) fen += 'k'
        else if (board[i] == -6) fen += 'r'
        else if (board[i] == -3) fen += 'n'
        else if (board[i] == -4) fen += 'b'
        else if (board[i] == -10) fen += 'q'
        else if (board[i] == -1) fen += 'p'

        else {
            let count = 0;
            let num = 0;
            while (count < 8) {
                if (board[i + count] == 0) {
                    num += 1;
                    count++;
                }
                else {
                    break;
                }
                if ((i + num) % 8 == 0) break
            }
            fen += num.toString();
            i += num - 1;
        }
    }
    color == 1 ? fen += ' w' : fen += ' b'

    if (whiteCastle[0] == true && whiteCastle[1] == true) fen += ' KQ'
    else if (whiteCastle[0] == true && whiteCastle[1] == false) fen += ' K'
    else if (whiteCastle[0] == false && whiteCastle[1] == true) fen += ' Q'
    else if (whiteCastle[0] == false && whiteCastle[1] == false) fen += ''

    if (blackCastle[0] == true && blackCastle[1] == true) fen += 'kq'
    else if (blackCastle[0] == true && blackCastle[1] == false) fen += 'k'
    else if (blackCastle[0] == false && blackCastle[1] == true) fen += 'q'
    else if (blackCastle[0] == false && blackCastle[1] == false) fen += ''


    fen += ' - 0 2'
    return fen;

}

function attackedSquares(board, color) {
    let arr = []
    for (let i = 0; i < 64; i++) {
        if (board[i] * color > 0) {
            let legal = legalMoves(board, i, color);
            legal.forEach((index) => {
                if (!arr.includes(index)) {
                    arr.push(index)
                }
            })
            if (board[i] * color == 1) {
                if (color == 1 && board[i - 7] == 0) arr.push(i - 7)
                if (color == 1 && board[i - 9] == 0) arr.push(i - 9)
                if (color == -1 && board[i + 7] == 0) arr.push(i + 7)
                if (color == -1 && board[i + 9] == 0) arr.push(i + 9)

            }

        }
    }
    return arr;
}


//move type function


function MoveType(board, initial, final) {
    if (board[initial] == 1 && final <= 7) {
        return 'promotion';
    }
    else if (board[initial] == -1 && final >= 56) {
        return 'promotion'
    }
    //checking for castling 

    else if (initial == 60 && final == 62 && board[initial] == 2) {
        return 'castle'


    }
    else if (initial == 60 && final == 58 && board[initial] == 2) {
        return 'castle'



    }
    else if (initial == 4 && final == 6 && board[initial] == -2) {
        return 'castle';



    }
    else if (initial == 4 && final == 2 && board[initial] == -2) {

        return 'castle'


    }
    //checking for en passant
    else if (Math.abs(board[initial]) == 1 && initial % 8 != final % 8 && board[final] == 0) {

        return 'capture';


    }
    else if (board[final] != 0) {
        return 'capture';
    }

    else {


        return 'move';

    }

}



function MoveType(board, initial, final) {
    if (board[initial] == 1 && final <= 7) {
        return 'promotion';
    }
    else if (board[initial] == -1 && final >= 56) {
        return 'promotion'
    }
    //checking for castling 

    else if (initial == 60 && final == 62 && board[initial] == 2) {
        return 'castle'


    }
    else if (initial == 60 && final == 58 && board[initial] == 2) {
        return 'castle'



    }
    else if (initial == 4 && final == 6 && board[initial] == -2) {
        return 'castle';



    }
    else if (initial == 4 && final == 2 && board[initial] == -2) {

        return 'castle'


    }
    //checking for en passant
    else if (Math.abs(board[initial]) == 1 && initial % 8 != final % 8 && board[final] == 0) {

        return 'capture';


    }
    else if (board[final] != 0) {
        return 'capture';
    }

    else {


        return 'move';

    }

}

//Little but golden function 
function invertBoard(board,perspective){
   if(perspective==-1){
    board=board.map((element)=>{
        return -element;
    })
    return board;
   }
   return board;
}