let boardSquaresArray = []; // thông tin các ô còw
let isWhiteTurn = true; // kiểm tra lượt bên nào đi
let whiteKingSquare = "e1"; // squareId vua trắng đang đứng
let blackKingSquare = "e8"; // squareId vua đen đang đứng
const boardSquares = document.getElementsByClassName("square");
const pieces = document.getElementsByClassName("piece");
const piecesImages = document.getElementsByTagName("img");

// tạo mảng thông tin (squareID, màu quân cờ,loại quân cờ, id quân cờ) vào boardSquaresArray
function fillBoardSquaresArray() {
  const boardSquares = document.getElementsByClassName("square");
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

// Tạo bản sao mới của mảng
function deepCopyArray(array) {
  let arrayCopy = array.map((element) => {
    return { ...element };
  });
  return arrayCopy;
}
// 2 hàm bắt đầu built id , sự kiện cho các ô cờ, quần cờ
setupBoardSquares();
setupPieces();

fillBoardSquaresArray();

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
      boardSquaresArray
    );
    let legalSquaresJson = JSON.stringify(legalSquares); // // Chuyển danh sách các ô hợp lệ thành chuỗi JSON
    ev.dataTransfer.setData("application/json", legalSquaresJson); // Lưu chuỗi JSON vào dataTransfer với kiểu "application/json" để truyền thông tin các ô hợp lệ đi cùng trong sự kiện kéo
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

  if (legalSquaresJson.length == 0) return;
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

  legalSquares = isMoveValidAgainstCheck(
    legalSquares,
    startingSquareId,
    pieceColor,
    pieceType
  ); // Kiểm tra lại danh sách ô hợp lệ, loại bỏ những nước đi khiến vua bị chiếu (check)

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

  // Lấy thông tin quân cờ đang đứng trên ô đích (nếu có)
  let squareContent = getPieceAtSquare(destinationSquareId, boardSquaresArray);

  if (
    squareContent.pieceColor == "blank" && // Ô đích đang trống
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

    checkForCheckMate();
    // Kiểm tra chiếu tướng hay chiếu hết

    return;
  }
}

// kiểm tra nước đi hợp lệ
function getPossibleMoves(startingSquareId, piece, boardSquaresArray) {
  const pieceColor = piece.pieceColor;
  const pieceType = piece.pieceType;
  let legalSquares = [];
  if (pieceType == "rook") {
    legalSquares = getRookMoves(
      startingSquareId,
      pieceColor,
      boardSquaresArray
    );
    return legalSquares;
  }
  if (pieceType == "bishop") {
    legalSquares = getBishopMoves(
      startingSquareId,
      pieceColor,
      boardSquaresArray
    );
    return legalSquares;
  }
  if (pieceType == "queen") {
    legalSquares = getQueenMoves(
      startingSquareId,
      pieceColor,
      boardSquaresArray
    );
    return legalSquares;
  }
  if (pieceType == "knight") {
    legalSquares = getKnightMoves(
      startingSquareId,
      pieceColor,
      boardSquaresArray
    );
    return legalSquares;
  }

  if (pieceType == "pawn") {
    legalSquares = getPawnMoves(
      startingSquareId,
      pieceColor,
      boardSquaresArray
    );
    return legalSquares;
  }
  if (pieceType == "king") {
    legalSquares = getKingMoves(
      startingSquareId,
      pieceColor,
      boardSquaresArray
    );
    return legalSquares;
  }
}

// --------check nước đi con tốt----------
function getPawnMoves(startingSquareId, pieceColor, boardSquaresArray) {
  let diogonalSquares = checkPawnDiagonalCaptures(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );
  let forwardSquares = checkPawnForwardMoves(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );
  let legalSquares = [...diogonalSquares, ...forwardSquares];
  return legalSquares;
}

