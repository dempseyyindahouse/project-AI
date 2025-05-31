import { showAlert, deepCopyArray } from "./util.js";
import { updateBoardSquaresArray, getPieceAtSquare } from "./board.js";
import {
  getRookMoves,
  getBishopMoves,
  getKnightMoves,
  getKingMoves,
  checkPawnDiagonalCaptures,
  getPossibleMoves,
} from "./moves.js";

/**
 * Kiểm tra xem vua tại ô squareId có đang bị chiếu (check) bởi bất kỳ quân cờ đối phương nào không.
 * @param {string} squareId - ID ô hiện tại của vua cần kiểm tra (ví dụ: "e1").
 * @param {string} pieceColor - Màu của vua ("white" hoặc "black").
 * @param {Array} boardSquaresArray - Mảng trạng thái bàn cờ hiện tại (mỗi phần tử là 1 ô cờ).
 * @returns {boolean} - true nếu vua bị chiếu, false nếu không.
 */
function isKingInCheck(
  squareId, // Ô hiện tại của vua cần kiểm tra
  pieceColor, // Màu của vua (white hoặc black)
  boardSquaresArray // Trạng thái bàn cờ hiện tại (mảng các ô cờ)
) {
  // Kiểm tra các nước đi của xe (rook) và hậu (queen) theo đường thẳng
  let legalSquares = getRookMoves(squareId, pieceColor, boardSquaresArray);
  for (let squareId of legalSquares) {
    let pieceProperties = getPieceAtSquare(squareId, boardSquaresArray);
    if (
      (pieceProperties.pieceType == "rook" ||
        pieceProperties.pieceType == "queen") &&
      pieceColor != pieceProperties.pieceColor
    )
      return true; // Nếu có quân đối phương là xe hoặc hậu đe dọa, vua bị chiếu
  }

  // Kiểm tra các nước đi của tượng (bishop) và hậu (queen) theo đường chéo
  legalSquares = getBishopMoves(squareId, pieceColor, boardSquaresArray);
  for (let squareId of legalSquares) {
    let pieceProperties = getPieceAtSquare(squareId, boardSquaresArray);
    if (
      (pieceProperties.pieceType == "bishop" ||
        pieceProperties.pieceType == "queen") &&
      pieceColor != pieceProperties.pieceColor
    )
      return true; // Nếu có quân đối phương là tượng hoặc hậu đe dọa, vua bị chiếu
  }

  // Kiểm tra các nước ăn chéo của tốt (pawn)
  legalSquares = checkPawnDiagonalCaptures(
    squareId,
    pieceColor,
    boardSquaresArray
  );
  for (let squareId of legalSquares) {
    let pieceProperties = getPieceAtSquare(squareId, boardSquaresArray);
    if (
      pieceProperties.pieceType == "pawn" &&
      pieceColor != pieceProperties.pieceColor
    )
      return true; // Nếu có tốt đối phương đe dọa vua, vua bị chiếu
  }

  // Kiểm tra các nước đi của mã (knight)
  legalSquares = getKnightMoves(squareId, pieceColor, boardSquaresArray);
  for (let squareId of legalSquares) {
    let pieceProperties = getPieceAtSquare(squareId, boardSquaresArray);
    if (
      pieceProperties.pieceType == "knight" &&
      pieceColor != pieceProperties.pieceColor
    )
      return true; // Nếu có mã đối phương đe dọa vua, vua bị chiếu
  }

  // Kiểm tra các nước đi của vua đối phương
  legalSquares = getKingMoves(squareId, pieceColor, boardSquaresArray);
  for (let squareId of legalSquares) {
    let pieceProperties = getPieceAtSquare(squareId, boardSquaresArray);
    if (
      pieceProperties.pieceType == "king" &&
      pieceColor != pieceProperties.pieceColor
    )
      return true; // Nếu vua đối phương có thể đi đến ô vua ta, vua bị chiếu
  }

  // Nếu không có quân đối phương nào đe dọa vua, trả về false
  return false;
}

