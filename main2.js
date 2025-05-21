let legalSquares = [];
let isWhiteTurn = true;
const boardSquare = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");

setupBoardSquares();
setupPieces();

function setupBoardSquares() {
    for (let i = 0; i < boardSquare.length; i++) {
        boardSquare[i].addEventListener("dragover", allowDrop);
        boardSquare[i].addEventListener("drop", drop);
        let row = 8 - Math.floor(i / 8);
        let column = String.fromCharCode(97 + (i % 8));
        let square = boardSquare[i];
        square.id = column + row;
    }
}

function setupPieces() {
    for (let i = 0; i < pieces.length; i++) {
        pieces[i].addEventListener("dragstart", drag);
        pieces[i].setAttribute("draggable", true);
        pieces[i].id = pieces[i].className.split(" ")[1] + pieces[i].parentElement.id;
    }
    for (let i = 0; i < piecesImages.length; i++) {
        piecesImages[i].setAttribute("draggable", false);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    const piece = ev.target;
    const pieceColor = piece.getAttribute("color");
    if ((isWhiteTurn && pieceColor === "white") || (!isWhiteTurn && pieceColor === "black")) {
        ev.dataTransfer.setData("text", piece.id);
        const startingSquareId = piece.parentNode.id;
        getPossibleMoves(startingSquareId, piece);
    }
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const piece = document.getElementById(data);
    const destinationSquare = ev.currentTarget;
    const destinationSquareId = destinationSquare.id;

    if (legalSquares.includes(destinationSquareId)) {
        while (destinationSquare.firstChild) {
            destinationSquare.removeChild(destinationSquare.firstChild);
        }
        destinationSquare.appendChild(piece);
        isWhiteTurn = !isWhiteTurn;
        legalSquares.length = 0;
    }
}

function isSquareOccupied(square) {
    if (square && square.querySelector(".piece")) {
        const color = square.querySelector(".piece").getAttribute("color");
        return color;
    }
    return "blank";
}

function checkPawnDiagonalCaptures(startingSquareId, pieceColor) {
    const file = startingSquareId.charAt(0);
    const rank = parseInt(startingSquareId.charAt(1));
    const direction = pieceColor === "white" ? 1 : -1;

    for (let i = -1; i <= 1; i += 2) {
        const newFile = String.fromCharCode(file.charCodeAt(0) + i);
        const newRank = rank + direction;
        if (newFile >= "a" && newFile <= "h" && newRank >= 1 && newRank <= 8) {
            const newSquareId = newFile + newRank;
            const newSquare = document.getElementById(newSquareId);
            const squareContent = isSquareOccupied(newSquare);
            if (squareContent !== "blank" && squareContent !== pieceColor) {
                legalSquares.push(newSquareId);
            }
        }
    }
}

function checkPawnForwardMoves(startingSquareId, pieceColor) {
    const file = startingSquareId.charAt(0);
    const rank = parseInt(startingSquareId.charAt(1));
    const direction = pieceColor === "white" ? 1 : -1;

    let newRank = rank + direction;
    let newSquareId = file + newRank;
    let newSquare = document.getElementById(newSquareId);
    if (newSquare && isSquareOccupied(newSquare) === "blank") {
        legalSquares.push(newSquareId);

        if ((pieceColor === "white" && rank === 2) || (pieceColor === "black" && rank === 7)) {
            newRank += direction;
            newSquareId = file + newRank;
            newSquare = document.getElementById(newSquareId);
            if (newSquare && isSquareOccupied(newSquare) === "blank") {
                legalSquares.push(newSquareId);
            }
        }
    }
}

function getPossibleMoves(startingSquareId, piece) {
    const pieceColor = piece.getAttribute("color");
    legalSquares.length = 0; 
    if (piece.classList.contains("pawn")) {
        getPawnMoves(startingSquareId, pieceColor);
    } else if (piece.classList.contains("knight")) {
        getKnightMoves(startingSquareId, pieceColor);
    } else if (piece.classList.contains("rook")) {
        getRookMoves(startingSquareId, pieceColor);
    } else if (piece.classList.contains("bishop")) {
        getBishopMoves(startingSquareId, pieceColor);
    }else if (piece.classList.contains("queen")) {
        getQueenMoves(startingSquareId, pieceColor);
    }else if (piece.classList.contains("king")) {
        getKingMoves(startingSquareId, pieceColor);
    }


}

function getPawnMoves(startingSquareId, pieceColor) {
    checkPawnDiagonalCaptures(startingSquareId, pieceColor);
    checkPawnForwardMoves(startingSquareId, pieceColor);
}

function getKnightMoves(startingSquareId, pieceColor) {
    const file = startingSquareId.charCodeAt(0) - 97; 
    const rank = parseInt(startingSquareId.charAt(1)); 

    const moves = [
        [-2, 1], [-1, 2], [1, 2], [2, 1],
        [2, -1], [1, -2], [-1, -2], [-2, -1]
    ];

    moves.forEach(([fileOffset, rankOffset]) => {
        const newFile = file + fileOffset;
        const newRank = rank + rankOffset;
        if (newFile >= 0 && newFile <= 7 && newRank >= 1 && newRank <= 8) {
            const newSquareId = String.fromCharCode(newFile + 97) + newRank;
            const newSquare = document.getElementById(newSquareId);
            const squareContent = isSquareOccupied(newSquare);
            if (squareContent === "blank" || squareContent !== pieceColor) {
                legalSquares.push(newSquareId);
            }
        }
    });
}

function getRookMoves(startingSquareId, pieceColor) {
    moveToEighthRank(startingSquareId, pieceColor);
    moveToFirstRank(startingSquareId, pieceColor);
    moveToAFile(startingSquareId, pieceColor);
    moveToHFile(startingSquareId, pieceColor);
}

function moveToEighthRank(startingSquareId, pieceColor) {
    const file = startingSquareId.charAt(0);
    let rank = parseInt(startingSquareId.charAt(1));
    
    while (rank < 8) {
        rank++;
        const currentSquareId = file + rank;
        const currentSquare = document.getElementById(currentSquareId);
        const squareContent = isSquareOccupied(currentSquare);
        if (squareContent !== "blank") {
            if (squareContent !== pieceColor) {
                legalSquares.push(currentSquareId); 
            }
            return;
        }
        legalSquares.push(currentSquareId);
    }
}

function moveToFirstRank(startingSquareId, pieceColor) {
    const file = startingSquareId.charAt(0);
    let rank = parseInt(startingSquareId.charAt(1));
    
    while (rank > 1) {
        rank--;
        const currentSquareId = file + rank;
        const currentSquare = document.getElementById(currentSquareId);
        const squareContent = isSquareOccupied(currentSquare);
        if (squareContent !== "blank") {
            if (squareContent !== pieceColor) {
                legalSquares.push(currentSquareId);
            }
            return;
        }
        legalSquares.push(currentSquareId);
    }
}

function moveToAFile(startingSquareId, pieceColor) {
    let file = startingSquareId.charCodeAt(0);
    const rank = startingSquareId.charAt(1);
    
    while (file > 97) {
        file--;
        const currentSquareId = String.fromCharCode(file) + rank;
        const currentSquare = document.getElementById(currentSquareId);
        const squareContent = isSquareOccupied(currentSquare);
        if (squareContent !== "blank") {
            if (squareContent !== pieceColor) {
                legalSquares.push(currentSquareId);
            }
            return;
        }
        legalSquares.push(currentSquareId);
    }
}

function moveToHFile(startingSquareId, pieceColor) {
    let file = startingSquareId.charCodeAt(0);
    const rank = startingSquareId.charAt(1);
    
    while (file < 104) {
        file++;
        const currentSquareId = String.fromCharCode(file) + rank;
        const currentSquare = document.getElementById(currentSquareId);
        const squareContent = isSquareOccupied(currentSquare);
        if (squareContent !== "blank") {
            if (squareContent !== pieceColor) {
                legalSquares.push(currentSquareId);
            }
            return;
        }
        legalSquares.push(currentSquareId);
    }
}

function getBishopMoves(startingSquareId, pieceColor) {
    moveToEighthRankHFile(startingSquareId, pieceColor);
    moveToEighthRankAFile(startingSquareId, pieceColor);
    moveToFirstRankHFile(startingSquareId, pieceColor);
    moveToFirstRankAFile(startingSquareId, pieceColor);
}

function moveToEighthRankAFile(startingSquareId, pieceColor) {
    let file = startingSquareId.charCodeAt(0); 
    let rank = parseInt(startingSquareId.charAt(1));
    
    while (file > 97 && rank < 8) { 
        file--;
        rank++;
        const currentSquareId = String.fromCharCode(file) + rank;
        const currentSquare = document.getElementById(currentSquareId);
        const squareContent = isSquareOccupied(currentSquare);
        if (squareContent !== "blank") {
            if (squareContent !== pieceColor) {
                legalSquares.push(currentSquareId); 
            }
            return;
        }
        legalSquares.push(currentSquareId);
    }
}

function moveToEighthRankHFile(startingSquareId, pieceColor) {
    let file = startingSquareId.charCodeAt(0);
    let rank = parseInt(startingSquareId.charAt(1));
    
    while (file < 104 && rank < 8) { 
        file++;
        rank++;
        const currentSquareId = String.fromCharCode(file) + rank;
        const currentSquare = document.getElementById(currentSquareId);
        const squareContent = isSquareOccupied(currentSquare);
        if (squareContent !== "blank") {
            if (squareContent !== pieceColor) {
                legalSquares.push(currentSquareId);
            }
            return;
        }
        legalSquares.push(currentSquareId);
    }
}

function moveToFirstRankAFile(startingSquareId, pieceColor) {
    let file = startingSquareId.charCodeAt(0);
    let rank = parseInt(startingSquareId.charAt(1));
    
    while (file > 97 && rank > 1) { 
        file--;
        rank--;
        const currentSquareId = String.fromCharCode(file) + rank;
        const currentSquare = document.getElementById(currentSquareId);
        const squareContent = isSquareOccupied(currentSquare);
        if (squareContent !== "blank") {
            if (squareContent !== pieceColor) {
                legalSquares.push(currentSquareId);
            }
            return;
        }
        legalSquares.push(currentSquareId);
    }
}

function moveToFirstRankHFile(startingSquareId, pieceColor) {
    let file = startingSquareId.charCodeAt(0);
    let rank = parseInt(startingSquareId.charAt(1));
    
    while (file < 104 && rank > 1) { 
        file++;
        rank--;
        const currentSquareId = String.fromCharCode(file) + rank;
        const currentSquare = document.getElementById(currentSquareId);
        const squareContent = isSquareOccupied(currentSquare);
        if (squareContent !== "blank") {
            if (squareContent !== pieceColor) {
                legalSquares.push(currentSquareId);
            }
            return;
        }
        legalSquares.push(currentSquareId);
    }
}
function getQueenMoves(startingSquareId, pieceColor) {
    moveToEighthRankHFile(startingSquareId, pieceColor);
    moveToEighthRankAFile(startingSquareId, pieceColor);
    moveToFirstRankHFile(startingSquareId, pieceColor);
    moveToFirstRankAFile(startingSquareId, pieceColor);
    moveToEighthRank(startingSquareId, pieceColor);
    moveToFirstRank(startingSquareId, pieceColor);
    moveToAFile(startingSquareId, pieceColor);
    moveToHFile(startingSquareId, pieceColor);
}
function getKingMoves(startingSquareId,pieceColor){

    const file = startingSquareId.charCodeAt(0) - 97; 
    const rank = parseInt(startingSquareId.charAt(1)); 

    const moves = [
        [0, 1], [0, -1], [1, 1], [1, -1],
        [-1, 0], [-1, -1], [-1, 1], [1,0]
    ];

    moves.forEach(([fileOffset, rankOffset]) => {
        const newFile = file + fileOffset;
        const newRank = rank + rankOffset;
        if (newFile >= 0 && newFile <= 7 && newRank >= 1 && newRank <= 8) {
            const newSquareId = String.fromCharCode(newFile + 97) + newRank;
            const newSquare = document.getElementById(newSquareId);
            const squareContent = isSquareOccupied(newSquare);
            if (squareContent === "blank" || squareContent !== pieceColor) {
                legalSquares.push(newSquareId);
            }
        }
    });
}