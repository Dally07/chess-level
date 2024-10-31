import React from 'react';
import Chessboard from './Chessboard';

const App: React.FC = () => {

    return (
        <div>
          <h1 className='text-xs'>chess</h1>
            <Chessboard />
        </div>
    );
};

export default App;
