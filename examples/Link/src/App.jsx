import React from 'react';
import {
    ReactRussianRouter,
    Switch,
    Link,
    MatchLink,
    RussianLink,
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
                    {/* Just click on the links and see what's happening */}
                    <Link className="app__link" name="index">
                        Index
                    </Link>
                    <MatchLink className="app__link" name="user" params={{id: 1}}>
                        User 1
                    </MatchLink>
                    <RussianLink className="app__link" name="user" id="2">
                        User 2
                    </RussianLink>
                    <RussianMatchLink className="app__link" name="user" id="3">
                        User 3
                    </RussianMatchLink>
                    <Link className="app__link" name="user" params={{id: 4}} actionIfMatched={true}>
                        User 4
                    </Link>
                    <RussianMatchLink className="app__link" name="user" id="5" target="_blank">
                        User 5
                    </RussianMatchLink>
                    <Link className="app__link" href="/asdf">
                        Error
                    </Link>
                    <Link className="app__link" href="https://google.com">
                        Link to google.com
                    </Link>
                </nav>
                <Switch
                    onUriChange={this._onUriChange}
                    errorComponent={ErrorPage} />
            </ReactRussianRouter>
        </div>
    }

    _onUriChange () {
        console.log('uri is changed');
    }
}
