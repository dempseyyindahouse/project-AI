/*
  File này chứa toàn bộ các hàm và hằng số phục vụ cho xử lý nhập thành (castling) trong game cờ vua.
  Bao gồm:
   - Kiểm tra điều kiện nhập thành cho vua và xe.
   - Kiểm tra các ô nhập thành hợp lệ.
   - Thực hiện di chuyển nhập thành (cả vua và xe).
*/

const castlingSquares = ["g1", "g8", "c1", "c8"]; // Các ô đích nhập thành

/**
 * Kiểm tra vua của màu đã từng di chuyển chưa (phục vụ nhập thành).
 * @param {Array} historyMoves - Mảng lịch sử nước đi.
 * @param {string} pieceColor - "white" hoặc "black".
 * @returns {boolean} - true nếu vua đã di chuyển, false nếu chưa.
 */
function kingHasMoved(historyMoves, pieceColor) {
  let result = historyMoves.find(
    (element) =>
      element.pieceColor === pieceColor && element.pieceType === "king"
  );
  return result !== undefined;
}

/**
 * Kiểm tra xe của màu và vị trí xuất phát đã từng di chuyển chưa (phục vụ nhập thành).
 * @param {Array} historyMoves - Mảng lịch sử nước đi.
 * @param {string} pieceColor - "white" hoặc "black".
 * @param {string} startingSquareId - Vị trí xuất phát của xe ("a1", "h1", "a8", "h8").
 * @returns {boolean} - true nếu xe đã di chuyển, false nếu chưa.
 */
function rookHasMoved(historyMoves, pieceColor, startingSquareId) {
  let result = historyMoves.find(
    (element) =>
      element.pieceColor === pieceColor &&
      element.pieceType === "rook" &&
      element.from == startingSquareId
  );
  return result !== undefined;
}

/**
 * Kiểm tra điều kiện nhập thành ngắn (vua về g1/g8).
 * @param {Array} historyMoves - Mảng lịch sử nước đi.
 * @param {string} pieceColor - "white" hoặc "black".
 * @param {Array} boardSquaresArray - Mảng trạng thái bàn cờ.
 * @returns {string} - Trả về "g1"/"g8" nếu nhập thành được, "blank" nếu không.
 */
function isShortCastlePossible(historyMoves, pieceColor, boardSquaresArray) {
  let rank = pieceColor === "white" ? "1" : "8"; // Trắng ở hàng 1, đen ở hàng 8
  let fSquare = boardSquaresArray.find(
    (element) => element.squareId === `f${rank}`
  );
  let gSquare = boardSquaresArray.find(
    (element) => element.squareId === `g${rank}`
  );
  // Kiểm tra các ô giữa vua và xe phải trống
  if (
    fSquare.pieceColor !== "blank" ||
    gSquare.pieceColor !== "blank" ||
    kingHasMoved(historyMoves, pieceColor) || // Vua chưa từng di chuyển
    rookHasMoved(historyMoves, pieceColor, `h${rank}`) // Xe ở h1/h8 chưa từng di chuyển
  ) {
    return "blank"; // Không nhập thành được
  }
  return `g${rank}`; // Nhập thành được, trả về ô đích
}

/**
 * Kiểm tra điều kiện nhập thành dài (vua về c1/c8).
 * @param {Array} historyMoves - Mảng lịch sử nước đi.
 * @param {string} pieceColor - "white" hoặc "black".
 * @param {Array} boardSquaresArray - Mảng trạng thái bàn cờ.
 * @returns {string} - Trả về "c1"/"c8" nếu nhập thành được, "blank" nếu không.
 */
function isLongCastlePossible(historyMoves, pieceColor, boardSquaresArray) {
  let rank = pieceColor === "white" ? "1" : "8";
  let dSquare = boardSquaresArray.find(
    (element) => element.squareId === `d${rank}`
  );
  let cSquare = boardSquaresArray.find(
    (element) => element.squareId === `c${rank}`
  );
  let bSquare = boardSquaresArray.find(
    (element) => element.squareId === `b${rank}`
  );
  if (
    dSquare.pieceColor !== "blank" ||
    cSquare.pieceColor !== "blank" ||
    bSquare.pieceColor !== "blank" ||
    kingHasMoved(historyMoves, pieceColor) ||
    rookHasMoved(historyMoves, pieceColor, `a${rank}`)
  ) {
    return "blank";
  }
  return `c${rank}`;
}

