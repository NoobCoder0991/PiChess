//Main min-max search function

function alphaBetaSearch(board, color, depth,alpha,beta,index) {

    if (depth == 0) {
        totalPositionsEvaluated++;

        return [evaluatePosition(board, color),index];
    }
    //All legal moves for color(black/white)
    let legalMovesForEngine = allLegalMoves(board, color);
    let len=legalMovesForEngine.length;
    

    legalMovesForEngine=orderMoves(board,legalMovesForEngine)
    
    
    if (len==0) {
        let check=isUnderCheck(board,color)
        if(check){
            //checkmate
            return [-Infinity,index];

        }
        //stalemate
        return [0,index];
        }


    
    let bestEvaluation=-Infinity;
    for (let i = 0; i <len; i++) {
        let [initial, final,flag] = legalMovesForEngine[i];
        //storing the pieces which were initially there since we have to unmove the move

        let temp = board[final];
        let temp2 = board[initial];

        //store the castling and en passant rights in a sepatete variable and them pass them into the unMove fuction 
        let cRights=storeCastlingRights();
        let eRights=storeEnPassantRights();

        playMove(board, initial, final,flag);
        
       
        let value = -alphaBetaSearch(board, -color, depth - 1,-beta,-alpha,index)[0];


        if(value==Infinity && isUnderCheck(board,-color)){

            unMove(board, initial, final, temp, temp2,cRights,eRights);

            bestEvaluation=Infinity;
            // index=[];
            index.push([initial,final,flag]);
            return [bestEvaluation, index];
        }

        else   if (value > bestEvaluation) {
            bestEvaluation = value;
            index = [];
            index.push([initial,final,flag]);
        }
        
     

        unMove(board, initial, final, temp, temp2,cRights,eRights); 

        if(value>=beta){
            
            
            // if(!index.includes([initial,final])){
                //     index[index.length]=[initial,final,flag]

                // }
                return [beta,index]
        }


        alpha=Math.max(alpha,value)


    }


    return [alpha,index];
}