/**
 * Lọc nước đi hợp lệ, loại bỏ những nước đi khiến vua bị chiếu.
 * @param {Array} legalSquares - Mảng các ô có thể đi hợp lệ ban đầu.
 * @param {string} startingSquareId - Ô xuất phát của quân cờ.
 * @param {string} pieceColor - Màu quân cờ ("white" hoặc "black").
 * @param {string} pieceType - Loại quân cờ ("king", "rook", "knight", ...).
 * @param {boolean} isWhiteTurn - Lượt đi hiện tại (true nếu trắng đi, false nếu đen đi).
 * @param {string} whiteKingSquare - Vị trí vua trắng hiện tại.
 * @param {string} blackKingSquare - Vị trí vua đen hiện tại.
 * @param {Array} boardSquaresArray - Mảng trạng thái bàn cờ hiện tại.
 * @returns {Array} - Danh sách các ô đi hợp lệ đã loại bỏ nước đi khiến vua bị chiếu.
 */

/**
 * Kiểm tra xem có chiếu hết (checkmate) hay không. Nếu chiếu hết sẽ hiện thông báo chiến thắng.
 * @param {boolean} isWhiteTurn - Lượt đi hiện tại (true nếu trắng đi, false nếu đen đi).
 * @param {string} whiteKingSquare - Vị trí vua trắng hiện tại.
 * @param {string} blackKingSquare - Vị trí vua đen hiện tại.
 * @param {Array} boardSquaresArray - Mảng trạng thái bàn cờ hiện tại.
 */
function isMoveValidAgainstCheck(
  legalSquares, // Mảng các ô có thể đi hợp lệ ban đầu
  startingSquareId, // Ô xuất phát của quân cờ
  pieceColor, // Màu quân cờ (white hoặc black)
  pieceType, // Loại quân cờ (king, rook, knight, ...)
  isWhiteTurn,
  whiteKingSquare,
  blackKingSquare,
  boardSquaresArray
) {
  // Xác định vị trí vua hiện tại dựa trên lượt đi
  let kingSquare = isWhiteTurn ? whiteKingSquare : blackKingSquare;

  // Sao chép mảng trạng thái bàn cờ để thử nghiệm nước đi
  let boardSquaresArrayCopy = deepCopyArray(boardSquaresArray);

  // Sao chép danh sách ô hợp lệ để duyệt kiểm tra
  let legalSquaresCopy = legalSquares.slice();

  legalSquaresCopy.forEach((element) => {
    let destinationId = element;

    // Mỗi lần thử nghiệm, sao chép lại trạng thái bàn cờ ban đầu
    boardSquaresArrayCopy = deepCopyArray(boardSquaresArray);

    // Cập nhật trạng thái bàn cờ sau khi di chuyển quân từ ô bắt đầu đến ô đích giả lập
    updateBoardSquaresArray(
      startingSquareId,
      destinationId,
      boardSquaresArrayCopy
    );

    // Nếu quân cờ không phải vua, kiểm tra xem vua có bị chiếu không sau khi di chuyển
    if (
      pieceType != "king" &&
      isKingInCheck(kingSquare, pieceColor, boardSquaresArrayCopy)
    ) {
      // Loại bỏ ô đích nếu di chuyển vào đó khiến vua bị chiếu
      legalSquares = legalSquares.filter((item) => item != destinationId);
    }

    // Nếu quân cờ là vua, kiểm tra xem vị trí mới có khiến vua bị chiếu không
    if (
      pieceType == "king" &&
      isKingInCheck(destinationId, pieceColor, boardSquaresArrayCopy)
    ) {
      // Loại bỏ ô đích nếu khiến vua bị chiếu
      legalSquares = legalSquares.filter((item) => item != destinationId);
    }
  });

  // Trả về danh sách các ô đi hợp lệ đã loại bỏ nước đi khiến vua bị chiếu
  return legalSquares;
}

/**
 * Kiểm tra xem có chiếu hết (checkmate) hay không. Nếu chiếu hết sẽ hiện thông báo chiến thắng.
 * @param {boolean} isWhiteTurn - Lượt đi hiện tại (true nếu trắng đi, false nếu đen đi).
 * @param {string} whiteKingSquare - Vị trí vua trắng hiện tại.
 * @param {string} blackKingSquare - Vị trí vua đen hiện tại.
 * @param {Array} boardSquaresArray - Mảng trạng thái bàn cờ hiện tại.
 */