// check nước ăn con tốt 2 ô chéo
function checkPawnDiagonalCaptures(
  startingSquareId,
  pieceColor,
  boardSquaresArray
) {
  const file = startingSquareId.charAt(0);
  const rank = startingSquareId.charAt(1);
  const rankNumber = parseInt(rank);
  let legalSquares = [];
  let currentFile = file;
  let currentRank = rankNumber;
  let currentSquareId = currentFile + currentRank;

  const direction = pieceColor == "white" ? 1 : -1;
  if (!(rank == 8 && direction == 1) && !(rank == 1 && direction == -1))
    currentRank += direction;
  for (let i = -1; i <= 1; i += 2) {
    currentFile = String.fromCharCode(file.charCodeAt(0) + i);
    if (
      currentFile >= "a" &&
      currentFile <= "h" &&
      currentRank <= 8 &&
      currentRank >= 1
    ) {
      currentSquareId = currentFile + currentRank;
      let currentSquare = boardSquaresArray.find(
        (element) => element.squareId === currentSquareId
      );
      let squareContent = currentSquare.pieceColor;
      if (squareContent != "blank" && squareContent != pieceColor)
        legalSquares.push(currentSquareId);
    }
  }
  return legalSquares;
}
// check nước đi thẳng
function checkPawnForwardMoves(
  startingSquareId,
  pieceColor,
  boardSquaresArray
) {
  const file = startingSquareId.charAt(0);
  const rank = startingSquareId.charAt(1);
  const rankNumber = parseInt(rank);
  let legalSquares = [];

  let currentFile = file;
  let currentRank = rankNumber;
  let currentSquareId = currentFile + currentRank;

  const direction = pieceColor == "white" ? 1 : -1;
  currentRank += direction;
  currentSquareId = currentFile + currentRank;
  let currentSquare = boardSquaresArray.find(
    (element) => element.squareId === currentSquareId
  );
  let squareContent = currentSquare.pieceColor;
  if (squareContent != "blank") return legalSquares;
  legalSquares.push(currentSquareId);
  if (
    !(
      (rankNumber == 2 && pieceColor == "white") ||
      (rankNumber == 7 && pieceColor == "black")
    )
  )
    return legalSquares;
  currentRank += direction;
  currentSquareId = currentFile + currentRank;
  currentSquare = boardSquaresArray.find(
    (element) => element.squareId === currentSquareId
  );
  squareContent = currentSquare.pieceColor;
  if (squareContent != "blank")
    if (squareContent != "blank") return legalSquares;
  legalSquares.push(currentSquareId);
  return legalSquares;
}
// -------- end check nước đi con tốt----------

// -------- check nước đi của mã ---------------
function getKnightMoves(startingSquareId, pieceColor, boardSquaresArray) {
  const file = startingSquareId.charCodeAt(0) - 97;
  const rank = startingSquareId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalSquares = [];

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
  moves.forEach((move) => {
    currentFile = file + move[0];
    currentRank = rankNumber + move[1];
    if (
      currentFile >= 0 &&
      currentFile <= 7 &&
      currentRank > 0 &&
      currentRank <= 8
    ) {
      let currentSquareId = String.fromCharCode(currentFile + 97) + currentRank;
      let currentSquare = boardSquaresArray.find(
        (element) => element.squareId === currentSquareId
      );
      let squareContent = currentSquare.pieceColor;
      if (squareContent != "blank" && squareContent == pieceColor)
        return legalSquares;
      legalSquares.push(String.fromCharCode(currentFile + 97) + currentRank);
    }
  });
  return legalSquares;
}
// -------- hết check nước đi của Mã --------------

// -------- check nước đi của Xe -------------
function getRookMoves(startingSquareId, pieceColor, boardSquaresArray) {
  let moveToEighthRankSquares = moveToEighthRank(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );
  let moveToFirstRankSquares = moveToFirstRank(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );
  let moveToAFileSquares = moveToAFile(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );
  let moveToHFileSquares = moveToHFile(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );
  let legalSquares = [
    ...moveToEighthRankSquares,
    ...moveToFirstRankSquares,
    ...moveToAFileSquares,
    ...moveToHFileSquares,
  ];
  return legalSquares;
}
// -------- hết check nước đi của Xe -------------

// ------- check nước đi của Tượng  ----------
function getBishopMoves(startingSquareId, pieceColor, boardSquaresArray) {
  // đường chéo hướng lên phải (rank tăng, file tăng)
  let moveToEighthRankHFileSquares = moveToEighthRankHFile(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );

  // đường chéo hướng lên trái (rank tăng, file giảm)
  let moveToEighthRankAFileSquares = moveToEighthRankAFile(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );

  // đường chéo hướng xuống phải (rank giảm, file tăng)
  let moveToFirstRankHFileSquares = moveToFirstRankHFile(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );

  // đường chéo hướng xuống trái (rank giảm, file giảm)
  let moveToFirstRankAFileSquares = moveToFirstRankAFile(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );

  // tổng hợp nước đi hợp lệ của tượng
  let legalSquares = [
    ...moveToEighthRankHFileSquares,
    ...moveToEighthRankAFileSquares,
    ...moveToFirstRankHFileSquares,
    ...moveToFirstRankAFileSquares,
  ];
  return legalSquares;
}
//  ------- end check nước đi của Tượng  ----------

// ------- check nước đi của hậu-----------
function getQueenMoves(startingSquareId, pieceColor, boardSquaresArray) {
  let bishopMoves = getBishopMoves(
    startingSquareId,
    pieceColor,
    boardSquaresArray
  );
  let rookMoves = getRookMoves(startingSquareId, pieceColor, boardSquaresArray);
  let legalSquares = [...bishopMoves, ...rookMoves];
  return legalSquares;
}
//  ------- end check nước đi của hậu-----------

