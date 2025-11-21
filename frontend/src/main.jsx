import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    return React.createElement('div', null,
        React.createElement('h1', null, 'QR Upload App'),
        React.createElement('p', null, 'Test réussi!')
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(React.StrictMode, null,
        React.createElement(App)
    )
);