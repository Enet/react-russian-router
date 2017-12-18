import React from 'react';
import ReactDOM from 'react-dom';
import AppClient from './AppClient.jsx';

import './index.css';

const appNode = document.getElementById('app');
window.initApp = function (appData) {
    ReactDOM.hydrate(<AppClient {...appData} />, appNode);
}