/**
 * Thực hiện nhập thành: di chuyển cả vua và xe khi vua đi đến ô nhập thành.
 *
 * Khi vua di chuyển đến ô nhập thành (g1, c1, g8, c8), hàm này sẽ:
 * - Xác định xe nào sẽ tham gia nhập thành và vị trí mới của xe.
 * - Kiểm tra xem vua có đi qua ô bị chiếu không (nếu có thì không cho nhập thành).
 * - Di chuyển xe đến vị trí mới (f1, d1, f8, d8) trên giao diện và cập nhật trạng thái bàn cờ.
 * - Di chuyển vua đến ô nhập thành trên giao diện và cập nhật trạng thái bàn cờ.
 * - Đổi lượt chơi.
 * - Ghi nhận nước đi vào lịch sử.
 * - Kiểm tra chiếu hết sau khi nhập thành.
 *
 * @param {HTMLElement} piece - DOM element của vua.
 * @param {string} pieceColor - "white" hoặc "black".
 * @param {string} startingSquareId - Ô xuất phát của vua.
 * @param {string} destinationSquareId - Ô đích (g1, c1, g8, c8).
 * @param {Array} boardSquaresArray - Mảng trạng thái bàn cờ.
 * @param {Array} historyMoves - Mảng lịch sử nước đi.
 * @param {function} isKingInCheck - Hàm kiểm tra vua bị chiếu.
 * @param {function} updateBoardSquaresArray - Hàm cập nhật trạng thái bàn cờ.
 * @param {function} makeMove - Hàm ghi nhận nước đi.
 * @param {function} checkForCheckMate - Hàm kiểm tra chiếu hết.
 * @param {boolean} isWhiteTurn - Lượt chơi hiện tại.
 */
function performCastling(
  piece,
  pieceColor,
  startingSquareId,
  destinationSquareId,
  boardSquaresArray,
  historyMoves,
  isKingInCheck,
  updateBoardSquaresArray,
  makeMove,
  checkForCheckMate,
  isWhiteTurn,
  whiteKingSquare,
  blackKingSquare

) {
  let rookId, rookDestinationSquareId, checkSquareId;
  // Xác định xe và vị trí mới của xe dựa vào ô đích nhập thành
  if (destinationSquareId == "g1") {
    rookId = "rookh1";
    rookDestinationSquareId = "f1";
    checkSquareId = "f1";
  } else if (destinationSquareId == "c1") {
    rookId = "rooka1";
    rookDestinationSquareId = "d1";
    checkSquareId = "d1";
  } else if (destinationSquareId == "g8") {
    rookId = "rookh8";
    rookDestinationSquareId = "f8";
    checkSquareId = "f8";
  } else if (destinationSquareId == "c8") {
    rookId = "rooka8";
    rookDestinationSquareId = "d8";
    checkSquareId = "d8";
  }
  // Kiểm tra nếu vua đi qua ô bị chiếu thì không cho nhập thành
  if (isKingInCheck(checkSquareId, pieceColor, boardSquaresArray, historyMoves))
    return;
  // Di chuyển xe sang vị trí mới trên giao diện và cập nhật trạng thái bàn cờ
  let rook = document.getElementById(rookId);
  let rookDestinationSquare = document.getElementById(rookDestinationSquareId);
  rookDestinationSquare.appendChild(rook);
  updateBoardSquaresArray(
    rook.id.slice(-2),
    rookDestinationSquare.id,
    boardSquaresArray
  );
  // Di chuyển vua sang ô nhập thành trên giao diện và cập nhật trạng thái bàn cờ
  const destinationSquare = document.getElementById(destinationSquareId);
  destinationSquare.appendChild(piece);
  isWhiteTurn = !isWhiteTurn;
  updateBoardSquaresArray(
    startingSquareId,
    destinationSquareId,
    boardSquaresArray
  );
  // Ghi nhận nước đi vào lịch sử và kiểm tra chiếu hết
  let captured = false;
  makeMove(startingSquareId, destinationSquareId, "king", pieceColor, captured);
  checkForCheckMate(
    isWhiteTurn,
    pieceColor === "white" ? destinationSquareId : whiteKingSquare,
    pieceColor === "black" ? destinationSquareId : blackKingSquare,
    boardSquaresArray,
    historyMoves
  );
  return;
}

export {
  castlingSquares,
  kingHasMoved,
  rookHasMoved,
  isShortCastlePossible,
  isLongCastlePossible,
  performCastling,
};
