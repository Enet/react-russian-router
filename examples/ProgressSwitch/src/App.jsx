import React from 'react';
import {
    ReactRussianRouter,
    ProgressSwitch,
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
                <nav className="app__navigation">
                    <RussianMatchLink className="app__link" name="index">Index</RussianMatchLink>
                    <RussianMatchLink className="app__link" name="user" id="1">User 1</RussianMatchLink>
                    <RussianMatchLink className="app__link" name="user" id="2">User 2</RussianMatchLink>
                    <RussianMatchLink className="app__link" href="/asdf">Error</RussianMatchLink>
                </nav>
                <div className="app__container">
                    <ProgressSwitch
                        transitionOnAppear={true}
                        transitionDuration={1500}
                        progressEasing={(progress) => 100 * Math.pow(progress / 100, 4)}
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
