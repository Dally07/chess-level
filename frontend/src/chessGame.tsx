import { Chess } from 'chess.js';

export class ChessGame {
    private chess: Chess;

    constructor() {
        this.chess = new Chess();
    }

    // Méthodes pour gérer le jeu
    makeMove(move: string) {
        const result = this.chess.move(move);
        return result;
    }

    getBoard() {
        return this.chess.board();
    }

    isGameOver() {
        return this.chess.isGameOver();
    }

    // Ajoute d'autres méthodes selon les besoins
}