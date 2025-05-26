let legalSquares = [];
let isWhiteTurn = true;
const boardSquare = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");

// 2 hàm bắt đầu built id , sự kiện cho các ô cờ, quần cờ
setupBoardSquares();
setupPieces();

// set id cho các ô vd A1, B2
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

// gắn id cho các quân cờ vd: knightb8
function setupPieces() {
  for (let i = 0; i < pieces.length; i++) {
    pieces[i].addEventListener("dragstart", drag);
    pieces[i].setAttribute("draggable", true); // cho phép drag quân cờ
    pieces[i].id =
      pieces[i].className.split(" ")[1] + pieces[i].parentElement.id;
  }
  for (let i = 0; i < piecesImages.length; i++) {
    piecesImages[i].setAttribute("draggable", false); // chỉ cho phép các cụm div, ko kéo mỗi img
  }
}

function allowDrop(ev) {
  ev.preventDefault(); // nếu ko có hàm này, trình duyệt ko cho phép drop
}

// xử lý kéo quân cờ
function drag(ev) {
  const piece = ev.target;
  const pieceColor = piece.getAttribute("color");
  if (
    (isWhiteTurn && pieceColor === "white") ||
    (!isWhiteTurn && pieceColor === "black")
  ) {
    ev.dataTransfer.setData("text", piece.id); //  Lưu id quân cờ (rocka8) vào "text" để sử dụng sau khi thả
    const startingSquareId = piece.parentNode.id; // lấy id ô cờ ban đầu
    getPossibleMoves(startingSquareId, piece); // // Tính toán các nước đi hợp lệ cho quân cờ
  }
}

// xử lý thả 1 quân cờ trên bàn cờ
function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const piece = document.getElementById(data);
  const destinationSquare = ev.currentTarget; // ô đang được thả
  const destinationSquareId = destinationSquare.id;

  if (legalSquares.includes(destinationSquareId)) {
    // kiểm tra ô hiện tai có quân nào ko, nào có thì xóa
    while (destinationSquare.firstChild) {
      destinationSquare.removeChild(destinationSquare.firstChild);
    }
    destinationSquare.appendChild(piece); // thêm quân cờ vào ô đang thả
    isWhiteTurn = !isWhiteTurn;
    legalSquares.length = 0;
  }
}

// kiểm tra ô square có quân cờ nào ko, nếu có trả về màu quân cờ, nếu ko trả về "blank"
function isSquareOccupied(square) {
  if (square && square.querySelector(".piece")) {
    const color = square.querySelector(".piece").getAttribute("color");
    return color;
  }
  return "blank";
}

// kiểm tra nước đi chéo của quân Tốt (Pawn) nhằm bắt quân đối phương
function checkPawnDiagonalCaptures(startingSquareId, pieceColor) {
  const file = startingSquareId.charAt(0); // Cột, ví dụ "e"
  const rank = parseInt(startingSquareId.charAt(1)); // Hàng, ví dụ "4"
  const direction = pieceColor === "white" ? 1 : -1; // Trắng đi lên, Đen đi xuống

  // Vòng lặp để xét 2 hướng chéo
  for (let i = -1; i <= 1; i += 2) {
    const newFile = String.fromCharCode(file.charCodeAt(0) + i); // vị trí 2 ô chéo mới vd đang ở cột B kiểm tra cột A, C
    const newRank = rank + direction;
    //  Kiểm tra nếu ô mới hợp lệ:
    if (newFile >= "a" && newFile <= "h" && newRank >= 1 && newRank <= 8) {
      const newSquareId = newFile + newRank;
      const newSquare = document.getElementById(newSquareId);
      const squareContent = isSquareOccupied(newSquare);
      // Nếu ô có quân đối phương thì thêm vào nước đi hợp lệ
      if (squareContent !== "blank" && squareContent !== pieceColor) {
        legalSquares.push(newSquareId);
      }
    }
  }
}

