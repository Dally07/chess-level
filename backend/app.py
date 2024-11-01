from flask import Flask, jsonify, request
from flask_cors import CORS
import chess
import chess.engine

app = Flask(__name__)

CORS(app)

# Initialisation de l'engine (IA) Stockfish et niveau de difficulté
engine = chess.engine.SimpleEngine.popen_uci("./engine/stockfish-windows-x86-64-sse41-popcnt.exe")
ai_level = 1  # Niveau initial de l'IA

@app.route("/ai-move", methods=["POST"])
def ai_move():
    global ai_level
    data = request.json
    fen = data.get("fen")  # Position actuelle en FEN
   # user_won = data.get("user_won", False)  # Si l'utilisateur a gagné la partie
    player_move = data.get("move")

    # Augmenter le niveau si l'utilisateur a gagné
    #if user_won:
     #   ai_level += 1

    # Création d'un board avec la position actuelle
    board = chess.Board(fen)
    board.push(chess.Move.from_uci(player_move))

    depth = 2 + ai_level  # Calcul de la profondeur d'analyse
    ai_move = engine.play(board, chess.engine.Limit(depth=depth)).move 
    board.push(ai_move)
    

    return jsonify({
        "fen": board.fen(),
        "ai_move": {"from": ai_move.uci()[:2],
        "to": ai_move.uci()[2:]},
        "ai_level": ai_level
    })

@app.route("/reset-level", methods=["POST"])
def reset_level():
    global ai_level
    ai_level = 1  # Réinitialiser le niveau de l'IA
    return jsonify({"message": "AI level reset to 1"})

if __name__ == "__main__":
    app.run(debug=True)