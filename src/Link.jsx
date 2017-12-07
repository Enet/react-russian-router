import React from 'react';
import PropTypes from 'prop-types';
import BrowserRussianRouter from 'browser-russian-router';

const isLeftButtonClick = (event) => {
    return event.button === 0;
};

const isMetaKeyPressed = (event) => {
    return event.metaKey || event.ctrlKey || event.altKey || event.shiftKey;
};

const pathRegExp = /\/$/;

const areStringsEqual = (linkString, routerString) => {
    return linkString.toLowerCase() === routerString.toLowerCase();
};

const arePathsEqual = (linkPath, routerPath) => {
    return areStringsEqual(linkPath.replace(pathRegExp, ''), routerPath.replace(pathRegExp, ''));
};

const areQueriesEqual = (linkQuery, routerQuery) => {
    if (Object.keys(linkQuery).length < Object.keys(routerQuery).length) {
        return false;
    }
    for (let r in routerQuery) {
        if (!areStringsEqual(linkQuery[r], routerQuery[r])) {
            return false;
        }
    }
    return true;
};

export default class Link extends React.PureComponent {
    render () {
        const href = this._generateUri();
        const props = Object.assign({}, this.props);
        delete props.name;
        delete props.params;
        delete props.action;
        delete props.actionIfMatched;

        return <a
            {...props}
            href={href}
            className={this._getClassName()}
            onClick={this._onClick.bind(this, href)}>
            {this.props.children}
        </a>
    }

    _getClassName () {
        const {className} = this.props;
        return (className || '') + '';
    }

    _generateUri () {
        const {href, name, params} = this.props;
        if (!name) {
            return href;
        }

        const {router} = this.context;
        return router.generateUri(name, params);
    }

    _isMatched () {
        const {router} = this.context;
        const linkParsedRoutes = {};
        const linkHref = this._generateUri();

        const routerParsedRoutes = router.getParsedRoutes();
        const routerMatchObjects = router.getMatchObjects();
        const routerMatchObjectsByName = {};
        routerMatchObjects.forEach((routerMatchObject) => {
            const routeName = routerMatchObject.name;
            routerMatchObjectsByName[routeName] = routerMatchObject;
            const routerParsedRoute = routerParsedRoutes[routeName];
            linkParsedRoutes[routeName] = routerParsedRoute;
        });

        const linkMatchObjects = router.matchUri(linkHref, linkParsedRoutes);
        const linkMatchObjectsByName = {};
        linkMatchObjects.forEach((linkMatchObject) => {
            const routeName = linkMatchObject.name;
            linkMatchObjectsByName[routeName] = linkMatchObject;
        });

        for (let routeName in linkMatchObjectsByName) {
            const linkMatchObject = linkMatchObjectsByName[routeName];
            const routerMatchObject = routerMatchObjectsByName[routeName];
            if (areStringsEqual(linkMatchObject.protocol, routerMatchObject.protocol) &&
                areStringsEqual(linkMatchObject.domain, routerMatchObject.domain) &&
                areStringsEqual(linkMatchObject.port, routerMatchObject.port) &&
                arePathsEqual(linkMatchObject.path, routerMatchObject.path) &&
                areQueriesEqual(linkMatchObject.query, routerMatchObject.query) &&
                areStringsEqual(linkMatchObject.hash, routerMatchObject.hash)) {
                return true;
            }
        }
        return false;
    }

    _onClick (uri, event) {
        const {onClick} = this.props;
        if (onClick) {
            onClick(event);
        }
        if (event.defaultPrevented) {
            return;
        }
        if (this.props.target !== '_self') {
            return;
        }
        if (!isLeftButtonClick(event)) {
            return;
        }
        if (isMetaKeyPressed(event)) {
            return;
        }

        event.preventDefault();
        if (!this.props.actionIfMatched && this._isMatched()) {
            return;
        }
        const {router} = this.context;
        const {action} = this.props;
        if (action === 'replace') {
            router.replaceUri(uri);
        } else {
            router.pushUri(uri);
        }
    }
}

Link.contextTypes = {
    router: PropTypes.instanceOf(BrowserRussianRouter).isRequired
};

Link.propTypes = {
    href: PropTypes.string,
    name: PropTypes.string,
    params: PropTypes.object,
    action: PropTypes.oneOf(['replace', 'push']),
    target: PropTypes.string,
    actionIfMatched: PropTypes.bool,
    onClick: PropTypes.func
};

Link.defaultProps = {
    action: 'push',
    target: '_self',
    actionIfMatched: false
};
