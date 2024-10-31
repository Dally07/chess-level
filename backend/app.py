from flask import Flask, jsonify, request
import chess
import chess.engine

app = Flask(__name__)

# Initialisation de l'engine (IA) Stockfish et niveau de difficulté
engine = chess.engine.SimpleEngine.popen_uci("C:\Program Files\Stockfish\stockfish\stockfish-windows-x86-64-avx2.exe")
ai_level = 1  # Niveau initial de l'IA

@app.route("/ai-move", methods=["POST"])
def ai_move():
    global ai_level
    data = request.json
    fen = data.get("fen")  # Position actuelle en FEN
    user_won = data.get("user_won", False)  # Si l'utilisateur a gagné la partie

    # Augmenter le niveau si l'utilisateur a gagné
    if user_won:
        ai_level += 1

    # Création d'un board avec la position actuelle
    board = chess.Board(fen)
    depth = 2 + ai_level  # Calcul de la profondeur d'analyse

    # Calcul du meilleur coup de l'IA
    result = engine.play(board, chess.engine.Limit(depth=depth))
    move = result.move

    return jsonify({
        "from": move.uci()[:2],
        "to": move.uci()[2:],
        "ai_level": ai_level
    })

@app.route("/reset-level", methods=["POST"])
def reset_level():
    global ai_level
    ai_level = 1  # Réinitialiser le niveau de l'IA
    return jsonify({"message": "AI level reset to 1"})

if __name__ == "__main__":
    app.run(debug=True)