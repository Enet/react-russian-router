import React from 'react';
import PropTypes from 'prop-types';
import UniversalRussianRouter from './UniversalRussianRouter';
import {
    utils
} from 'russian-router';

const pathRegExp = /\/$/;
const Protocol = utils.getPartConstructor('protocol');
const Domain = utils.getPartConstructor('domain');
const Port = utils.getPartConstructor('port');

const isLeftButtonClick = (event) => {
    return event.button === 0;
};

const isMetaKeyPressed = (event) => {
    return event.metaKey || event.ctrlKey || event.altKey || event.shiftKey;
};

const queryToLowerCase = (queryObject) => {
    const newQueryObject = {};
    for (let q in queryObject) {
        newQueryObject[q.toLowerCase()] = queryObject[q].toLowerCase();
    }
    return newQueryObject;
};

const compareStrings = (linkString, routerString, routeOptions) => {
    if (!routeOptions.caseSensitive) {
        linkString = linkString.toLowerCase();
        routerString = routerString.toLowerCase();
    }
    return linkString === routerString;
};

const compareProtocols = (linkProtocol, routerProtocol) => {
    if (!linkProtocol) {
        return true;
    }
    return compareStrings(linkProtocol, routerProtocol, {caseSensitive: false});
};

const compareDomains = (linkDomain, routerDomain) => {
    if (!linkDomain) {
        return true;
    }
    return compareStrings(linkDomain, routerDomain, {caseSensitive: false});
};

const comparePorts = (linkPort, routerPort) => {
    return compareStrings(linkPort, routerPort, {caseSensitive: false});
};

const comparePaths = (linkPath, routerPath, routeOptions) => {
    if (!routeOptions.trailingSlashSensitive) {
        linkPath = linkPath.replace(pathRegExp, '');
        routerPath = routerPath.replace(pathRegExp, '');
    }
    return compareStrings(linkPath, routerPath, routeOptions);
};

const compareQueries = (linkQuery, routerQuery, routeOptions, isStrongMode) => {
    if (!routeOptions.caseSensitive) {
        linkQuery = queryToLowerCase(linkQuery);
        routerQuery = queryToLowerCase(routerQuery);
    }
    const linkQueryKeys = Object.keys(linkQuery);
    const routerQueryKeys = Object.keys(routerQuery);
    if (routerQueryKeys.length < linkQueryKeys.length) {
        return false;
    }
    if (isStrongMode && linkQueryKeys.sort().join() !== routerQueryKeys.sort().join()) {
        return false;
    }

    for (let l in linkQuery) {
        if (routerQuery[l] === undefined) {
            return false;
        }
        if (linkQuery[l] !== routerQuery[l]) {
            return false;
        }
    }
    return true;
};

const compareHashes = (linkHash, routerHash, routeOptions, isStrongMode) => {
    if (!linkHash && !isStrongMode) {
        return true;
    }
    return compareStrings(linkHash, routerHash, routeOptions);
};

export default class Link extends React.Component {
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

    shouldComponentUpdate (nextProps) {
        const {router} = this.context;
        const navigationKey = router.getNavigationKey();
        if (navigationKey !== this._navigationKey) {
            this._navigationKey = navigationKey;
            return true;
        }

        const {props} = this;
        const keys = Object.keys(props);
        const nextKeys = Object.keys(nextProps);
        if (keys.length !== nextKeys.length) {
            return true;
        }
        for (let nextKey of nextKeys) {
            if (nextProps[nextKey] !== props[nextKey]) {
                return true;
            }
        }

        return false;
    }

    componentWillMount () {
        const {router} = this.context;
        this._navigationKey = router.getNavigationKey();
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

    _isAnotherResource () {
        const {router} = this.context;
        const linkUri = this._generateUri().trim();
        const splittedLinkUri = utils.splitUri(linkUri, utils.getRegExp('uri'));

        const protocol = splittedLinkUri.protocol;
        const domain = splittedLinkUri.domain;
        const port = utils.getPortByParsedUri({
            protocol: new Protocol(protocol),
            domain: new Domain(domain),
            port: new Port(splittedLinkUri.port)
        }, {router}).toString();

        const defaultProtocol = router.getDefaultPart('protocol');
        const defaultDomain = router.getDefaultPart('domain');
        const defaultPort = router.getDefaultPart('port');

        return false ||
            !compareProtocols(protocol || '', defaultProtocol.toString()) ||
            !compareDomains(domain || '', defaultDomain.toString()) ||
            !comparePorts(port || '', defaultPort.toString());
    }

    _isMatched (isStrongMode=false) {
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
            const routeOptions = router.getParsedRoutes()[routeName].getParsedOptions();
            const linkMatchObject = linkMatchObjectsByName[routeName];
            const routerMatchObject = routerMatchObjectsByName[routeName];
            if (compareProtocols(linkMatchObject.protocol, routerMatchObject.protocol, routeOptions) &&
                compareDomains(linkMatchObject.domain, routerMatchObject.domain, routeOptions) &&
                comparePorts(linkMatchObject.port, routerMatchObject.port, routeOptions) &&
                comparePaths(linkMatchObject.path, routerMatchObject.path, routeOptions) &&
                compareQueries(linkMatchObject.query, routerMatchObject.query, routeOptions, isStrongMode) &&
                compareHashes(linkMatchObject.hash, routerMatchObject.hash, routeOptions, isStrongMode)) {
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
        if (this._isAnotherResource()) {
            return;
        }

        event.preventDefault();
        if (!this.props.actionIfMatched && this._isMatched(true)) {
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
    router: PropTypes.instanceOf(UniversalRussianRouter).isRequired
};

Link.propTypes = {
    href: PropTypes.string,
    name: PropTypes.string,
    params: PropTypes.object,
    action: PropTypes.oneOf(['replace', 'push']),
    target: PropTypes.string,
    actionIfMatched: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func
};

Link.defaultProps = {
    action: 'push',
    target: '_self',
    actionIfMatched: false
};
