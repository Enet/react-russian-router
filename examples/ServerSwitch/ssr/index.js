const path = require('path');
const express = require('express');
const React = require('react');
const renderToString = require('react-dom/server').renderToString;
const template = require('./template.js');
const ServerRussianRouter = require('server-russian-router');
const AppServer = require('../out/AppServer.js').default;
const routes = require('../src/routes.js');
const options = require('../src/options.js');

const server = express();
server.use(express.static(path.resolve(__dirname, '..'))); // only for development
server.get('*', (request, response) => {
    const router = new ServerRussianRouter(routes, options, request);
    const matchObjects = router.getMatchObjects();
    let payload = matchObjects.length ? matchObjects[0].payload : '';
    let userData = getUserDataFromFakeDatabase(payload, matchObjects[0]);

    if (request.get('X-User-Data-Only')) {
        // Send only user data for AJAX requests
        response.send(JSON.stringify(userData));
        return;
    }

    const feedback = {};
    let body = '';
    let initialError = null;

    try {
        // Render entry point to string
        body = renderToString(React.createElement(AppServer, {
            request,
            feedback,
            userData
        }));
    } catch (renderError) {
        payload = '';
        userData = getUserDataFromFakeDatabase(payload);
        initialError = renderError + '';
        // Render error to string
        body = renderToString(React.createElement(AppServer, {
            request,
            feedback,
            userData,
            initialError
        }));
    }

    if (feedback.redirect) {
        response.redirect(feedback.redirect);
        return;
    }

    const html = template({body, payload, initialError, userData}).trim();
    response.send(html);
});
server.listen(8080);

function getUserDataFromFakeDatabase (entryName, matchObject) {
    if (entryName === 'IndexPage') {
        return {
            keywords: ['SSR', 'react-russian-router', 'React', 'router']
        };
    } else if (entryName === 'UserPage') {
        return {
            id: matchObject.params.id,
            name: ['Julian', 'Stepan', 'Varvara', 'Oleg', 'Ivan'][matchObject.params.id - 1]
        };
    } else {
        return {};
    }
}
