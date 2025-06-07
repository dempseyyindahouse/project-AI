// Độ khó của AI được chọn từ dropdown
const difficultySelect = document.getElementById("difficulty");
let depth = parseInt(difficultySelect.value, 10) || 3; // Mặc định là 3 nếu không hợp lệ
console.log(`Độ khó AI: ${depth}`);
difficultySelect.addEventListener("change", () => {
  const selectedDifficulty = difficultySelect.value;
  depth = parseInt(selectedDifficulty, 10) || 3;
  console.log(`Độ khó AI: ${depth}`);
});

// === Trả về màu quân đối thủ (dùng để đổi lượt trong Minimax) ===
function oppositeColor(color) {
  return color === "white" ? "black" : "white";
}

/**
 * Đánh giá trạng thái bàn cờ theo góc nhìn của AI: tổng điểm = điểm AI - điểm đối thủ.
 *
 * @param {Array} board - Mảng đại diện cho trạng thái bàn cờ hiện tại (boardSquaresArray)
 * @param {string} aiColor - Màu quân của AI ("white" hoặc "black")
 * @returns {number} - Tổng điểm: dương nếu có lợi cho AI, âm nếu có lợi cho đối thủ
 */
function evaluateBoard(board, aiColor) {
  const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 1000,
  };

  const centerSquares = ["d4", "e4", "d5", "e5"];
  let score = 0;

  for (let square of board) {
    if (square.pieceType === "blank") continue;

    const isAI = square.pieceColor === aiColor;
    const sign = isAI ? 1 : -1;
    const value = pieceValues[square.pieceType] || 0;

    // 1. Điểm quân cờ (material value)
    score += sign * value;

    // 2. Trừ điểm nếu bị đe dọa
    const attacked = isSquareAttacked(
      square.squareId,
      board,
      oppositeColor(square.pieceColor)
    );
    if (attacked) score -= sign * value * 0.5;

    // 3. Thưởng khi kiểm soát trung tâm
    if (centerSquares.includes(square.squareId)) {
      score += sign * 0.5;
    }

    // 4. Thưởng khi phát triển quân mã hoặc tượng ra khỏi hàng cơ sở
    const baseRank = square.pieceColor === "white" ? "1" : "8";
    if (
      (square.pieceType === "knight" || square.pieceType === "bishop") &&
      !square.squareId.endsWith(baseRank)
    ) {
      score += sign * 0.3;
    }

    // 5. Trừ điểm nếu quân bị khóa (bị chặn phía trước và không thể đi)
    const moves = getPossibleMoves(square.squareId, square, board);
    if (moves.length === 0) score -= sign * 0.2;
  }

  return score;
}

/**
 * Kiểm tra xem một ô trên bàn cờ có đang bị tấn công bởi quân đối phương hay không.
 *
 * @param {string} squareId - ID của ô cần kiểm tra (ví dụ "e4", "g1", ...)
 * @param {Array} board - Trạng thái bàn cờ hiện tại (mảng boardSquaresArray)
 * @param {string} attackerColor - Màu của bên tấn công ("white" hoặc "black")
 * @returns {boolean} - Trả về true nếu ô đang bị tấn công, ngược lại false
 */
function isSquareAttacked(squareId, board, attackerColor) {
  // Tạo một bản sao của bàn cờ để không làm thay đổi trạng thái gốc
  const simulatedBoard = deepCopyArray(board);

  // Sinh tất cả nước đi hợp lệ của quân cờ thuộc bên attackerColor
  const moves = generateAllMoves(simulatedBoard, attackerColor);

  // Kiểm tra xem có nước đi nào tấn công vào ô cần kiểm tra không
  // Nếu có ít nhất 1 nước đi có điểm đến là squareId → trả về true
  return moves.some((move) => move.to === squareId);
}

/**
 * Sinh tất cả nước đi hợp lệ cho một bên trên bàn cờ.
 *
 * @param {Array} board - Mảng trạng thái bàn cờ hiện tại (boardSquaresArray)
 * @param {string} color - Màu quân cờ cần sinh nước đi ("white" hoặc "black")
 * @returns {Array} - Mảng các nước đi hợp lệ. Mỗi nước có dạng:
 *   { from: string, to: string, pieceType: string, captured: boolean }
 */
