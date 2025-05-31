import {
  fillBoardSquaresArray,
  updateBoardSquaresArray,
  getPieceAtSquare,
} from "./board.js";
import { getPossibleMoves } from "./moves.js";
import {
  isKingInCheck,
  isMoveValidAgainstCheck,
  checkForCheckMate,
} from "./chessRules.js";

import {
  castlingSquares,
  kingHasMoved,
  rookHasMoved,
  isShortCastlePossible,
  isLongCastlePossible,
  performCastling,
} from "./castling.js";

let boardSquaresArray = []; // thông tin các ô còw
let isWhiteTurn = true; // kiểm tra lượt bên nào đi
let whiteKingSquare = "e1"; // squareId vua trắng đang đứng
let blackKingSquare = "e8"; // squareId vua đen đang đứng
const boardSquares = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");

let historyMoves = []; // Lưu lịch sử các nước đi
window.enPassantSquare = "blank"; // Biến toàn cục lưu ô en passant

// 2 hàm bắt đầu built id , sự kiện cho các ô cờ, quần cờ
setupBoardSquares();
setupPieces();

fillBoardSquaresArray(boardSquaresArray, boardSquares);

// set id cho các ô (vd A1, B2)
function setupBoardSquares() {
  for (let i = 0; i < boardSquares.length; i++) {
    boardSquares[i].addEventListener("dragover", allowDrop);
    boardSquares[i].addEventListener("drop", drop);
    let row = 8 - Math.floor(i / 8);
    let column = String.fromCharCode(97 + (i % 8));
    let square = boardSquares[i];
    square.id = column + row;
  }
}

// // gắn id cho các quân cờ vd: knightb8
function setupPieces() {
  for (let i = 0; i < pieces.length; i++) {
    pieces[i].addEventListener("dragstart", drag);
    pieces[i].setAttribute("draggable", true);
    pieces[i].id =
      pieces[i].className.split(" ")[1] + pieces[i].parentElement.id;
  }
  for (let i = 0; i < piecesImages.length; i++) {
    piecesImages[i].setAttribute("draggable", false);
  }
}
function allowDrop(ev) {
  ev.preventDefault();
}
// xử lý kéo quân cờ
function drag(ev) {
  const piece = ev.target;
  const pieceColor = piece.getAttribute("color"); // Lấy thuộc tính "color" của quân cờ (white hoặc black)
  const pieceType = piece.classList[1]; //  // Lấy loại quân cờ (ví dụ: rook, knight, ...)
  const pieceId = piece.id; // Lấy ID của quân cờ (vd: "rooka1")
  if (
    (isWhiteTurn && pieceColor == "white") ||
    (!isWhiteTurn && pieceColor == "black")
  ) {
    const startingSquareId = piece.parentNode.id;
    ev.dataTransfer.setData("text", piece.id + "|" + startingSquareId); // vd "rooka1|a1"
    const pieceObject = {
      pieceColor: pieceColor,
      pieceType: pieceType,
      pieceId: pieceId,
    };

    //  // Gọi hàm tính các nước đi hợp lệ của quân cờ tại vị trí bắt đầu, dựa vào bàn cờ hiện tại
    let legalSquares = getPossibleMoves(
      startingSquareId,
      pieceObject,
      boardSquaresArray,
      historyMoves
    );
    let legalSquaresJson = JSON.stringify(legalSquares); // // Chuyển danh sách các ô hợp lệ thành chuỗi JSON
    ev.dataTransfer.setData("application/json", legalSquaresJson); // Lưu chuỗi JSON vào dataTransfer với kiểu "application/json" để truyền thông tin các ô hợp lệ đi cùng trong sự kiện kéo
  }
}