// ------- check nước đi của vua ------------
function getKingMoves(startingSquareId, pieceColor, boardSquaresArray) {
  const file = startingSquareId.charCodeAt(0) - 97; // get the second character of the string
  const rank = startingSquareId.charAt(1); // get the second character of the string
  const rankNumber = parseInt(rank); // convert the second character to a number
  let currentFile = file;
  let currentRank = rankNumber;
  let legalSquares = [];
  const moves = [
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 0],
    [-1, 1],
    [-1, -1],
    [1, 0],
  ];

  moves.forEach((move) => {
    let currentFile = file + move[0];
    let currentRank = rankNumber + move[1];

    if (
      currentFile >= 0 &&
      currentFile <= 7 &&
      currentRank > 0 &&
      currentRank <= 8
    ) {
      let currentSquareId = String.fromCharCode(currentFile + 97) + currentRank;
      let currentSquare = boardSquaresArray.find(
        (element) => element.squareId === currentSquareId
      );
      let squareContent = currentSquare.pieceColor;
      if (squareContent != "blank" && squareContent == pieceColor) {
        return legalSquares;
      }
      legalSquares.push(String.fromCharCode(currentFile + 97) + currentRank);
    }
  });
  return legalSquares;
}
//  ------- hết check nước đi của vua ------------

// kiểm tra đi thẳng lên
function moveToEighthRank(startingSquareId, pieceColor, boardSquaresArray) {
  const file = startingSquareId.charAt(0);
  const rank = startingSquareId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentRank = rankNumber;
  let legalSquares = [];
  while (currentRank != 8) {
    currentRank++;
    let currentSquareId = file + currentRank;
    let currentSquare = boardSquaresArray.find(
      (element) => element.squareId === currentSquareId
    );
    let squareContent = currentSquare.pieceColor;
    if (squareContent != "blank" && squareContent == pieceColor)
      return legalSquares;
    legalSquares.push(currentSquareId);
    if (squareContent != "blank" && squareContent != pieceColor)
      return legalSquares;
  }
  return legalSquares;
}

// kiểm tra đi thẳng xuống
function moveToFirstRank(startingSquareId, pieceColor, boardSquaresArray) {
  const file = startingSquareId.charAt(0);
  const rank = startingSquareId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentRank = rankNumber;
  let legalSquares = [];
  while (currentRank != 1) {
    currentRank--;
    let currentSquareId = file + currentRank;
    let currentSquare = boardSquaresArray.find(
      (element) => element.squareId === currentSquareId
    );
    let squareContent = currentSquare.pieceColor;
    if (squareContent != "blank" && squareContent == pieceColor)
      return legalSquares;
    legalSquares.push(currentSquareId);
    if (squareContent != "blank" && squareContent != pieceColor)
      return legalSquares;
  }
  return legalSquares;
}

// kiểm tra đi sang trái
function moveToAFile(startingSquareId, pieceColor, boardSquaresArray) {
  const file = startingSquareId.charAt(0);
  const rank = startingSquareId.charAt(1);
  let currentFile = file;
  let legalSquares = [];

  while (currentFile != "a") {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) - 1
    );
    let currentSquareId = currentFile + rank;
    let currentSquare = boardSquaresArray.find(
      (element) => element.squareId === currentSquareId
    );
    let squareContent = currentSquare.pieceColor;
    if (squareContent != "blank" && squareContent == pieceColor)
      return legalSquares;
    legalSquares.push(currentSquareId);
    if (squareContent != "blank" && squareContent != pieceColor)
      return legalSquares;
  }
  return legalSquares;
}

// kiểm tra đi sang phải
function moveToHFile(startingSquareId, pieceColor, boardSquaresArray) {
  const file = startingSquareId.charAt(0);
  const rank = startingSquareId.charAt(1);
  let currentFile = file;
  let legalSquares = [];
  while (currentFile != "h") {
    //Tăng chữ cái cột (e → f, f → g,...)
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) + 1
    );
    let currentSquareId = currentFile + rank;
    let currentSquare = boardSquaresArray.find(
      (element) => element.squareId === currentSquareId
    );
    let squareContent = currentSquare.pieceColor;
    if (squareContent != "blank" && squareContent == pieceColor)
      return legalSquares;
    legalSquares.push(currentSquareId);
    if (squareContent != "blank" && squareContent != pieceColor)
      return legalSquares;
  }
  return legalSquares;
}

