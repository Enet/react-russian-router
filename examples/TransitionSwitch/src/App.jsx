import React from 'react';
import {
    ReactRussianRouter,
    TransitionSwitch,
    MatchLink
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
                <nav className="app__navigation">
                    <MatchLink className="app__link" name="index">Index</MatchLink>
                    <MatchLink className="app__link" name="user" params={{id: 1}}>User 1</MatchLink>
                    <MatchLink className="app__link" name="user" params={{id: 2}}>User 2</MatchLink>
                    <MatchLink className="app__link" href="/asdf">Error</MatchLink>
                </nav>
                <div className="app__container">
                    <TransitionSwitch
                        transitionOnAppear={true}
                        errorComponent={ErrorPage}
                        onEnterStart={this._onPageEnterStart}
                        onEnterEnd={this._onPageEnterEnd}
                        onLeaveStart={this._onPageLeaveStart}
                        onLeaveEnd={this._onPageLeaveEnd} />
                </div>
            </ReactRussianRouter>
        </div>
    }

    _onPageEnterStart ({type, component, matchObjects, hiddenObjects}) {
        console.log('onEnterStart', component, matchObjects, hiddenObjects);
    }

    _onPageEnterEnd ({type, component, matchObjects, hiddenObjects}) {
        console.log('onEnterEnd', component, matchObjects, hiddenObjects);
    }

    _onPageLeaveStart ({type, component, matchObjects, hiddenObjects}) {
        console.log('onLeaveStart', component, matchObjects, hiddenObjects);
    }

    _onPageLeaveEnd ({type, component, matchObjects, hiddenObjects}) {
        console.log('onLeaveEnd', component, matchObjects, hiddenObjects);
    }
}