function drop(ev) {
  console.log("enPassantSquare:", window.enPassantSquare);
  ev.preventDefault();

  // --- Lấy dữ liệu kéo/thả và phân tích thông tin quân cờ, vị trí ---
  let data = ev.dataTransfer.getData("text"); // Lấy dữ liệu text đã được lưu trong drag, ví dụ: "rooka1|a1"
  let [pieceId, startingSquareId] = data.split("|"); // Tách dữ liệu text thành 2 phần: pieceId = "rooka1", startingSquareId = "a1"
  let legalSquaresJson = ev.dataTransfer.getData("application/json"); // Lấy danh sách các ô hợp lệ mà quân cờ có thể đi (dưới dạng JSON string)
  if (legalSquaresJson.length == 0) return; // Nếu không có ô hợp lệ nào thì thoát hàm, không cho di chuyển
  let legalSquares = JSON.parse(legalSquaresJson); // Chuyển JSON string thành mảng các ô hợp lệ (vd: ["a2", "a3", "b1"])
  const piece = document.getElementById(pieceId); // Lấy đối tượng DOM của quân cờ theo id
  const pieceColor = piece.getAttribute("color");
  const pieceType = piece.classList[1]; // Lấy loại quân cờ (ví dụ: "king", "rook", "pawn")
  const destinationSquare = ev.currentTarget; // Lấy ô mà quân cờ đang được thả vào
  let destinationSquareId = destinationSquare.id;

  // --- Lọc lại các nước đi hợp lệ, loại bỏ nước khiến vua bị chiếu ---
  legalSquares = isMoveValidAgainstCheck(
    legalSquares,
    startingSquareId,
    pieceColor,
    pieceType,
    isWhiteTurn,
    whiteKingSquare,
    blackKingSquare,
    boardSquaresArray,
    historyMoves
  ); // Kiểm tra lại danh sách ô hợp lệ, loại bỏ những nước đi khiến vua bị chiếu (check)

  // --- Xử lý nhập thành nếu là vua và đi đến ô nhập thành ---
  if (
    pieceType == "king" &&
    !kingHasMoved(historyMoves, pieceColor) &&
    castlingSquares.includes(destinationSquareId)
  ) {
    let isCheck = isKingInCheck(
      startingSquareId,
      pieceColor,
      boardSquaresArray,
      historyMoves
    );
    if (!isCheck) {
      performCastling(
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
      );
      // Cập nhật vị trí vua sau nhập thành
      if (pieceColor === "white") {
        whiteKingSquare = destinationSquareId;
      } else {
        blackKingSquare = destinationSquareId;
      }
      isWhiteTurn = !isWhiteTurn; // Đổi lượt chơi
      return;
    }
    return;
  }

  // --- Kiểm tra chiếu cho vua nếu là vua ---
  if (pieceType == "king") {
    // Nếu quân cờ là vua thì kiểm tra xem vị trí thả có khiến vua bị chiếu không
    let isCheck = isKingInCheck(
      destinationSquareId,
      pieceColor,
      boardSquaresArray
    );
    if (isCheck) return;
    // Nếu bị chiếu thì không cho thả quân vào ô đó

    // Cập nhật vị trí vua hiện tại sau khi di chuyển thành ô đích
    isWhiteTurn
      ? (whiteKingSquare = destinationSquareId)
      : (blackKingSquare = destinationSquareId);
  }

  // --- Lấy thông tin quân cờ đang đứng trên ô đích (nếu có) ---
  let squareContent = getPieceAtSquare(destinationSquareId, boardSquaresArray);

  // --- Xử lý khi ô đích trống ---
  if (
    squareContent.pieceColor == "blank" && // Ô đích đang trống
    legalSquares.includes(destinationSquareId) // Và ô đó hợp lệ để đi
  ) {
    // --- Kiểm tra en passant ---
    if (pieceType == "pawn" && window.enPassantSquare == destinationSquareId) {
      performEnPassant(
        piece,
        pieceColor,
        startingSquareId,
        destinationSquareId
      );
      window.enPassantSquare = "blank";
      return;
    }

    destinationSquare.appendChild(piece);
    // Thêm quân cờ vào ô đích

    // --- Cập nhật enPassantSquare nếu tốt vừa đi 2 ô ---
    if (
      pieceType === "pawn" &&
      Math.abs(
        parseInt(startingSquareId[1]) - parseInt(destinationSquareId[1])
      ) === 2
    ) {
      let file = destinationSquareId[0];
      let rank = parseInt(destinationSquareId[1]);
      let enPassantRank = pieceColor === "white" ? rank - 1 : rank + 1;
      window.enPassantSquare = file + enPassantRank;
    } else {
      window.enPassantSquare = "blank";
    }

    isWhiteTurn = !isWhiteTurn;
    // Đổi lượt chơi (từ trắng sang đen hoặc ngược lại)

    updateBoardSquaresArray(
      startingSquareId,
      destinationSquareId,
      boardSquaresArray
    );
    // Cập nhật lại mảng lưu trạng thái bàn cờ sau khi di chuyển

    checkForCheckMate(
      isWhiteTurn,
      whiteKingSquare,
      blackKingSquare,
      boardSquaresArray,
      historyMoves
    );
    // Kiểm tra có phải đã xảy ra chiếu tướng hay chiếu hết không

    return;
  }

  // --- Xử lý khi ô đích có quân đối phương (ăn quân) ---
  if (
    squareContent.pieceColor != "blank" && // Ô đích có quân cờ đối phương
    legalSquares.includes(destinationSquareId) // Và ô đó hợp lệ để đi
  ) {
    let children = destinationSquare.children;
    for (let i = 0; i < children.length; i++) {
      if (!children[i].classList.contains("coordinate")) {
        destinationSquare.removeChild(children[i]);
        // Xóa quân cờ đang đứng trên ô đích (bị ăn)
      }
    }

    destinationSquare.appendChild(piece);
    // Thêm quân cờ của mình vào ô đích

    isWhiteTurn = !isWhiteTurn;
    // Đổi lượt chơi

    updateBoardSquaresArray(
      startingSquareId,
      destinationSquareId,
      boardSquaresArray
    );
    // Cập nhật trạng thái bàn cờ

    checkForCheckMate(
      isWhiteTurn,
      whiteKingSquare,
      blackKingSquare,
      boardSquaresArray,
      historyMoves
    );
    // Kiểm tra chiếu tướng hay chiếu hết

    return;
  }
}

