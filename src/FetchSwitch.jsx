import PropTypes from 'prop-types';
import AsyncSwitch from './AsyncSwitch';

const cssClassName = 'ReactRussianRouter/FetchSwitch/CssNode';
const jsClassName = 'ReactRussianRouter/FetchSwitch/JsNode';

export default class FetchSwitch extends AsyncSwitch {
    componentWillMount () {
        this._cachedCss = {};
        this._cachedJs = {};
        super.componentWillMount();
    }

    _extractPayloadProps (matchObject) {
        const payloadProps = super._extractPayloadProps(matchObject);
        const dataObject = this._dataMap.get(matchObject) || {};
        payloadProps.userData = dataObject.userData;
        return payloadProps;
    }

    _matchObjectToInitial (matchObject, dataMap) {
        let userData;
        if (this.props.initUserData) {
            userData = this.props.initUserData(matchObject);
            this._modifyDataMap(dataMap, matchObject, {userData});
        }
        const payload = this.props.initPayload(matchObject, userData);
        this._modifyDataMap(dataMap, matchObject, {payload});
        return matchObject;
    }

    _loadMatchObjects (matchObjects, dataMap) {
        return super._loadMatchObjects(...arguments)
            .then((matchObjects) => {
                this._appendCss(null, null);
                this._appendJs(null, null);

                matchObjects.forEach((matchObject) => {
                    const dataObject = dataMap.get(matchObject) || {};
                    const userData = dataObject.userData;
                    const cssCode = dataObject.cssCode || null;
                    const jsCode = dataObject.jsCode || null;

                    this._appendCss(cssCode, matchObject, userData);
                    this._appendJs(jsCode, matchObject, userData);

                    const payload = this.props.extractPayload(matchObject, userData);
                    this._modifyDataMap(dataMap, matchObject, {payload});
                });
                return matchObjects;
            });
    }

    _matchObjectToPromise (matchObject, dataMap) {
        const cssCodePromise = this._getCodePromise(matchObject, 'Css');
        const jsCodePromise = this._getCodePromise(matchObject, 'Js');
        const userDataPromise = this._getUserDataPromise(matchObject);

        return Promise.all([cssCodePromise, jsCodePromise, userDataPromise])
            .then(([cssCode, jsCode, userData]) => {
                this._modifyDataMap(dataMap, matchObject, {
                    cssCode, jsCode, userData
                });
                return matchObject;
            });
    }

    _getCodePromise (matchObject, language) {
        const pathExtractor = this.props['extract' + language + 'Path'];
        let filePath;
        if (typeof pathExtractor === 'string') {
            let {payload} = matchObject;
            payload = (payload || '') + '';
            if (payload) {
                filePath = pathExtractor
                    .replace(/{payload}/g, payload)
                    .replace(/{payload\.abc}/g, payload.toLowerCase())
                    .replace(/{payload\.ABC}/g, payload.toUpperCase())
                    .replace(/{payload\.Abc}/g, payload.substr(0, 1).toUpperCase() + payload.substr(1).toLowerCase());
            }
        } else if (pathExtractor) {
            filePath = pathExtractor(matchObject);
        } else {
            filePath = '';
        }

        const cacheStorage = this['_cached' + language];
        const cacheKey = matchObject.name + '~' + filePath;
        if (cacheStorage.hasOwnProperty(cacheKey)) {
            return Promise.resolve(cacheStorage[cacheKey]);
        }

        const putValueToCache = (cacheValue) => {
            if (this.props['cache' + language]) {
                cacheStorage[cacheKey] = cacheValue;
            }
            return cacheValue;
        };

        const customLoader = this.props['load' + language];
        if (customLoader) {
            return customLoader(matchObject, filePath)
                .then(putValueToCache);
        }

        if (!filePath) {
            return Promise.resolve(null);
        }
        return fetch(filePath)
            .then((response) => response.text())
            .then(putValueToCache);
    }

    _getUserDataPromise (matchObject) {
        if (!this.props.loadUserData) {
            return Promise.resolve(null);
        }
        return this.props.loadUserData(matchObject);
    }

    _appendCss (cssCode, matchObject, userData) {
        const {appendCss} = this.props;
        if (appendCss) {
            return appendCss(cssCode, matchObject, userData);
        }

        if (!matchObject) {
            const prevCssNodes = document.getElementsByClassName(cssClassName);
            [...prevCssNodes].forEach((prevCssNode) => {
                prevCssNode.parentNode.removeChild(prevCssNode);
            });
        }

        if (!cssCode) {
            return;
        }

        const cssNode = document.createElement('style');
        cssNode.className = cssClassName;
        cssNode.innerHTML = cssCode;
        document.head.appendChild(cssNode);
    }

    _appendJs (jsCode, matchObject, userData) {
        const {appendJs} = this.props;
        if (appendJs) {
            return appendJs(jsCode, matchObject, userData);
        }

        if (!matchObject) {
            const prevJsNodes = document.getElementsByClassName(jsClassName);
            [...prevJsNodes].forEach((prevJsNode) => {
                prevJsNode.parentNode.removeChild(prevJsNode);
            });
        }

        if (!jsCode) {
            return;
        }

        const jsNode = document.createElement('script');
        jsNode.className = jsClassName;
        jsNode.innerHTML = jsCode;
        document.head.appendChild(jsNode);
    }

    _throwError () {
        super._throwError(...arguments);
        const matchObject = this.state.matchObjects[0];
        this._appendJs(null, matchObject);
        this._appendCss(null, matchObject);
    }
}

FetchSwitch.propTypes = {
    childLimit: PropTypes.number,
    extractPayload: PropTypes.func.isRequired,
    initPayload: PropTypes.func,
    loadUserData: PropTypes.func,
    initUserData: PropTypes.func,
    loadJs: PropTypes.func,
    loadCss: PropTypes.func,
    cacheJs: PropTypes.bool,
    cacheCss: PropTypes.bool,
    extractJsPath: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
    extractCssPath: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
    errorComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    initialError: PropTypes.any,
    spinnerComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    spinnerBeforeInit: PropTypes.bool,
    spinnerWhenWaiting: PropTypes.bool,
    minWaitTime: PropTypes.number,
    maxWaitTime: PropTypes.number,
    onUriChange: PropTypes.func,
    onError: PropTypes.func,
    onWaitStart: PropTypes.func,
    onWaitEnd: PropTypes.func
};

FetchSwitch.defaultProps = {
    childLimit: 1,
    extractPayload: (matchObject) => matchObject.payload,
    extractJsPath: '{payload}.js',
    extractCssPath: '{payload}.css'
};
