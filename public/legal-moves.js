function legalMoves(board, index, turn) {

    let color,piece;
    if(board[index]>0){
        color=1;
        piece=board[index]


    }
    else if(board[index]<0){
        color=-1;
        piece=-board[index];
    }
    if(board[index]==0|| turn!=color){
        return [];
    }


    let legalmoves = [];
    let x=index%8;
    let y=Math.floor(index/8);
    //finding legal moves for rook

    
        if (piece == 6) {
            

            let top = [x, y - 1], left = [x - 1, y], bottom = [x, y + 1], right = [x + 1, y];

            while (!isOutsideBoard(top)) {
                if (board[coordinatesToIndex(top)] == 0) {

                    legalmoves.push(coordinatesToIndex(top));
                }
                else if (board[coordinatesToIndex(top)]*color>0) {
                    break;
                }
                else {
                    legalmoves.push(coordinatesToIndex(top))

                    break;
                }

                top[1] -= 1;
            }
            while (!isOutsideBoard(left)) {
                if (board[coordinatesToIndex(left)] == 0) {

                    legalmoves.push(coordinatesToIndex(left))
                }
                else if (board[coordinatesToIndex(left)]*color>0) {
                    break;
                }
                else {
                    legalmoves.push(coordinatesToIndex(left));

                    break;
                }
                left[0] -= 1;

            }
            while (!isOutsideBoard(bottom)) {
                
              
                if (board[coordinatesToIndex(bottom)] == 0) {

                    legalmoves.push(coordinatesToIndex(bottom));
                }
                else if (board[coordinatesToIndex(bottom)]*color>0) {
                    
                    break;
                }
                else {
                    legalmoves.push(coordinatesToIndex(bottom))
                    

                    break;
                }

                bottom[1] += 1;
            }
            while (!isOutsideBoard(right)) {
                if (board[coordinatesToIndex(right)]== 0) {

                    legalmoves.push(coordinatesToIndex(right))
                }
                else if (board[coordinatesToIndex(right)]*color>0) {
                    break;
                }
                else {
                    legalmoves.push(coordinatesToIndex(right))

                    break;
                }
                right[0] += 1;


            }
        }

        //end

        // finding legalmoves for knight

        else if (piece == 3) {

            
            let coordinates = [[x + 2, y + 1], [x + 2, y - 1], [x - 2, y + 1], [x - 2, y - 1], [x + 1, y + 2], [x - 1, y + 2], [x - 1, y - 2], [x + 1, y - 2]]
            // console.log("first:",coordinates)
            let allowedPositions = []

            coordinates.forEach((coordinate) => {
                // console.log(coordinatesToIndex(coordinate))
                if (!isOutsideBoard(coordinate)) {

                    allowedPositions[allowedPositions.length] = coordinatesToIndex(coordinate);
                }

            })


            allowedPositions.forEach((position) => {
                    if (board[position]*color<=0) {
                        legalmoves[legalmoves.length] = position;
                    }

            })


        }

        //end

        //finding  legal moves of bishop
        else if (piece == 4) {
           

            let topRight = [x + 1, y - 1], topLeft = [x - 1, y - 1], bottomRight = [x + 1, y + 1], bottomLeft = [x - 1, y + 1];

            while (!isOutsideBoard(topRight)) {
                if (board[coordinatesToIndex(topRight)]== 0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(topRight);
                }
                else if (board[coordinatesToIndex(topRight)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(topRight);

                    break;
                }
                topRight[0] += 1;
                topRight[1] -= 1;
            }
            while (!isOutsideBoard(topLeft)) {
                if (board[coordinatesToIndex(topLeft)]== 0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(topLeft);
                }
                else if (board[coordinatesToIndex(topLeft)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(topLeft);

                    break;
                }
                topLeft[0] -= 1;
                topLeft[1] -= 1;
            }
            while (!isOutsideBoard(bottomRight)) {
                if (board[coordinatesToIndex(bottomRight)]== 0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(bottomRight);
                }
                else if (board[coordinatesToIndex(bottomRight)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(bottomRight);

                    break;
                }
                bottomRight[0] += 1;
                bottomRight[1] += 1;
            }
            while (!isOutsideBoard(bottomLeft)) {
                if (board[coordinatesToIndex(bottomLeft)] == 0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(bottomLeft);
                }
                else if (board[coordinatesToIndex(bottomLeft)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(bottomLeft);

                    break;
                }
                bottomLeft[0] -= 1;
                bottomLeft[1] += 1;
            }

        }
        //end

        //legal moves for queen ( rook + bishop)
        else if (piece == 10) {
            

            let top = [x, y - 1], left = [x - 1, y], bottom = [x, y + 1], right = [x + 1, y];

            while (!isOutsideBoard(top)) {
                if (board[coordinatesToIndex(top)]== 0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(top);
                }
                else if (board[coordinatesToIndex(top)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(top);

                    break;
                }

                top[1] -= 1;
            }
            while (!isOutsideBoard(left)) {
                if (board[coordinatesToIndex(left)]==0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(left);
                }
                else if (board[coordinatesToIndex(left)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(left);

                    break;
                }
                left[0] -= 1;

            }
            while (!isOutsideBoard(bottom)) {
                if (board[coordinatesToIndex(bottom)] == 0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(bottom);
                }
                else if (board[coordinatesToIndex(bottom)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(bottom);

                    break;
                }

                bottom[1] += 1;
            }
            while (!isOutsideBoard(right)) {
                if (board[coordinatesToIndex(right)]==0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(right);
                }
                else if (board[coordinatesToIndex(right)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(right);

                    break;
                }
                right[0] += 1;


            }

            //bishop role



            let topRight = [x + 1, y - 1], topLeft = [x - 1, y - 1], bottomRight = [x + 1, y + 1], bottomLeft = [x - 1, y + 1];

            while (!isOutsideBoard(topRight)) {
                if (board[coordinatesToIndex(topRight)] == 0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(topRight);
                }
                else if (board[coordinatesToIndex(topRight)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(topRight);

                    break;
                }
                topRight[0] += 1;
                topRight[1] -= 1;
            }
            while (!isOutsideBoard(topLeft)) {
                if (board[coordinatesToIndex(topLeft)] == 0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(topLeft);
                }
                else if (board[coordinatesToIndex(topLeft)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(topLeft);

                    break;
                }
                topLeft[0] -= 1;
                topLeft[1] -= 1;
            }
            while (!isOutsideBoard(bottomRight)) {
                if (board[coordinatesToIndex(bottomRight)] == 0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(bottomRight);
                }
                else if (board[coordinatesToIndex(bottomRight)]* color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(bottomRight);

                    break;
                }
                bottomRight[0] += 1;
                bottomRight[1] += 1;
            }
            while (!isOutsideBoard(bottomLeft)) {
                if (board[coordinatesToIndex(bottomLeft)] == 0) {

                    legalmoves[legalmoves.length] = coordinatesToIndex(bottomLeft);
                }
                else if (board[coordinatesToIndex(bottomLeft)]*color>0) {
                    break;
                }
                else {
                    legalmoves[legalmoves.length] = coordinatesToIndex(bottomLeft);

                    break;
                }
                bottomLeft[0] -= 1;
                bottomLeft[1] += 1;
            }



        }

        //legal moves for king
        else if (piece == 2) {
           
            let coordinates = [[x, y + 1], [x, y - 1], [x + 1, y], [x - 1, y], [x + 1, y - 1], [x - 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]];
            // let coordinates=[[x,y+1],[x,y-1],[x+1,y],[x-1,y]];
            coordinates.forEach((coordinate) => {
                if (!isOutsideBoard(coordinate) && board[coordinatesToIndex(coordinate)]*color<=0) {
                    legalmoves[legalmoves.length] = coordinatesToIndex(coordinate)
                }
            })

        }

        // legal moves for pawn

        else if (piece == 1) {
           


            if (color == 1) {
                if (Math.floor(index / 8) == 6) {
                    if (board[index-8]==0 && board[index-16]==0) {
                        
                        
                            legalmoves.push(index-16)
                        
                    }
                }
                    if(!isOutsideBoard([x,y-1])  && board[index-8]==0)
                    {
                       
                            legalmoves.push(index-8)
                        
                     
                    }
                        
                    
                    if (!isOutsideBoard([x + 1, y - 1]) && board[index-7]<0) {

                      
                            legalmoves.push(index-7)
                        
                    }
                    if (!isOutsideBoard([x - 1, y - 1]) && board[index-9]<0) {
                       
                            legalmoves.push(index-9)
                        
                    }
                    
                    
                    
                }
                
                else {
                    //for black pawns
                if (Math.floor(index / 8) == 1) {
                    if (board[index+8] == 0 && board[index+16]==0) {
                        
                    
                            legalmoves.push(index+16)
                        
                    }
                }
                
                    if(!isOutsideBoard([x,y+1]) && board[index+8]==0)
                    {
                       
                            legalmoves.push(index+8)
                        

                    } 
                    if (!isOutsideBoard([x + 1, y + 1]) && board[index+9]>0) {
                        
                            legalmoves.push(index+9)
                        
                    }
                    if (!isOutsideBoard([x - 1, y + 1]) && board[index+7]>0 ) {
                        
                        
                            legalmoves.push(index+7)
                        
                    }
                

              

            }


        }


        return legalmoves;



    




}
//end of the legal moves function

//fuction for checking if the king is under check

function isUnderCheck(board, color) {

    var indexOfKing=positionOfKing(color);

    
    for (let i = 0; i < chessPieces.length; i++) {
        if (board[i]*color<0) {
            if (legalMoves(board, i, -color).includes(indexOfKing)) {
                return true;
            }
        }
    }
    return false;
}

//checking for checkmate
function hasBeenCheckMated(board, color) {
    //heavy function , don't use it often
    let legalMoves = allLegalMoves(board, color);
    if (isUnderCheck(board, color) && legalMoves.length == 0) {
        return true;
    }
    else {
        return false;
    }
}

//legal moves along with check checking
function finalLegalMoves(board, index, color) {
   
    let legalmoves = legalMoves(board, index, color);
    let newLegalMoves = [];
    let attacked=attackedSquares(board,-color);
    //special moves 
    let check=isUnderCheck(board,color)

    //Castling 
    if (!check) {

        if (index == 60 && board[index]==2) {

            //it may have right to castle
            
            if (whiteCastle[0]&& board[61]==0 && board[62]==0 && !attacked.includes(61)) {
                legalmoves[legalmoves.length] = 62
            }
            if (whiteCastle[1] && board[59]==0 && board[58]==0 && board[57]==0 && !attacked.includes(59)) {
                legalmoves.push(58)
            }
        }
        if (index == 4 && board[index]==-2) {
            if (blackCastle[0] && board[5]==0 && board[6]==0 && !attacked.includes(5)) {
                legalmoves.push(6)
            }
            if (blackCastle[1]&& board[2]==0 && board[3]==0 && board[1]==0 && !attacked.includes(3)) {
                legalmoves.push(2)
            }
        }
    }

    //en passant
    if (color == 1 && enPassantForWhite[0] == true) {
        let position = enPassantForWhite[1];
        if (Math.abs(index - position) == 1 && board[index]== 1 && Math.floor(index/8)==Math.floor(position/8)) {
            legalmoves.push(position - 8);
        }

    }
    if (color == -1 && enPassantForBlack[0] == true) {
        let position = enPassantForBlack[1];
        if (Math.abs(index - position) == 1 && board[index] ==-1&& Math.floor(index/8)==Math.floor(position/8)) {
            legalmoves.push(position + 8);
        }

    }



    if (!check) {
        
        legalmoves.forEach((element) => {
           
            
                let temp=board[element]
                let temp2=board[index];
                let c=storeCastlingRights();
                let e=storeEnPassantRights();
                playMove(board,index,element,10);
              
    
                    if(isUnderCheck(board,color)){
                       
                        unMove(board,index,element,temp,temp2,c,e)
                      
                        
                    }
                    else{
                        newLegalMoves.push(element)
                        unMove(board,index,element,temp,temp2,c,e)   
                      
    
                    }
                
            
           


            })
            // newLegalMoves = legalmoves;
        }
      


    

    else  {
        legalmoves.forEach((element) => {
           let temp=board[element]
           let temp2=board[index];
           let c=storeCastlingRights();
            let e=storeEnPassantRights();
           playMove(board,index,element,10);
         

            if (!isUnderCheck(board, color)) {
                newLegalMoves.push(element) ;
                unMove(board,index,element,temp,temp2,c,e);
               


            }

            else {
               unMove(board,index,element,temp,temp2,c,e);
               

            }

        })




    }


    return newLegalMoves;

}

//fuction for checking whether a square is empty or not 

function isEmpty(board, index) {
    if (board[index] == 0) {
        return true;
    }
    else {
        return false;
    }
}

