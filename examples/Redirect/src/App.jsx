import React from 'react';
import {
    ReactRussianRouter,
    Switch,
    RussianMatchLink
} from 'react-russian-router';

import routes from './routes.jsx';
import ErrorPage from './ErrorPage.jsx';

import './App.css';

const options = {
    scrollRestoration: 'auto'
};

export default class App extends React.PureComponent {
    render () {
        return <div className="app">
            <ReactRussianRouter routes={routes} options={options}>
                <nav>
                    <RussianMatchLink className="app__link" name="index">Index</RussianMatchLink>
                    <RussianMatchLink className="app__link" name="about">About*</RussianMatchLink>
                    <RussianMatchLink className="app__link" name="user" id="1">User 1</RussianMatchLink>
                    <RussianMatchLink className="app__link" name="user" id="2">User 2</RussianMatchLink>
                    <RussianMatchLink className="app__link" name="user" id="3">User 3*</RussianMatchLink>
                    <RussianMatchLink className="app__link" name="etc">Etc**</RussianMatchLink>
                    <RussianMatchLink className="app__link" href="/asdf">Error</RussianMatchLink>
                </nav>
                <Switch
                    errorComponent={ErrorPage}
                    onUriChange={this._onUriChange}
                    onError={this._onError} />
            </ReactRussianRouter>
        </div>
    }

    _onUriChange ({type, matchObjects}) {
        console.log('uri was changed', matchObjects);
    }

    _onError ({type, error}) {
        console.log('error was occured', error);
    }
}