function checkForCheckMate(
  isWhiteTurn,
  whiteKingSquare,
  blackKingSquare,
  boardSquaresArray
) {
  // Xác định vị trí vua của bên đang đi
  let kingSquare = isWhiteTurn ? whiteKingSquare : blackKingSquare;

  // Xác định màu quân cờ của bên đang đi
  let pieceColor = isWhiteTurn ? "white" : "black";

  // Tạo bản sao bàn cờ để kiểm tra mà không làm thay đổi trạng thái thật
  let boardSquaresArrayCopy = deepCopyArray(boardSquaresArray);

  // Kiểm tra xem vua hiện tại có đang bị chiếu hay không
  let kingIsCheck = isKingInCheck(
    kingSquare,
    pieceColor,
    boardSquaresArrayCopy
  );

  // Nếu vua không bị chiếu thì không thể là chiếu hết => thoát hàm
  if (!kingIsCheck) return;

  // Lấy tất cả các nước đi hợp lệ của bên đang bị chiếu
  let possibleMoves = getAllPossibleMoves(
    boardSquaresArrayCopy,
    pieceColor,
    isWhiteTurn,
    whiteKingSquare,
    blackKingSquare
  );
  // Nếu còn ít nhất một nước đi để thoát => không phải chiếu hết => thoát hàm
  if (possibleMoves.length > 0) return;

  // Nếu đến đây thì vua đang bị chiếu và không còn nước đi nào => chiếu hết
  let message = "";
  isWhiteTurn ? (message = "Black Wins!") : (message = "White Wins!");

  // Hiển thị thông báo chiến thắng
  showAlert(message);
}

/**
 * Lấy tất cả các nước đi hợp lệ cho toàn bộ quân cờ của một bên.
 * @param {Array} squaresArray - Mảng trạng thái bàn cờ hiện tại (gồm các ô và quân cờ tương ứng).
 * @param {string} color - Màu quân cờ cần xét ("white" hoặc "black").
 * @param {boolean} isWhiteTurn - Lượt đi hiện tại (true nếu trắng đi, false nếu đen đi).
 * @param {string} whiteKingSquare - Vị trí vua trắng hiện tại.
 * @param {string} blackKingSquare - Vị trí vua đen hiện tại.
 * @returns {Array} - Danh sách tất cả các nước đi hợp lệ.
 */
function getAllPossibleMoves(
  squaresArray,
  color,
  isWhiteTurn,
  whiteKingSquare,
  blackKingSquare
) {
  return (
    squaresArray
      // Bước 1: Lọc ra các ô chứa quân cờ thuộc bên đang xét
      .filter((square) => square.pieceColor === color)
      // Bước 2: Với mỗi quân cờ, tìm các nước đi hợp lệ
      .flatMap((square) => {
        const { pieceColor, pieceType, pieceId } = getPieceAtSquare(
          square.squareId,
          squaresArray
        );

        // Bỏ qua ô trống (không có quân cờ)
        if (pieceId === "blank") return [];

        // Tạo bản sao của bàn cờ để tính nước đi giả lập
        let squaresArrayCopy = deepCopyArray(squaresArray);

        // Tạo đối tượng quân cờ để truyền cho hàm xử lý
        const pieceObject = {
          pieceColor: pieceColor,
          pieceType: pieceType,
          pieceId: pieceId,
        };

        // Lấy danh sách các nước đi hợp lệ (chưa xét chiếu)
        let legalSquares = getPossibleMoves(
          square.squareId,
          pieceObject,
          squaresArrayCopy
        );

        // Loại bỏ các nước đi khiến vua bị chiếu
        legalSquares = isMoveValidAgainstCheck(
          legalSquares,
          square.squareId,
          pieceColor,
          pieceType,
          isWhiteTurn,
          whiteKingSquare,
          blackKingSquare,
          squaresArray
        );

        // Trả về danh sách nước đi hợp lệ cuối cùng cho quân cờ này
        return legalSquares;
      })
  );
}
export {
  isKingInCheck,
  isMoveValidAgainstCheck,
  checkForCheckMate,
  getAllPossibleMoves,
};
