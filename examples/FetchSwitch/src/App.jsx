import React from 'react';
import {
    ReactRussianRouter,
    FetchSwitch,
    RussianMatchLink
} from 'react-russian-router';

import routes from './routes.jsx';
import ErrorPage from './ErrorPage.jsx';
import Spinner from './Spinner.jsx';

import './App.css';

const options = {
    scrollRestoration: 'auto'
};

function fakeApiRequest (entryName) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                upperCaseEntryName: entryName.toUpperCase()
            });
        }, Math.random() * 3000);
    });
}

export default class App extends React.PureComponent {
    render () {
        return <div className="app">
            <ReactRussianRouter routes={routes} options={options}>
                <nav className="app__navigation">
                    <RussianMatchLink className="app__link" name="index">Index</RussianMatchLink>
                    <RussianMatchLink className="app__link" name="user" id="1">User 1</RussianMatchLink>
                    <RussianMatchLink className="app__link" name="user" id="2">User 2</RussianMatchLink>
                    <RussianMatchLink className="app__link" href="/asdf">Error</RussianMatchLink>
                </nav>
                <div className="app__container">
                    <FetchSwitch
                        loadUserData={this._loadUserData}
                        cacheJs={true}
                        extractJsPath="/out/{payload}.js"
                        extractCssPath=""
                        extractPayload={this._extractPayload}
                        errorComponent={ErrorPage}
                        spinnerComponent={Spinner}
                        spinnerBeforeInit={true}
                        spinnerWhenWaiting={true}
                        minWaitTime={1000}
                        maxWaitTime={10000}
                        onWaitStart={this._onWaitStart}
                        onWaitEnd={this._onWaitEnd} />
                </div>
            </ReactRussianRouter>
        </div>
    }

    _loadUserData (matchObject) {
        return fakeApiRequest(matchObject.payload);
    }

    _extractPayload (matchObject, userData) {
        const {payload} = matchObject;
        const payloadModuleId = require.resolveWeak(`./${payload}.jsx`);
        const EntryComponent = require.cache[payloadModuleId].exports.default;
        return EntryComponent;
    }

    _onWaitStart ({matchObjects}) {
        document.body.classList.add('waiting');
    }

    _onWaitEnd ({matchObjects}) {
        document.body.classList.remove('waiting');
    }
}