function generateAllMoves(board, color) {
  const moves = [];
  for (let square of board) {
    // Bỏ qua ô không có quân của màu hiện tại
    if (square.pieceColor !== color) continue;

    const { pieceColor, pieceType, pieceId } = square;
    const pieceObject = { pieceColor, pieceType, pieceId };

    // Lấy các nước đi cơ bản cho quân cờ này
    let legalSquares = getPossibleMoves(square.squareId, pieceObject, board);

    // Lọc ra các nước không khiến vua bị chiếu
    legalSquares = isMoveValidAgainstCheck(
      legalSquares,
      square.squareId,
      pieceColor,
      pieceType
    );

    // Duyệt qua các ô hợp lệ và thêm vào danh sách nước đi
    for (let dest of legalSquares) {
      const destSquare = getPieceAtSquare(dest, board);
      const captured = destSquare.pieceColor !== "blank"; // Kiểm tra nếu ô đích có quân cờ đối phương
      // Thêm nước đi hợp lệ vào danh sách
      moves.push({
        from: square.squareId,
        to: dest,
        pieceType: pieceType,
        captured: captured,
      });
    }
  }
  return moves;
}

/**
 * Thuật toán Minimax với Alpha-Beta pruning để tìm điểm tốt nhất cho người chơi hiện tại.
 *
 * @param {Array} board - Mảng trạng thái bàn cờ hiện tại (deep copy của boardSquaresArray)
 * @param {number} depth - Độ sâu tìm kiếm (số lượt tối đa cần mô phỏng)
 * @param {number} alpha - Giá trị lớn nhất mà MAX (AI) đảm bảo đạt được (dùng để cắt tỉa)
 * @param {number} beta - Giá trị nhỏ nhất mà MIN đảm bảo đạt được (dùng để cắt tỉa)
 * @param {boolean} maximizingPlayer - true nếu đang ở lượt của MAX (AI), false nếu MIN (người chơi)
 * @param {string} color - Màu quân của người chơi hiện tại ("white" hoặc "black")
 * @returns {number} - Điểm đánh giá tốt nhất có thể đạt được từ trạng thái hiện tại
 */
