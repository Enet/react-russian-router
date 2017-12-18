import React from 'react';
import {
    RussianMatchLink
} from 'react-russian-router';

import './App.css';

export default class App extends React.PureComponent {
    render () {
        return <div className="app">
            <nav className="app__navigation">
                <RussianMatchLink className="app__link" name="index">Index</RussianMatchLink>
                <RussianMatchLink className="app__link" name="user" id="1">User 1</RussianMatchLink>
                <RussianMatchLink className="app__link" name="user" id="2">User 2</RussianMatchLink>
                <RussianMatchLink className="app__link" href="/asdf">Error</RussianMatchLink>
            </nav>
            <div className="app__container">
                {this.props.children}
            </div>
        </div>
    }
}
