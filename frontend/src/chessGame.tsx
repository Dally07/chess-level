import { Chess } from 'chess.js';

export class ChessGame {
    private chess: Chess;

    constructor() {
        this.chess = new Chess();
    }

    // Méthodes pour gérer le jeu
    makeMove(move: {from: string, to: string, promotion?: string}) {
        const result = this.chess.move(move);
        return result;
    }

    getBoard() {
        return this.chess.board();
    }

    isGameOver() {
        return this.chess.isGameOver();
    }

    isCheck() {
        return this.chess.inCheck();
    }

    isCheckMat() {
        return this.chess.isCheckmate();
    }

    // Ajoute d'autres méthodes selon les besoins
}