function minimax(board, depth, alpha, beta, maximizingPlayer, color) {
  // Trường hợp dừng: đến độ sâu 0 hoặc không còn nước đi
  if (depth === 0) return evaluateBoard(board, color);

  const moves = generateAllMoves(board, color);
  if (moves.length === 0) return evaluateBoard(board, color);

  if (maximizingPlayer) {
    // maxEval là điểm cao nhất MAX (AI) tìm được tại node hiện tại
    // alpha là điểm tốt nhất MAX từng tìm thấy ở các node tổ tiên → dùng để cắt tỉa
    let maxEval = -Infinity;
    for (let move of moves) {
      let boardCopy = deepCopyArray(board);
      updateBoardSquaresArray(move.from, move.to, boardCopy);

      // Đệ quy gọi minimax cho lượt MIN tiếp theo
      const evalScore = minimax(
        boardCopy,
        depth - 1,
        alpha,
        beta,
        false,
        oppositeColor(color)
      );

      // Cập nhật giá trị lớn nhất hiện tại
      maxEval = Math.max(maxEval, evalScore);
      // Cập nhật alpha để giữ giá trị tốt nhất của MAX cho việc cắt tỉa
      alpha = Math.max(alpha, evalScore);

      // Nếu alpha ≥ beta, không cần duyệt thêm vì MIN sẽ không chọn nhánh này
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    // minEval là điểm thấp nhất MIN tìm được tại node hiện tại
    // beta là điểm tốt nhất MIN từng tìm thấy ở các node tổ tiên → dùng để cắt tỉa
    let minEval = Infinity;
    for (let move of moves) {
      let boardCopy = deepCopyArray(board);
      updateBoardSquaresArray(move.from, move.to, boardCopy);

      // Đệ quy gọi minimax cho lượt MAX tiếp theo
      const evalScore = minimax(
        boardCopy,
        depth - 1,
        alpha,
        beta,
        true,
        oppositeColor(color)
      );

      // Cập nhật giá trị nhỏ nhất hiện tại
      minEval = Math.min(minEval, evalScore);
      // Cập nhật beta để giữ giá trị tốt nhất của MIN cho việc cắt tỉa
      beta = Math.min(beta, evalScore);

      // Nếu alpha ≥ beta, không cần duyệt thêm vì MAX sẽ không chọn nhánh này
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Tìm nước đi tốt nhất cho AI bằng thuật toán Minimax có cắt tỉa Alpha-Beta.
 *
 * @param {Array} board - Trạng thái bàn cờ hiện tại (mảng boardSquaresArray hoặc bản sao)
 * @param {string} color - Màu quân AI đang điều khiển ("black" hoặc "white")
 * @param {number} depth - Độ sâu tối đa cần tìm trong cây Minimax
 * @returns {Object|null} - Nước đi tốt nhất, có dạng:
 *   {
 *     from: string,       // ID ô xuất phát (vd: "e2")
 *     to: string,         // ID ô đích (vd: "e4")
 *     pieceType: string,  // Loại quân cờ (vd: "pawn", "knight")
 *     captured: boolean   // Đúng nếu nước đi này ăn quân đối thủ
 *   }
 *   Hoặc null nếu không có nước đi hợp lệ nào.
 */
function getBestMove(board, color, depth) {
  let bestMove = null;
  let bestScore = -Infinity;

  // Sinh tất cả nước đi hợp lệ của AI
  const moves = generateAllMoves(board, color);

  for (let move of moves) {
    // Giả lập nước đi bằng cách sao chép và cập nhật bàn cờ
    let boardCopy = deepCopyArray(board);
    updateBoardSquaresArray(move.from, move.to, boardCopy);

    // Đánh giá nước đi này bằng minimax với lượt đối phương tiếp theo
    const score = minimax(
      boardCopy,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      oppositeColor(color)
    );

    // Nếu điểm cao hơn điểm tốt nhất trước đó → cập nhật
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

/**
 * Thực hiện nước đi của AI trên bàn cờ, dựa vào thuật toán Minimax.
 *
 * @param {string} color - Màu quân của AI ("black" hoặc "white")
 */
function makeAIMove(color) {
  console.log(`AI (${color}) đang suy nghĩ...` + " (độ sâu: " + depth + ")");

  // Tìm nước đi tốt nhất theo thuật toán Minimax
  const bestMove = getBestMove(boardSquaresArray, color, depth);
  if (!bestMove) return;

  const { from, to, pieceType, captured } = bestMove;

  // Lấy phần tử DOM quân cờ dựa trên id = pieceType + from (ví dụ "knightg8")
  const piece = document.getElementById(pieceType + from);
  const destinationSquare = document.getElementById(to);

  // ———— XÓA QUÂN BỊ ĂN (nếu có)
  if (captured) {
    Array.from(destinationSquare.children).forEach((child) => {
      if (child.classList.contains("piece")) {
        destinationSquare.removeChild(child);
      }
    });
  }

  // Di chuyển quân cờ từ ô bắt đầu đến ô đích trên UI
  destinationSquare.appendChild(piece);

  //Cập nhật lại ID của quân cờ theo ô mới
  piece.id = pieceType + to;

  // Cập nhật trạng thái game:
  // - Đảo lượt người chơi
  // - Cập nhật mảng bàn cờ nội bộ
  // - Ghi lại nước đi vừa thực hiện
  isWhiteTurn = !isWhiteTurn;
  updateBoardSquaresArray(from, to, boardSquaresArray);
  makeMove(from, to, pieceType, color, captured);

  // In ra nước đi của AI
  console.log(
    `AI (${color}) moved ${pieceType} from ${from} to ${to}${
      captured ? " (captured)" : ""
    }`
  );

  // Kiểm tra các điều kiện kết thúc ván cờ: chiếu hết, hòa, v.v.
  checkForEndGame();
}
