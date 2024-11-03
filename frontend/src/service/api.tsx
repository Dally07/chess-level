import axios from "axios";

const API_URL = "http://127.0.0.1:5000"; // Assurez-vous que c'est l'URL correcte

export const startGame = async () => {
    const response = await axios.get(`${API_URL}/start-game`);
    return response.data;
};

export const aiMove = async (fen: string, move: string, userWon: boolean = false) => {
    const response = await axios.post(`${API_URL}/ai-move`, { fen, move, user_won: userWon });
    return response.data;
};

export const resetLevel = async () => {
    const response = await axios.post(`${API_URL}/reset-level`);
    return response.data;
};
