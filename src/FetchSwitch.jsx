import PropTypes from 'prop-types';
import AsyncSwitch from './AsyncSwitch';

const cssId = 'ReactRussianRouter/FetchSwitch/CssNode';
const jsId = 'ReactRussianRouter/FetchSwitch/JsNode';

export default class FetchSwitch extends AsyncSwitch {
    componentWillMount () {
        this._userDataMap = new Map();
        this._prevUserDataMap = this._userDataMap;
        this._cachedCss = {};
        this._cachedJs = {};
        super.componentWillMount();
    }

    _restorePrevState (isInited) {
        this._userDataMap = this._prevUserDataMap;
        super._restorePrevState(isInited);
    }

    _extractPayloadProps (matchObject) {
        const payloadProps = super._extractPayloadProps(matchObject);
        payloadProps.userData = this._userDataMap.get(matchObject);
        return payloadProps;
    }

    _getInitialPayload (matchObjects, payloadMap) {
        const userDataMap = new Map();
        const initialMatchObjects = super._getInitialPayload(matchObjects, payloadMap, userDataMap);
        this._prevUserDataMap = this._userDataMap;
        this._userDataMap = userDataMap;
        return initialMatchObjects;
    }

    _matchObjectToInitial (matchObject, optionalMaps) {
        let userData;
        if (this.props.initialUserData) {
            userData = this.props.initialUserData(matchObject);
            optionalMaps[1].set(matchObject, userData);
        }
        const payload = this.props.initialPayload(matchObject, userData);
        optionalMaps[0].set(matchObject, payload);
        return matchObject;
    }

    _getAsyncPayload (matchObjects, payloadMap) {
        const userDataMap = new Map();
        return super._getAsyncPayload(matchObjects, payloadMap, userDataMap)
            .then((matchObjects) => {
                this._prevUserDataMap = this._userDataMap;
                this._userDataMap = userDataMap;
                return matchObjects;
            });
    }

    _matchObjectToPromise (matchObject, optionalMaps) {
        const cssCodePromise = this._getCodePromise(matchObject, 'Css');
        const jsCodePromise = this._getCodePromise(matchObject, 'Js');
        const userDataPromise = this._getUserDataPromise(matchObject);

        return Promise.all([cssCodePromise, jsCodePromise, userDataPromise])
            .then(([cssCode, jsCode, userData]) => {
                const payload = this.props.getPayload(matchObject, userData);
                return Promise.all([cssCode, jsCode, userData, payload]);
            })
            .then(([cssCode, jsCode, userData, payload]) => {
                this._appendCss(cssCode, matchObject, userData);
                this._appendJs(jsCode, matchObject, userData);
                optionalMaps[0].set(matchObject, payload);
                optionalMaps[1].set(matchObject, userData);
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
        } else {
            filePath = pathExtractor(matchObject);
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

        const prevCssNode = document.getElementById(cssId);
        if (prevCssNode) {
            prevCssNode.parentNode.removeChild(prevCssNode);
        }

        if (!cssCode) {
            return;
        }

        const cssNode = document.createElement('style');
        cssNode.id = cssId;
        cssNode.innerHTML = cssCode;
        document.head.appendChild(cssNode);
    }

    _appendJs (jsCode, matchObject, userData) {
        const {appendJs} = this.props;
        if (appendJs) {
            return appendJs(jsCode, matchObject, userData);
        }

        const prevJsNode = document.getElementById(jsId);
        if (prevJsNode) {
            prevJsNode.parentNode.removeChild(prevJsNode);
        }

        if (!jsCode) {
            return;
        }

        const jsNode = document.createElement('script');
        jsNode.id = jsId;
        jsNode.innerHTML = jsCode;
        document.head.appendChild(jsNode);
    }
}

FetchSwitch.propTypes = {
    childLimit: PropTypes.number,
    getPayload: PropTypes.func.isRequired,
    initialPayload: PropTypes.func,
    loadUserData: PropTypes.func,
    initialUserData: PropTypes.func,
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
    getPayload: (matchObject) => Promise.resolve(matchObject),
    extractJsPath: '{payload}.js',
    extractCssPath: '{payload}.css'
};