// -------- kiểm tra đi chéo --------------
function moveToEighthRankAFile(
  startingSquareId,
  pieceColor,
  boardSquaresArray
) {
  const file = startingSquareId.charAt(0);
  const rank = startingSquareId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalSquares = [];
  while (!(currentFile == "a" || currentRank == 8)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) - 1
    );
    currentRank++;
    let currentSquareId = currentFile + currentRank;
    let currentSquare = boardSquaresArray.find(
      (element) => element.squareId === currentSquareId
    );
    let squareContent = currentSquare.pieceColor;
    if (squareContent != "blank" && squareContent == pieceColor)
      return legalSquares;
    legalSquares.push(currentSquareId);
    if (squareContent != "blank" && squareContent != pieceColor)
      return legalSquares;
  }
  return legalSquares;
}
function moveToEighthRankHFile(
  startingSquareId,
  pieceColor,
  boardSquaresArray
) {
  const file = startingSquareId.charAt(0);
  const rank = startingSquareId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalSquares = [];
  while (!(currentFile == "h" || currentRank == 8)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) + 1
    );
    currentRank++;
    let currentSquareId = currentFile + currentRank;
    let currentSquare = boardSquaresArray.find(
      (element) => element.squareId === currentSquareId
    );
    let squareContent = currentSquare.pieceColor;
    if (squareContent != "blank" && squareContent == pieceColor)
      return legalSquares;
    legalSquares.push(currentSquareId);
    if (squareContent != "blank" && squareContent != pieceColor)
      return legalSquares;
  }
  return legalSquares;
}
function moveToFirstRankAFile(startingSquareId, pieceColor, boardSquaresArray) {
  const file = startingSquareId.charAt(0);
  const rank = startingSquareId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalSquares = [];
  while (!(currentFile == "a" || currentRank == 1)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) - 1
    );
    currentRank--;
    let currentSquareId = currentFile + currentRank;
    let currentSquare = boardSquaresArray.find(
      (element) => element.squareId === currentSquareId
    );
    let squareContent = currentSquare.pieceColor;
    if (squareContent != "blank" && squareContent == pieceColor)
      return legalSquares;
    legalSquares.push(currentSquareId);
    if (squareContent != "blank" && squareContent != pieceColor)
      return legalSquares;
  }
  return legalSquares;
}
function moveToFirstRankHFile(startingSquareId, pieceColor, boardSquaresArray) {
  const file = startingSquareId.charAt(0);
  const rank = startingSquareId.charAt(1);
  const rankNumber = parseInt(rank);
  let currentFile = file;
  let currentRank = rankNumber;
  let legalSquares = [];
  while (!(currentFile == "h" || currentRank == 1)) {
    currentFile = String.fromCharCode(
      currentFile.charCodeAt(currentFile.length - 1) + 1
    );
    currentRank--;
    let currentSquareId = currentFile + currentRank;
    let currentSquare = boardSquaresArray.find(
      (element) => element.squareId === currentSquareId
    );
    let squareContent = currentSquare.pieceColor;
    if (squareContent != "blank" && squareContent == pieceColor)
      return legalSquares;
    legalSquares.push(currentSquareId);
    if (squareContent != "blank" && squareContent != pieceColor)
      return legalSquares;
  }
  return legalSquares;
}
// -------- hết kiểm tra đi chéo --------------

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

// Kiểm tra xem vua tại ô squareId có đang bị chiếu (check) bởi bất kỳ quân cờ đối phương nào không
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

// Hàm lọc nước đi hợp lệ, loại bỏ những nước đi khiến vua bị chiếu
function isMoveValidAgainstCheck(
  legalSquares, // Mảng các ô có thể đi hợp lệ ban đầu
  startingSquareId, // Ô xuất phát của quân cờ
  pieceColor, // Màu quân cờ (white hoặc black)
  pieceType // Loại quân cờ (king, rook, knight, ...)
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

//  kiểm tra xem có chiếu hết (checkmate) hay không
function checkForCheckMate() {
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
  let possibleMoves = getAllPossibleMoves(boardSquaresArrayCopy, pieceColor);

  // Nếu còn ít nhất một nước đi để thoát => không phải chiếu hết => thoát hàm
  if (possibleMoves.length > 0) return;

  // Nếu đến đây thì vua đang bị chiếu và không còn nước đi nào => chiếu hết
  let message = "";
  isWhiteTurn ? (message = "Black Wins!") : (message = "White Wins!");

  // Hiển thị thông báo chiến thắng
  showAlert(message);
}

// Hàm lấy tất cả các nước đi hợp lệ cho toàn bộ quân cờ của một bên
function getAllPossibleMoves(
  squaresArray, // Mảng đại diện trạng thái bàn cờ hiện tại (gồm các ô và quân cờ tương ứng)
  color // Màu quân cờ cần xét ("white" hoặc "black")
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
          pieceType
        );

        // Trả về danh sách nước đi hợp lệ cuối cùng cho quân cờ này
        return legalSquares;
      })
  );
}

function showAlert(message) {
  const alert = document.getElementById("alert");
  alert.innerHTML = message;
  alert.style.display = "block";

  setTimeout(function () {
    alert.style.display = "none";
  }, 3000);
}
