import React, { useState } from 'react';
import { ChessGame } from './chessGame';

const pieceSymbols: { [key: string]: string } = {
    'p': '♙', 'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔',  // Pièces blanches
    'P': '♟', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚'   // Pièces noires
};

const Chessboard: React.FC = () => {
    const game = new ChessGame();
    const [board] = useState(game.getBoard());

    const renderBoard = () => {
        return board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
                {row.map((square, colIndex) => (
                    <div key={colIndex} className="w-16 h-16 flex items-center justify-center text-red-500 border">
                        {square ? pieceSymbols[square.color === 'w' ? square.type.toUpperCase() : square.type] : ''}
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <div className="chessboard">
            {renderBoard()}
        </div>
    );
};

export default Chessboard;