/**
 * Ghi lại một nước đi vào mảng moves để kiểm tra điều kiện nhập thành.
 * @param {string} startingSquareId - Ô xuất phát.
 * @param {string} destinationSquareId - Ô đích.
 * @param {string} pieceType - Loại quân cờ ("king", "rook", ...).
 * @param {string} pieceColor - Màu quân cờ ("white" hoặc "black").
 * @param {boolean} captured - Có ăn quân không.
 */
function makeMove(
  startingSquareId,
  destinationSquareId,
  pieceType,
  pieceColor,
  captured
) {
  historyMoves.push({
    from: startingSquareId,
    to: destinationSquareId,
    pieceType: pieceType,
    pieceColor: pieceColor,
    captured: captured,
  });
}

// Hàm này thực hiện nước đi "bắt tốt qua đường" (en passant) cho quân tốt.
// Khi tốt đi chéo vào ô trống phía sau tốt đối phương vừa đi 2 ô, tốt đối phương sẽ bị loại khỏi bàn cờ.
function performEnPassant(
  piece,
  pieceColor,
  startingSquareId,
  destinationSquareId
) {
  // Xác định ô phía sau ô đích (nơi có tốt đối phương bị bắt)
  let file = destinationSquareId[0];
  let rank = parseInt(destinationSquareId[1]);
  // Nếu tốt trắng ăn en passant thì tốt đen ở dưới, ngược lại
  rank += pieceColor === "white" ? -1 : 1;
  let squareBehindId = file + rank;

  // Xóa tốt đối phương trên giao diện
  const squareBehindElement = document.getElementById(squareBehindId);
  while (squareBehindElement.firstChild) {
    squareBehindElement.removeChild(squareBehindElement.firstChild);
  }

  // Cập nhật trạng thái bàn cờ trong mảng boardSquaresArray
  let squareBehind = boardSquaresArray.find(
    (element) => element.squareId === squareBehindId
  );
  squareBehind.pieceColor = "blank";
  squareBehind.pieceType = "blank";
  squareBehind.pieceId = "blank";

  // Di chuyển tốt của mình đến ô đích
  const destinationSquare = document.getElementById(destinationSquareId);
  destinationSquare.appendChild(piece);

  isWhiteTurn = !isWhiteTurn;
  updateBoardSquaresArray(
    startingSquareId,
    destinationSquareId,
    boardSquaresArray
  );

  // Ghi lại nước đi vào lịch sử
  let captured = true;
  makeMove(startingSquareId, destinationSquareId, "pawn", pieceColor, captured);

  // Kiểm tra chiếu hết
  checkForCheckMate(
    isWhiteTurn,
    whiteKingSquare,
    blackKingSquare,
    boardSquaresArray,
    historyMoves
  );
  return;
}
