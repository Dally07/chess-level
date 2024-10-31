from flask import Flask, jsonify, request
import chess
import chess.engine

app = Flask(__name__)

engine = chess.SimpleEngine.popen_uci()

@app.route('/')
def index():
    return "Hello, Flask!"

if __name__ == '__main__':
    app.run(debug=True)
