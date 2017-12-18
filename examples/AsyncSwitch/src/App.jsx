import React from 'react';
import {
    ReactRussianRouter,
    AsyncSwitch,
    RussianMatchLink
} from 'react-russian-router';

import routes from './routes.jsx';
import ErrorPage from './ErrorPage.jsx';
import Spinner from './Spinner.jsx';

import './App.css';

const options = {
    scrollRestoration: 'auto'
};

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
                    <AsyncSwitch
                        loadPayload={this._loadPayload}
                        errorComponent={ErrorPage}
                        spinnerComponent={Spinner}
                        spinnerBeforeInit={true}
                        spinnerWhenWaiting={true}
                        minWaitTime={1000}
                        maxWaitTime={2000}
                        onWaitStart={this._onWaitStart}
                        onWaitEnd={this._onWaitEnd} />
                </div>
            </ReactRussianRouter>
        </div>
    }

    _loadPayload (matchObject) {
        return import(`./${matchObject.payload}.jsx`)
            .then((entryModule) => entryModule.default);
    }

    _onWaitStart ({matchObjects}) {
        document.body.classList.add('waiting');
    }

    _onWaitEnd ({matchObjects}) {
        document.body.classList.remove('waiting');
    }
}
