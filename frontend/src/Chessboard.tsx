import { useState, useEffect } from 'react';
import { ChessGame } from './chessGame';
import { Square } from 'chess.js';

const pieceSymbols = {
    'p': '♙', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', // PIECE NOIRE
    'P': '♙', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚' // PIECE BLANCHE
};

const chessGame = new ChessGame();

const Chessboard = () => {
    const [board, setBoard] = useState(chessGame.getBoard());
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [gameMessage, setGameMessage] = useState<string | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [botLevel, setBotLevel] = useState<number>(1);
    

    useEffect(() => {
        startGame();
    }, []);

    const startGame = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/start-game", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                alert("Erreur lors du démarrage de la partie : " + errorMessage);
                return;
            }

            const data = await response.json();

            if (data.fen) {
                chessGame.loadFEN(data.fen);
                console.log("FEN reçu après chargement:", data.fen);
                setBoard(chessGame.getBoard());
                setBotLevel(data.bot_level ?? botLevel);
            } 
            if (data.bot_level !== undefined) setBotLevel(data.bot_level);
            else {
                alert("Erreur : l'API n'a pas renvoyé l'état initial du jeu.");
            }

        } catch (error: any) {
            console.error("Erreur lors de l'appel de l'API start-game :", error);
            alert("Erreur lors du démarrage de la partie : " + (error.message || error));
        }
    };

    const handleSquareClick = async (square: any, squareIndex: number) => {
        if (isGameOver) return;
    
        const file = String.fromCharCode(97 + (squareIndex % 8));
        const rank = (8 - Math.floor(squareIndex / 8)).toString();
        const squareId = file + rank;
    
        if (selectedSquare) {
            // Si une case est déjà sélectionnée, vérifiez si la nouvelle case a une pièce de la même couleur
            const selectedPiece = chessGame.getPieceAtSquare(selectedSquare as Square);
            const newSquarePiece = chessGame.getPieceAtSquare(squareId as Square);
    
            if (newSquarePiece && selectedPiece && newSquarePiece.color === selectedPiece.color) {
                // Si la pièce sélectionnée est de la même couleur, changez simplement la sélection
                setSelectedSquare(squareId);
            } else {
                // Sinon, essayez de faire le mouvement
                const move = { from: selectedSquare, to: squareId, promotion: 'q' };
                const result = chessGame.makeMove(move);
    
                if (result) {
                    setBoard(chessGame.getBoard());
                    const moveUCI = move.from + move.to;
                    const afterMove = chessGame.getFEN();
    
                    console.log("FEN après déplacement de l'utilisateur:", afterMove);
                    const userWon = chessGame.isCheckMat();
    
                    // Assure-toi d'envoyer l'état correct à makeAiMoveRequest
                    await makeAiMoveRequest(moveUCI, afterMove);
                    checkGameStatus(userWon);
                } else {
                    alert("Mouvement illégal");
                }
                setSelectedSquare(null);
            }
        } else {
            // Si aucune case n'est sélectionnée, sélectionnez simplement la case actuelle
            setSelectedSquare(squareId);
        }
    };
    
    
    const makeAiMoveRequest = async (moveUCI: string, userFEN: string) => {
        try {
            console.log("Envoi de la requête avec FEN:", userFEN);
    
            const response = await fetch("http://127.0.0.1:5000/ai-move", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ fen: userFEN, move: moveUCI })
            });
    
            console.log("Statut de la réponse:", response.status);
            const rawResponse = await response.text();
            console.log("Contenu brut de la réponse:", rawResponse);
    
            if (!response.ok) {
                alert("Erreur du serveur : " + response.statusText);
                console.error("Erreur du serveur :", response.statusText);
                return;
            }
    
            const data = JSON.parse(rawResponse);
            if (data.error) {
                console.error("Erreur de l'API:", data.error);
                alert(data.error);
                return;
            }
    
            // Met à jour le FEN après la réponse de l'API
            if (data.fen) {
                chessGame.loadFEN(data.fen);
                setBoard(chessGame.getBoard());
                console.log("État du jeu mis à jour avec le FEN de l'IA:", data.fen);
            } else {
                console.warn("Aucun FEN reçu dans la réponse de l'API");
            }
    
            if (data.bot_level !== undefined) {
                setBotLevel(data.bot_level);
            }
        } catch (error: any) {
            console.error("Erreur lors de l'appel de l'API ai-move :", error);
            alert("Erreur lors de l'appel de l'API : " + (error.message || error));
        }
    };
2    

    const checkGameStatus = (userWon: boolean) => {
        if (userWon) {
            setGameMessage("Vous avez gagné ! L'IA devient plus forte.");
            setIsGameOver(true);
        } else if (chessGame.isCheckMat()) {
            setGameMessage("Échec et mat ! Fin de la partie.");
            setIsGameOver(true);
        } else if (chessGame.isCheck()) {
            setGameMessage("Échec ! Protégez votre roi.");
            setIsGameOver(false);
        } else if (chessGame.isGameOver()) {
            setGameMessage("Partie terminée !");
            setIsGameOver(true);
        } else {
            setGameMessage(null);
            setIsGameOver(false);
        }
    };

    const renderSquare = (square: any, index: number) => {
        
        const piece = square ? square.type : null;
        const pieceColor = square ? square.color : null;

        const pieceSymbol = piece && pieceColor === 'b'
            ? pieceSymbols[piece as keyof typeof pieceSymbols]
            : pieceSymbols[piece?.toUpperCase() as keyof typeof pieceSymbols];
            

        const squareClass = (index + Math.floor(index / 8)) % 2 === 0 ? 'bg-amber-900' : 'bg-orange-400';
        const selectedClass = selectedSquare === String.fromCharCode(97 + (index % 8)) + (8 - Math.floor(index / 8)) ? 'border-4 border-blue-500' : '';
        const pieceClass = pieceColor === 'w' ? 'text-white' : 'text-black';

       // console.log(`square: ${index}, piece: ${piece}, color: ${pieceColor}`)

        return (
            <div
                key={index}
                onClick={() => handleSquareClick(square, index)}
                className={`${squareClass} ${selectedClass} w-full h-[50px] aspect-square flex justify-center text-3xl items-center border cursor-pointer `}
            >
                <span className={`${pieceClass}`}>{pieceSymbol}</span>
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col">
            <header className=" w-full flex justify-between bg-black items-center p-1 text-white shadow-lg z-10 border-b-2">
            
                <div className='flex'>AI level</div>
                <div className='flex text-xs'>
                    <span>Bot lvl : {botLevel}</span>    
                
            </div>
            </header>
            
            <div className="grid grid-cols-8">
                {board.flat().map((square, index) => renderSquare(square, index))}
            </div>
            {gameMessage && (
                <div className={`absolute inset-0 ${isGameOver ? 'bg-black bg-opacity-50' : ''} flex items-center justify-center pointer-events-none`}>
                    <div className="text-white text-2xl font-bold p-4 rounded-md shadow-lg">
                        {gameMessage}
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default Chessboard;