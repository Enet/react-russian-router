import React from 'react';
import {
    ReactRussianRouter,
    Switch,
    Link
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
                    <Link className="app__link" name="index">Index</Link>
                    <Link className="app__link" name="user" params={{id: 1}}>User 1</Link>
                    <Link className="app__link" name="user" params={{id: 2}}>User 2</Link>
                    <Link className="app__link" href="/asdf">Error</Link>
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
