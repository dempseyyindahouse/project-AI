let legalSquares=[]
let isWhiteTurn=true;
const boardSquare=document.getElementsByClassName("square");
const pieces=document.getElementsByClassName("piece");
const piecesImages=document.getElementsByTagName("img");
 setupBoardSquares();
  setupPieces();
function setupBoardSquares(){
    for (let i = 0; i < boardSquare.length; i++) {
        boardSquare[i].addEventListener("dragover",allowDrop);
        boardSquare[i].addEventListener("drop",drop);
        let row=8-Math.floor(i/8);
        let column=String.fromCharCode(97+(i%8));
       let square = boardSquare[i];
        square.id=column+row;
    }
}
function setupPieces(){
    for(let i=0;i<pieces.length;i++){
    pieces[i].addEventListener("dragstart",drag);
    pieces[i].setAttribute("draggable",true);
    pieces[i].id=pieces[i].className.split(" ")[1]+pieces[i].parentElement.id;
    }
    for(let i=0;i<piecesImages.length;i++){
        piecesImages[i].setAttribute("draggable",false);
    }
}
function allowDrop(ev){
    ev.preventDefault();
}
function drag(ev){
    const piece=ev.target;
    const pieceColor=piece.getAttribute("color");
    if((isWhiteTurn && pieceColor=="White")||(isWhiteTurn && pieceColor=="black"));
    ev.dataTransfer.setData("text",piece.id);
}
function drop(ev){
    ev.preventDefault();
    let data=ev.dataTransfer.getData("text");
    const piece=document.getElementById(data);
    const destinationSquare=ev.currentTarget;
    let destinationSquareId=destinationSquare.id;
    destinationSquare.appendChild(piece);
    isWhiteTurn=!isWhiteTurn;
}