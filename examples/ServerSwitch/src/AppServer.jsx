import React from 'react';
import {
    ReactRussianRouter,
    ServerSwitch
} from 'react-russian-router';

import routes from './routes.js';
import options from './options.js';

import App from './App.jsx';
import ErrorPage from './ErrorPage.jsx';
import IndexPage from './IndexPage.jsx';
import UserPage from './UserPage.jsx';

const entryMap = {ErrorPage, IndexPage, UserPage};
for (let r in routes) {
    const entryName = routes[r].payload;
    routes[r].payload = entryMap[entryName];
}

export default class AppServer extends React.PureComponent {
    render () {
        const {request, feedback, initialError, userData} = this.props;
        const props = {routes, options, request, feedback};
        return <ReactRussianRouter {...props}>
            <App>
                <ServerSwitch
                    errorComponent={ErrorPage}
                    initialError={initialError}
                    userData={userData} />
            </App>
        </ReactRussianRouter>
    }
}
