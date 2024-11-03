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
    user_won = data.get("user_won", False)

    try:
        # Créer le plateau avec `current_fen` pour garantir la cohérence
        board = chess.Board(current_fen)
        print("Current FEN:", current_fen)
        print("Player move:", player_move)

        # Appliquer le mouvement de l'utilisateur
        move = chess.Move.from_uci(player_move)
        if move not in board.legal_moves:
            return jsonify({"error": "Mouvement utilisateur invalide"}), 400
        board.push(move)

        # Mise à jour de `current_fen` après le coup de l'utilisateur
        current_fen = board.fen()
        print("FEN after user move:", current_fen)

        # Vérification de l'état après le mouvement de l'utilisateur
        if board.is_checkmate():
            return jsonify({"message": "Échec et mat ! La partie est terminée.", "fen": current_fen}), 200
        if board.is_stalemate():
            return jsonify({"message": "Match nul ! La partie est terminée.", "fen": current_fen}), 200

        # L'IA joue son mouvement
        ai_move = get_ai_move(board, bot_level)
        board.push(ai_move)

        # Mise à jour de `current_fen` après le coup de l'IA
        current_fen = board.fen()
        print("FEN after AI's move:", current_fen)

        # Vérification de l'état après le mouvement de l'IA
        if board.is_checkmate():
            return jsonify({"message": "L'IA a gagné par échec et mat ! La partie est terminée.", "fen": current_fen}), 200
        if board.is_stalemate():
            return jsonify({"message": "Match nul ! La partie est terminée.", "fen": current_fen}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Augmenter le niveau de l'IA uniquement si l'utilisateur a gagné
    if user_won:
        bot_level = min(bot_level + 1, 8)

    # Renvoie la FEN mise à jour après que l'IA a joué
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