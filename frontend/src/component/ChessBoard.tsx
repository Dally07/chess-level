import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { startGame, aiMove, resetLevel } from "../service/api";

const ChessBoard: React.FC = () => {
    const [chess] = useState(new Chess());
    const [fen, setFen] = useState<string>(chess.fen());
    const [botLevel, setBotLevel] = useState<number>(1);
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

    useEffect(() => {
        const initializeGame = async () => {
            const data = await startGame();
            chess.load(data.fen);
            setFen(data.fen);
            setBotLevel(1);
        };
        initializeGame();
    }, [chess]);

    const handleSquareClick = async (square: string) => {
        if (selectedSquare) {
            const move = `${selectedSquare}${square}`;
            if (chess.move({ from: selectedSquare, to: square, promotion: "q" })) {
                setSelectedSquare(null);
                await playerMove(move);
            } else {
                setSelectedSquare(square);
            }
        } else {
            setSelectedSquare(square);
        }
    };

    const playerMove = async (move: string) => {
        const data = await aiMove(chess.fen(), move);
        if (data.error) {
            alert(data.error);
            return;
        }
        if (data.message) {
            alert(data.message);
        }
        if (data.ai_move) {
            chess.move(data.ai_move.from + data.ai_move.to);
        }
        setFen(chess.fen());
        setBotLevel(data.bot_level);
    };

    const resetAiLevel = async () => {
        await resetLevel();
        setBotLevel(1);
        alert("Niveau de l'IA réinitialisé !");
    };

    return (
        <div className="relative"> 
            <div className="grid grid-cols-8">
                {Array.from(chess.board()).map((row, rowIndex) =>
                    <div key={rowIndex} className="grid grid-cols-8">
                        {row.map((square, colIndex) => {
                            const squareName = `${"abcdefgh"[colIndex]}${8 - rowIndex}`;
                            const isDarkSquare = (rowIndex + colIndex) % 2 === 1;
                            return (
                                <div
                                    key={squareName}
                                    className={`w-16 h-16 aspect-square flex items-center justify-center cursor-pointer 
                                                ${isDarkSquare ? "bg-gray-600" : "bg-gray-200"} 
                                                ${selectedSquare === squareName ? "bg-yellow-300" : ""}`}
                                    onClick={() => handleSquareClick(squareName)}
                                >
                                    {square ? square.type.toUpperCase() : ""}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="text-lg mb-2">Niveau de l'IA : {botLevel}</div>
            <button
                onClick={resetAiLevel}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
                Réinitialiser le niveau de l'IA
            </button>
        </div>
    );
};

export default ChessBoard;
