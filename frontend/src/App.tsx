import React from 'react';
import Chessboard from './Chessboard';
import './App.css'

const App: React.FC = () => {

    return (
        <div className='flex flex-col  min-h-screen bg-gray-100'>
            <Chessboard/>
        </div>
    );
};

export default App;
