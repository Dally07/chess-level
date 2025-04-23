from flask import Flask, jsonify, request
from flask_cors import CORS
import chess
import chess.engine

app = Flask(__name__)
CORS(app)

engine = chess.engine.SimpleEngine.popen_uci("C:/stockfish/stockfish-windows-x86-64-sse41-popcnt.exe")
bot_level = 1  # Niveau initial de l'IA
current_fen = chess.STARTING_FEN  # Stocker la FEN mise à jour après chaque coup

def get_ai_move(board, level):
    result = engine.play(board, chess.engine.Limit(depth=level))
    print("AI move :", result.move)
    return result.move

@app.route("/start-game", methods=["GET"])
def start_game():
    global current_fen
    current_fen = chess.STARTING_FEN  # Réinitialiser à la FEN de départ au début d'une nouvelle partie
    return jsonify({"fen": current_fen, "bot_level": bot_level})

@app.route("/ai-move", methods=["POST"])
def ai_move():
    global current_fen, bot_level

    data = request.get_json()
    player_move = data.get("move")

    try:
        # Création du plateau et application du coup de l'utilisateur
        board = chess.Board(current_fen)
        move = chess.Move.from_uci(player_move)
        if move not in board.legal_moves:
            return jsonify({"error": "Mouvement utilisateur invalide"}), 400
        board.push(move)
        current_fen = board.fen()

        # Vérifier si le joueur a gagné
        if board.is_checkmate():
            bot_level = min(bot_level + 1, 8)  # Augmenter le niveau du bot
            return jsonify({
                "message": "Échec et mat ! Vous avez gagné !",
                "winner": "user",
                "next_game_bot_level": bot_level,
                "fen": current_fen
            }), 200

        if board.is_stalemate():
            return jsonify({
                "message": "Match nul !",
                "winner": "draw",
                "next_game_bot_level": bot_level,
                "fen": current_fen
            }), 200

        # Coup de l'IA
        ai_move = get_ai_move(board, bot_level)
        board.push(ai_move)
        current_fen = board.fen()

        # Vérifier si l'IA a gagné
        if board.is_checkmate():
            bot_level = max(bot_level - 1, 1)  # Baisser le niveau du bot
            return jsonify({
                "message": "L'IA a gagné par échec et mat.",
                "winner": "ai",
                "next_game_bot_level": bot_level,
                "fen": current_fen
            }), 200

        if board.is_stalemate():
            return jsonify({
                "message": "Match nul !",
                "winner": "draw",
                "next_game_bot_level": bot_level,
                "fen": current_fen
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "fen": current_fen,
        "ai_move": {"from": ai_move.uci()[:2], "to": ai_move.uci()[2:]},
        "bot_level": bot_level
    })


@app.route("/reset-level", methods=["POST"])
def reset_level():
    global bot_level
    bot_level = 1  # Réinitialiser le niveau de l'IA
    return jsonify({"message": "AI level reset to 1"})

import atexit
@atexit.register
def cleanup():
    engine.quit()

if __name__ == "__main__":
    app.run(debug=True)