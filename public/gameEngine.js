


function refreshBoard(board,initial,final) {
    for (let i = 0; i < 64; i++) {
      
        if (board[i]==0) {
            chessPieces[i].classList.add('blankImage');

        }
        else {
            chessPieces[i].classList.remove('blankImage');


        }
    }
    chessPieces[initial].src=`/piece-images-2/${board[initial]*perspective}.png`
    chessPieces[final].src=`/piece-images-2/${board[final]*perspective}.png`
    if(initial==60 && final==62 && board[final]==2){
        chessPieces[61].src=`/piece-images-2/${board[61]*perspective}.png`
        
    }
    else if(initial==60 && final==58 && board[final]==2){
        chessPieces[59].src=`/piece-images-2/${board[59]*perspective}.png`
       
    }
    else if (initial==4 && final==6 && board[final]==-2){
        chessPieces[5].src=`/piece-images-2/${board[5]*perspective}.png`
       

    }
    else if (initial==4 && final==2 && board[final]==-2){
        chessPieces[3].src=`/piece-images-2/${board[3]*perspective}.png`
       

    }
    else if (Math.abs(board[final])==1 && initial % 8 != final % 8 && board[initial] == 0) {
       
        let x = final % 8
        let y = Math.floor(initial / 8)
        let index = coordinatesToIndex([x, y]);
        chessPieces[index].src=`/piece-images-2/${board[index]*perspective}.png`
        
        
        
    }

}




//Main Game Engine(New optimized,fast and powerful)



//sound effects
function playSoundEffects(type){
  switch(type){
    case 'check':checkSound.play();break;
    case 'castle':castleSound.play();break;
    case 'promotion':promotionSound.play();break;
    case 'capture':captureSound.play();break;
    case 'move':moveSound.play();break;
  }


}








function positionOfKing(color) {
   
    if(color==1){
        return indexOfWhiteKing
    }
    else if(color==-1){
        return indexOfBlackKing;
    }
}

//function to return the number of pieces of a particular color
function totalPieces(board, color) {
    let count = 0;
    board.forEach((element) => {
        if (element*color>0) count++;

    })
    return count;
}





function material(board, color) {
    let pieceMaterial = 0;

    for (let i = 0; i < 64; i++) {
        
        if (board[i]*color>0) {
            pieceMaterial += board[i]*color;
            if(Math.abs(board[i])==4) pieceMaterial-=0.8;
        }


    }
    return pieceMaterial;

}

//play move function 
function playMove(board, initial, final,flag) {
    
    
    //checking for promotion
    if (board[initial] == 1 && Math.floor(initial/8)==1) {
        
        
        board[final]=flag
        board[initial] =0;
        
    }
    else if (board[initial]==-1 && Math.floor(initial/8)==6) {
        board[final]=-flag;
     
        board[initial] =0;
       
    }
    //checking for castling 
    
    else if (initial == 60 && final == 62 && board[initial]==2) {
        board[final] = board[initial];
        board[initial] = 0
        board[initial + 1] = board[63]
        board[63] = 0;
        
        
    }
    else if (initial == 60 && final == 58 && board[initial]==2) {
        board[final] = board[initial];
        board[initial] = 0
        board[initial - 1] = board[56]
        board[56] = 0
        
        
    }
    else if (initial == 4 && final == 6 && board[initial]==-2) {
        board[final] = board[initial];
        board[initial] = 0
        board[initial + 1] = board[7]
        board[7] = 0
        
        
    }
    else if (initial == 4 && final == 2 && board[initial]==-2) {
        board[final] = board[initial];
        board[initial] = 0
        board[initial - 1] = board[0]
        board[0] = 0
        
        
    }
    //checking for en passant
    else if (Math.abs(board[initial])==1 && initial % 8 != final % 8 && board[final] == 0) {
        
        board[final] = board[initial];
        
        board[initial] = 0;
        let x = final % 8
        let y = Math.floor(initial / 8)
        let index = coordinatesToIndex([x, y]);
        board[index] = 0;
        
        
    }
    
    else {
        
        
        board[final] = board[initial];
        board[initial] = 0;
       
    }

    //updating rights
    checkForCastlingRights(initial,final,turn)
    checkForEnPassantRights(board,initial,final,turn)
    updateIndicesOfKings(initial,final)
    
    
    
   


}





function allLegalMoves(board, color) {

    let legalMovesForEngine = [];
    // let indexArray = [];
    let data=[];

    for (let i = 0; i < 64; i++) {
        if (board[i]*color>0) {
            legalMovesForEngine[legalMovesForEngine.length] = finalLegalMoves(board, i, color)
            if((board[i]==1&& Math.floor(i/8)==1) || board[i]==-1 && Math.floor(i/8)==6){
                
                legalMovesForEngine[legalMovesForEngine.length-1].forEach((element)=>{
                    data[data.length]=[i,element,10];
                    data[data.length]=[i,element,6];
                    data[data.length]=[i,element,4];
                    data[data.length]=[i,element,3];
                })
            }
            else{

                legalMovesForEngine[legalMovesForEngine.length-1].forEach((element)=>{
                    data[data.length]=[i,element,board[i]];
                })
            }

        }


    }

  

    return data;


}


//function for unmoving a move , i desperately needed this!

function unMove(board, initial, final, temp, temp2,cRights,eRights) {
  
    
  
    if (initial == 60 && final == 62 && board[final] == 2) {
        //it was castling 
       
        board[initial] = board[final]
        board[final] = temp;
        board[63] = board[61]
        board[61] = 0

    }
    else if (initial == 60 && final == 58 && board[final] == 2) {
        //it was castling 
      
        board[initial] = board[final]
        board[final] = temp;
        board[56] = board[59]
        board[59] = 0

    }
    else if (initial == 4 && final == 6 && board[final] == -2) {
        //it was castling 
        
        board[initial] = board[final]
        board[final] = temp;
        board[7] = board[5]
        board[5] = 0

    }
    else if (initial == 4 && final == 2 && board[final] == -2) {
        
        board[initial] = board[final]
        board[final] = temp;
        board[0] = board[3]
        board[3] = 0

    }
    //it can be en passent 
    else if (Math.abs(board[final])==1 && temp==0 && initial % 8 != final % 8) {
   
        board[initial] = board[final];
        board[final] = temp
        let index = coordinatesToIndex([final % 8, Math.floor(initial / 8)]);
        if (board[initial]== -1) {
            board[index] = 1
        }
        else if(board[initial]==1){
            board[index] = -1;
        }


    }
    //promotion move
    else if ((Math.abs(board[final]) == 10 || Math.abs(board[final]) ==6 || Math.abs(board[final]) == 4 || Math.abs(board[final]) == 3 ) && Math.abs(temp2 )== 1) {

       
        board[initial] = temp2;
        board[final] = temp;

    }

    else {
      
        board[initial] = board[final]
        board[final] = temp;

    }

   //restoring rights
   whiteCastle[0]=cRights[0][0];
   whiteCastle[1]=cRights[0][1];
   blackCastle[0]=cRights[1][0];
   blackCastle[1]=cRights[1][1];

    
    enPassantForWhite=eRights[0];
    enPassantForBlack=eRights[1];

    updateIndicesOfKings(final,initial)
    


}

