
const ACCESS_TOKEN = "lip_t7iqiraeAKaOjs1ZOETP"

const username = 'NoobChesser00';


const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`
};

const accountUrl = `https://lichess.org/api/account`;


// Include the access token in the request headers

async function fetchDailyPuzzle() {
    const puzzleUrl = "https://lichess.org/api/puzzle/daily";
    const headers = {
        Authorization: `Bearer ${ACCESS_TOKEN}`
    };

    try {
        const response = await fetch(puzzleUrl, { headers });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Error fetching the puzzle");
        }
    } catch (error) {
        throw new Error("Error fetching the puzzle: " + error.message);
    }
}


async function fetchBestMove(positionFEN) {
    try {
        // Authenticate with Lichess API
        const headers = {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        // Submit position to Stockfish for analysis
        const analysisResponse = await fetch('https://lichess.org/api/analysis', {
            method: 'POST',
            headers: headers,
            body: `fen=${encodeURIComponent(positionFEN)}`
        });

        // Check if the request was successful
        if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            const analysisId = analysisData.id;

            // Retrieve analysis results
            const analysisUrl = `https://lichess.org/api/analysis/${analysisId}`;
            const resultResponse = await fetch(analysisUrl, { headers: headers });

            // Parse results
            if (resultResponse.ok) {
                const resultData = await resultResponse.json();
                const bestMove = resultData.moves[0].uci;
                console.log('Best move suggested by Stockfish:', bestMove);
                return bestMove;
            } else {
                console.error('Failed to retrieve analysis results:', resultResponse.statusText);
            }
        } else {
            console.error('Failed to submit position to Stockfish:', analysisResponse.statusText);
        }
    } catch (error) {
        console.error('Error occurred:', error.message);
    }
}


