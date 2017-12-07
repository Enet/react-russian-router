import React from 'react';
import PropTypes from 'prop-types';
import AsyncSwitch from './AsyncSwitch';

const cssId = 'ReactRussianRouter/FetchSwitch/CssNode';
const jsId = 'ReactRussianRouter/FetchSwitch/JsNode';

export default class FetchSwitch extends AsyncSwitch {
    componentWillMount () {
        this._cachedCss = {};
        this._cachedJs = {};
        super.componentWillMount();
    }

    _getPayload (matchObjects) {
        const matchPromises = matchObjects
            .slice(0, this.props.childLimit)
            .map((matchObject) => this._matchObjectToPromise(matchObject));
        return Promise.all(matchPromises);
    }

    _matchObjectToPromise (matchObject) {
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
                const resolvedMatchObject = Object.assign({}, matchObject, {payload});
                return resolvedMatchObject;
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
        if (!this.props.loadData) {
            return Promise.resolve(null);
        }
        return this.props.loadData(matchObject);
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
    loadJs: PropTypes.func,
    loadCss: PropTypes.func,
    loadData: PropTypes.func,
    cacheJs: PropTypes.bool,
    cacheCss: PropTypes.bool,
    extractJsPath: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
    extractCssPath: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
    renderContent: PropTypes.func,
    renderError: PropTypes.func,
    onUriChange: PropTypes.func,
    onError: PropTypes.func,
    onWaitStart: PropTypes.func,
    onWaitEnd: PropTypes.func
};

FetchSwitch.defaultProps = {
    childLimit: 1,
    getPayload: (matchObject) => new Promise((resolve) => resolve(matchObject)),
    loadData: (matchObject) => new Promise((resolve) => resolve()),
    extractJsPath: '{payload}.js',
    extractCssPath: '{payload}.css'
};
