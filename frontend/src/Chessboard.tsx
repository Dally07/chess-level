import React from 'react';
import { ChessGame } from './chessGame';

const Chessboard: React.FC = () => {
    const game = new ChessGame();

    const renderBoard = () => {
        const board = game.getBoard();
        return board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
                {row.map((piece, colIndex) => (
                    <div key={colIndex} className="w-16 h-16 flex items-center justify-center">
                        {piece ? piece.type : null}
                    </div>
                ))}
            </div>
        ));
    };

    return <div className="chessboard">{renderBoard()}</div>;
};

export default Chessboard;
