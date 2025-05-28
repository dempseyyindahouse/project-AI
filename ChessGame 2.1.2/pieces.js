import { boardSquaresArray, updateBoardSquaresArray, getPieceAtSquare, whiteKingSquare, blackKingSquare } from './board.js';
import { getPossibleMoves, isMoveValidAgainstCheck } from './moves.js';
import { checkForCheckMate } from './check.js';
import { isWhiteTurn } from './main.js';

// 2 hàm bắt đầu built id , sự kiện cho các ô cờ, quân cờ
// // gắn id cho các quân cờ vd: knightb8
function setupPieces() {
  const pieces = document.getElementsByClassName("piece");
  const piecesImages = document.getElementsByTagName("img");
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

// xử lý kéo quân cờ
function drag(ev) {
  const piece = ev.target;
  const pieceColor = piece.getAttribute("color"); // Lấy thuộc tính "color" của quân cờ (white hoặc black)
  const pieceType = piece.classList[1]; //  // Lấy loại quân cờ (ví dụ: rook, knight, ...)
  const pieceId = piece.id; // Lấy ID của quân cờ (vd: "rooka1")
  if (
    (isWhiteTurn && pieceColor === "white") ||
    (!isWhiteTurn && pieceColor === "black")
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
      boardSquaresArray
    );
    // // Chuyển danh sách các ô hợp lệ thành chuỗi JSON
    let legalSquaresJson = JSON.stringify(legalSquares);
    // Lưu chuỗi JSON vào dataTransfer với kiểu "application/json" để truyền thông tin các ô hợp lệ đi cùng trong sự kiện kéo
    ev.dataTransfer.setData("application/json", legalSquaresJson);
  }
}

function drop(ev) {
  ev.preventDefault();
  // Ngăn hành động mặc định của trình duyệt
  let data = ev.dataTransfer.getData("text");
  // Lấy dữ liệu text đã được lưu trong drag, ví dụ: "rooka1|a1"
  let [pieceId, startingSquareId] = data.split("|");
  // Tách dữ liệu text thành 2 phần: pieceId = "rooka1", startingSquareId = "a1"
  let legalSquaresJson = ev.dataTransfer.getData("application/json");
  // Lấy danh sách các ô hợp lệ mà quân cờ có thể đi (dưới dạng JSON string)
  if (legalSquaresJson.length === 0) return;
  // Nếu không có ô hợp lệ nào thì thoát hàm, không cho di chuyển
  let legalSquares = JSON.parse(legalSquaresJson);
  // Chuyển JSON string thành mảng các ô hợp lệ (vd: ["a2", "a3", "b1"])
  const piece = document.getElementById(pieceId);
  // Lấy đối tượng DOM của quân cờ theo id
  const pieceColor = piece.getAttribute("color");
  // Lấy màu quân cờ (white hoặc black)
  const pieceType = piece.classList[1];
  // Lấy loại quân cờ (ví dụ: "king", "rook", "pawn")
  const destinationSquare = ev.currentTarget;
  // Lấy ô mà quân cờ đang được thả vào
  let destinationSquareId = destinationSquare.id;
  // Lấy id của ô đích
  // Kiểm tra lại danh sách ô hợp lệ, loại bỏ những nước đi khiến vua bị chiếu (check)
  legalSquares = isMoveValidAgainstCheck(
    legalSquares,
    startingSquareId,
    pieceColor,
    pieceType
  );
  if (pieceType === "king") {
    // Nếu quân cờ là vua thì kiểm tra xem vị trí thả có khiến vua bị chiếu không
    let isCheck = isKingInCheck(destinationSquareId, pieceColor, boardSquaresArray);
    if (isCheck) return;
    // Nếu bị chiếu thì không cho thả quân vào ô đó
    // Cập nhật vị trí vua hiện tại sau khi di chuyển thành ô đích
    isWhiteTurn
      ? (whiteKingSquare = destinationSquareId)
      : (blackKingSquare = destinationSquareId);
  }
  // Lấy thông tin quân cờ đang đứng trên ô đích (nếu có)
  let squareContent = getPieceAtSquare(destinationSquareId, boardSquaresArray);
  if (
    squareContent.pieceColor === "blank" && // Ô đích đang trống
    legalSquares.includes(destinationSquareId) // Và ô đó hợp lệ để đi
  ) {
    destinationSquare.appendChild(piece);
    // Thêm quân cờ vào ô đích
    isWhiteTurn = !isWhiteTurn;
    // Đổi lượt chơi (từ trắng sang đen hoặc ngược lại)
    updateBoardSquaresArray(
      startingSquareId,
      destinationSquareId,
      boardSquaresArray
    );
    // Cập nhật lại mảng lưu trạng thái bàn cờ sau khi di chuyển
    checkForCheckMate();
    // Kiểm tra có phải đã xảy ra chiếu tướng hay chiếu hết không
    return;
  }
  if (
    squareContent.pieceColor !== "blank" && // Ô đích có quân cờ đối phương
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
    checkForCheckMate();
    // Kiểm tra chiếu tướng hay chiếu hết
    return;
  }
}

export { setupPieces, drag, drop };