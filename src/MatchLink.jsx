import Link from './Link';

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

export default class MatchLink extends Link {
    componentWillMount () {
        this._onUriChange = this._onUriChange.bind(this);
        this._onUriChange();
    }

    componentDidMount () {
        const {router} = this.context;
        router.addListener('change', this._onUriChange);
    }

    componentWillUnmount () {
        const {router} = this.context;
        router.removeListener('change', this._onUriChange);
    }

    _getClassName () {
        const {router} = this.context;
        const linkParsedRoutes = {};
        const linkHref = this._generateUri();

        const routerParsedRoutes = router.getParsedRoutes();
        const routerMatchObjects = this.state.matchObjects;
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

        let isLinkMatched = false;
        for (let routeName in linkMatchObjectsByName) {
            const linkMatchObject = linkMatchObjectsByName[routeName];
            const routerMatchObject = routerMatchObjectsByName[routeName];
            if (areStringsEqual(linkMatchObject.protocol, routerMatchObject.protocol) &&
                areStringsEqual(linkMatchObject.domain, routerMatchObject.domain) &&
                areStringsEqual(linkMatchObject.port, routerMatchObject.port) &&
                arePathsEqual(linkMatchObject.path, routerMatchObject.path) &&
                areQueriesEqual(linkMatchObject.query, routerMatchObject.query) &&
                areStringsEqual(linkMatchObject.hash, routerMatchObject.hash)) {
                isLinkMatched = true;
                break;
            }
        }

        let className = super._getClassName();
        if (isLinkMatched) {
            className += ' matched';
        }
        return className;
    }

    _onUriChange () {
        const {router} = this.context;
        const matchObjects = router.getMatchObjects();
        this.setState({matchObjects});
    }
}
