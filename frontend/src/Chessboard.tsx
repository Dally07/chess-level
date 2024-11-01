import { useState } from 'react';
import { ChessGame } from './chessGame';

const pieceSymbols: { [key: string]: string } = {
    'p': '♙', 'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔',
    'P': '♟', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚',
};

const chessGame = new ChessGame();

const Chessboard = () => {
    const [board, setBoard] = useState(chessGame.getBoard());
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [gameMessage, setGameMessage] = useState<string | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);

    const handleSquareClick = (square: any, squareIndex: number) => {
        if (isGameOver) return; // Empêcher les clics si la partie est terminée

        const file = String.fromCharCode(97 + (squareIndex % 8));
        const rank = (8 - Math.floor(squareIndex / 8)).toString();
        const squareId = file + rank;

        if (selectedSquare) {
            const move = { from: selectedSquare, to: squareId, promotion: 'q' };
            const result = chessGame.makeMove(move);

            if (result) {
                setBoard(chessGame.getBoard());
                checkGameStatus();
            } else {
                alert("Mouvement illégal");
            }
            setSelectedSquare(null);
        } else {
            setSelectedSquare(squareId);
        }
    };

    const checkGameStatus = () => {
        if (chessGame.isCheckMat()) {
            setGameMessage("Échec et mat ! Fin de la partie.");
            setIsGameOver(true);
        } else if (chessGame.isGameOver()) {
            setGameMessage("Partie terminée !");
            setIsGameOver(true);
        } else if (chessGame.isCheck()) {
            setGameMessage("Échec !");
            setIsGameOver(false);
        } else {
            setGameMessage(null);
            setIsGameOver(false);
        }
    };

    const renderSquare = (square: any, index: number) => {
        const piece = square ? square.type : null;
        const pieceSymbol = piece ? pieceSymbols[piece] : null;
        const squareClass = (index + Math.floor(index / 8)) % 2 === 0 ? 'bg-orange-200' : 'bg-orange-300';
        const selectedClass = selectedSquare === String.fromCharCode(97 + (index % 8)) + (8 - Math.floor(index / 8)) ? 'border-4 border-blue-500' : '';
        const pieceClass = piece ? (piece === piece.toLowerCase() ? 'text-red' : 'text-white') : '';

        return (
            <div
                key={index}
                onClick={() => handleSquareClick(square, index)}
                className={`${squareClass} ${selectedClass} w-full h-14 flex justify-center text-3xl items-center border cursor-pointer`}
            >
                <span className={`${pieceClass}`}> {pieceSymbol}</span>
            </div>
        );
    };

    return (
        <div className="relative">
            <div className="grid grid-cols-8">
                {board.flat().map((square, index) => renderSquare(square, index))}
            </div>
            
            {gameMessage && (
                <div className={`absolute inset-0 ${isGameOver ? 'bg-black bg-opacity-50' : ''} flex items-center justify-center pointer-events-none`}>
                    <div className="text-white text-2xl font-bold p-4 bg-gray-800 rounded-md shadow-lg">
                        {gameMessage}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chessboard;