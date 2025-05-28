let boardSquaresArray = []; // thông tin các ô cờ
let whiteKingSquare = "e1"; // squareId vua trắng đang đứng
let blackKingSquare = "e8"; // squareId vua đen đang đứng

// tạo mảng thông tin (squareID, màu quân cờ,loại quân cờ, id quân cờ) vào boardSquaresArray
function fillBoardSquaresArray() {
  const boardSquares = document.getElementsByClassName("square");
  boardSquaresArray = [];
  for (let i = 0; i < boardSquares.length; i++) {
    let row = 8 - Math.floor(i / 8);
    let column = String.fromCharCode(97 + (i % 8));
    let square = boardSquares[i];
    square.id = column + row;
    let color = "";
    let pieceType = "";
    let pieceId = "";
    if (square.querySelector(".piece")) {
      color = square.querySelector(".piece").getAttribute("color");
      pieceType = square.querySelector(".piece").classList[1];
      pieceId = square.querySelector(".piece").id;
    } else {
      color = "blank";
      pieceType = "blank";
      pieceId = "blank";
    }
    let arrayElement = {
      squareId: square.id,
      pieceColor: color,
      pieceType: pieceType,
      pieceId: pieceId,
    };
    boardSquaresArray.push(arrayElement);
  }
}

// cập nhật bảng thông tin ô cờ
function updateBoardSquaresArray(
  currentSquareId,
  destinationSquareId,
  boardSquaresArray
) {
  let currentSquare = boardSquaresArray.find(
    (element) => element.squareId === currentSquareId
  );
  let destinationSquareElement = boardSquaresArray.find(
    (element) => element.squareId === destinationSquareId
  );
  let pieceColor = currentSquare.pieceColor;
  let pieceType = currentSquare.pieceType;
  let pieceId = currentSquare.pieceId;
  destinationSquareElement.pieceColor = pieceColor;
  destinationSquareElement.pieceType = pieceType;
  destinationSquareElement.pieceId = pieceId;
  currentSquare.pieceColor = "blank";
  currentSquare.pieceType = "blank";
  currentSquare.pieceId = "blank";
}

// set id cho các ô (vd A1, B2)
function setupBoardSquares() {
  const boardSquares = document.getElementsByClassName("square");
  for (let i = 0; i < boardSquares.length; i++) {
    boardSquares[i].addEventListener("dragover", allowDrop);
    boardSquares[i].addEventListener("drop", drop);
    let row = 8 - Math.floor(i / 8);
    let column = String.fromCharCode(97 + (i % 8));
    let square = boardSquares[i];
    square.id = column + row;
  }
}

function allowDrop(ev) {
  ev.preventDefault();
}

// lấy thông tin quân cờ trên 1 ô
function getPieceAtSquare(squareId, boardSquaresArray) {
  let currentSquare = boardSquaresArray.find(
    (element) => element.squareId === squareId
  );
  const color = currentSquare.pieceColor;
  const pieceType = currentSquare.pieceType;
  const pieceId = currentSquare.pieceId;
  return { pieceColor: color, pieceType: pieceType, pieceId: pieceId };
}

export {
  boardSquaresArray,
  whiteKingSquare,
  blackKingSquare,
  fillBoardSquaresArray,
  updateBoardSquaresArray,
  setupBoardSquares,
  allowDrop,
  getPieceAtSquare
};