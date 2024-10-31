import React, { useEffect, useState } from 'react';
import api from './api';

const App: React.FC = () => {
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        api.get('/')
            .then(response => setMessage(response.data))
            .catch(error => console.error("Erreur d'API", error));
    }, []);

    return (
        <div>
            <h1>Jeu d'Échecs</h1>
            <p>Message du backend : {message}</p>
        </div>
    );
};

export default App;
