import React from 'react';
import {
    ReactRussianRouter,
    FetchSwitch
} from 'react-russian-router';

import routes from './routes.js';
import options from './options.js';

import App from './App.jsx';
import ErrorPage from './ErrorPage.jsx';

export default class AppClient extends React.PureComponent {
    render () {
        const {initialError} = this.props;

        return <ReactRussianRouter routes={routes} options={options}>
            <App>
                <FetchSwitch
                    errorComponent={ErrorPage}
                    initialError={initialError}
                    minWaitTime={1000}
                    cacheJs={true}
                    cacheCss={true}
                    extractJsPath={'/out/{payload}.js'}
                    extractCssPath={'/out/{payload}.css'}
                    initUserData={this._initUserData}
                    loadUserData={this._loadUserData}
                    initPayload={this._extractPayload}
                    extractPayload={this._extractPayload}
                    onWaitStart={this._onWaitStart}
                    onWaitEnd={this._onWaitEnd} />
            </App>
        </ReactRussianRouter>
    }

    componentWillMount () {
        this._initUserData = this._initUserData.bind(this);
        this._loadUserData = this._loadUserData.bind(this);
        this._extractPayload = this._extractPayload.bind(this);
    }

    _initUserData (matchObject) {
        return this.props.userData;
    }

    _loadUserData (matchObject) {
        const headers = new Headers({
            'X-User-Data-Only': '1'
        });
        return fetch(location.href, {headers})
            .then((response) => response.json());
    }

    _extractPayload (matchObject) {
        const entryName = matchObject.payload;
        const EntryComponent = require.cache[require.resolveWeak(`./${entryName}`)].exports.default;
        return EntryComponent;
    }

    _onWaitStart ({matchObjects}) {
        document.body.classList.add('waiting');
    }

    _onWaitEnd ({matchObjects}) {
        document.body.classList.remove('waiting');
    }
}
