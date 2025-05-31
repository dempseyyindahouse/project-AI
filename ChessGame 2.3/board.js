/**
 * board.js
 * Quản lý trạng thái bàn cờ: khởi tạo, cập nhật, lấy thông tin quân cờ trên ô.
 */

/**
 * Tạo mảng thông tin (squareID, màu quân cờ, loại quân cờ, id quân cờ) vào boardSquaresArray.
 * @param {Array} boardSquaresArray - Mảng lưu trạng thái các ô cờ (sẽ được cập nhật trong hàm).
 * @param {HTMLCollection} boardSquares - Danh sách các phần tử DOM đại diện cho các ô cờ trên bàn cờ.
 */
function fillBoardSquaresArray(boardSquaresArray, boardSquares) {
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

/**
 * Cập nhật trạng thái mảng thông tin các ô cờ sau khi di chuyển quân cờ.
 * @param {string} currentSquareId - ID của ô cờ xuất phát (quân cờ đang đứng).
 * @param {string} destinationSquareId - ID của ô cờ đích (quân cờ sẽ di chuyển tới).
 * @param {Array} boardSquaresArray - Mảng lưu trạng thái các ô cờ (sẽ được cập nhật trong hàm).
 */
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

export { fillBoardSquaresArray, updateBoardSquaresArray, getPieceAtSquare };
