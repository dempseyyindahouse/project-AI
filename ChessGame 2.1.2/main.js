import { fillBoardSquaresArray, setupBoardSquares } from './board.js';
import { setupPieces } from './pieces.js';

let isWhiteTurn = true; // kiểm tra lượt bên nào đi

fillBoardSquaresArray();
setupBoardSquares();
setupPieces();

export { isWhiteTurn };