// kiểm tra nước đi thẳng của tốt
function checkPawnForwardMoves(startingSquareId, pieceColor) {
  const file = startingSquareId.charAt(0); // Cột, ví dụ: "e"
  const rank = parseInt(startingSquareId.charAt(1)); // Hàng, ví dụ: 2
  const direction = pieceColor === "white" ? 1 : -1;

  let newRank = rank + direction;
  let newSquareId = file + newRank;
  let newSquare = document.getElementById(newSquareId);

  //  Kiểm tra 1 bước phía trước:
  if (newSquare && isSquareOccupied(newSquare) === "blank") {
    // nếu ô phía trc blank ô này vào legalSquares
    legalSquares.push(newSquareId);

    // nếu là nước đầu tiên, kiểm tra thêm bước nhảy 2 ô
    if (
      (pieceColor === "white" && rank === 2) ||
      (pieceColor === "black" && rank === 7)
    ) {
      newRank += direction;
      newSquareId = file + newRank;
      newSquare = document.getElementById(newSquareId);
      if (newSquare && isSquareOccupied(newSquare) === "blank") {
        legalSquares.push(newSquareId);
      }
    }
  }
}

// xác định nước đi hợp lệ
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
  } else if (piece.classList.contains("queen")) {
    getQueenMoves(startingSquareId, pieceColor);
  } else if (piece.classList.contains("king")) {
    getKingMoves(startingSquareId, pieceColor);
  }
}

// kiểm tra nước đi hợp lệ của tốt
function getPawnMoves(startingSquareId, pieceColor) {
  checkPawnDiagonalCaptures(startingSquareId, pieceColor); // check 2 ô chéo
  checkPawnForwardMoves(startingSquareId, pieceColor); // check ô thẳng
}

function getKnightMoves(startingSquareId, pieceColor) {
    // file là chỉ số cột vd là a,b ...
  const file = startingSquareId.charCodeAt(0) - 97; // chuyển cột (a-h) thành chỉ số 0 - 7
  const rank = parseInt(startingSquareId.charAt(1)); // rank của quân cờ

  // Mỗi nước đi của quân mã là một tổ hợp ±2 file ±1 rank hoặc ±1 file ±2 rank, được biểu diễn bằng mảng moves.
  const moves = [
    [-2, 1],
    [-1, 2],
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
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

// kiểm tra nước đi hợp lệ của xe
function getRookMoves(startingSquareId, pieceColor) {
  moveToEighthRank(startingSquareId, pieceColor);
  moveToFirstRank(startingSquareId, pieceColor);
  moveToAFile(startingSquareId, pieceColor);
  moveToHFile(startingSquareId, pieceColor);
}

// kiểm tra đi thẳng lên
function moveToEighthRank(startingSquareId, pieceColor) {

  const file = startingSquareId.charAt(0); // cột đang đứng 
  let rank = parseInt(startingSquareId.charAt(1)); // rank đang đứng

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

// kiểm tra đi xuống
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

// kiểm tra đi sang trái
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


// kiểm tra đi sang phải
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

// kiểm tra đường đi hợp lệ của 
function getBishopMoves(startingSquareId, pieceColor) {
  moveToEighthRankHFile(startingSquareId, pieceColor); // đường chéo hướng lên phải (rank tăng, file tăng)
  moveToEighthRankAFile(startingSquareId, pieceColor); // đường chéo hướng lên trái (rank tăng, file giảm)
  moveToFirstRankHFile(startingSquareId, pieceColor); // đường chéo hướng xuống phải (rank giảm, file tăng)
  moveToFirstRankAFile(startingSquareId, pieceColor); // đường chéo hướng xuống trái (rank giảm, file giảm)
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


// kiểm tra nước đi của hậu
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

// kiểm tra nước đi của vua
function getKingMoves(startingSquareId, pieceColor) {
  const file = startingSquareId.charCodeAt(0) - 97;
  const rank = parseInt(startingSquareId.charAt(1));

  const moves = [
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 0],
    [-1, -1],
    [-1, 1],
    [1, 0],
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
