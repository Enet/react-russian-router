import React from 'react';
import PropTypes from 'prop-types';
import Switch from './Switch';
import Redirect from './Redirect';

export default class AsyncSwitch extends Switch {
    constructor () {
        super();
        this.state.isSpinnerVisible = true;
        this.state.isWaiting = true;
    }

    render () {
        if (this.state.isSpinnerVisible) {
            return this.renderSpinner();
        }
        if (this.state.matchObjects === this._prevMatchObjects && !this.state.matchObjects.length) {
            {/* Usually it's a case when error page is loaded and immediately redirects to another uri */}
            return this.renderSpinner();
        }
        return super.render();
    }

    renderSpinner () {
        return null;
    }

    componentWillMount () {
        const {renderSpinner, getPayload} = this.props;
        if (typeof renderSpinner === 'function') {
            this.renderSpinner = renderSpinner;
        }
        if (getPayload === AsyncSwitch.defaultProps.getPayload) {
            console.warn('You didn\'t provide getPayload function. Most likely it means that you don\'t need AsyncSwitch.');
        }

        this._prevMatchObjects = this.state.matchObjects;
        this._payloadMap = new Map();
        this._prevPayloadMap = this._payloadMap;
        super.componentWillMount();
    }

    componentDidUpdate () {
        super.componentDidUpdate();

        // All the code below restores previous state to avoid flashes during redirect
        if (this.state.isWaiting) {
            return;
        }
        const currentMatchObjects = this._getMatchObjects();
        const renderedMatchObjects = this.state.matchObjects;
        if (!renderedMatchObjects.length) {
            return;
        }
        // Rendering errors is wily, be careful with it
        if (!currentMatchObjects.length &&
            renderedMatchObjects[0] &&
            renderedMatchObjects[0].hasOwnProperty('error')) {
            return;
        }
        for (let r = 0, rl = renderedMatchObjects.length; r < rl; r++) {
            if (renderedMatchObjects[r] !== currentMatchObjects[r]) {
                this._restorePrevState();
                return;
            }
        }

        this._prevMatchObjects = renderedMatchObjects;
    }

    _restorePrevState () {
        this._payloadMap = this._prevPayloadMap;
        this.setState({
            matchObjects: this._prevMatchObjects
        });
    }

    _restoreScroll () {
        if (this.state.isWaiting) {
            return;
        }
        super._restoreScroll(...arguments);
    }

    _extractPayloadNode (matchObject) {
        if (matchObject.hasOwnProperty('error')) {
            return matchObject.payload;
        }
        return this._payloadMap.get(matchObject);
    }

    _getNavigationKey () {
        const {router} = this.context;
        return router.getNavigationKey();
    }

    _getPayload (matchObjects, ...optionalMaps) {
        const matchObjectPromises = matchObjects
            .map((matchObject) => this._matchObjectToPromise(matchObject, optionalMaps));
        const minWaitTimePromises = [Promise.all(matchObjectPromises)];
        const minWaitTime = +this.props.minWaitTime;
        if (minWaitTime > 0) {
            minWaitTimePromises.push(new Promise((resolve, reject) => {
                setTimeout(resolve, minWaitTime);
            }));
        }

        const maxWaitTimePromises = [Promise.all(minWaitTimePromises).then(([a, b]) => a)];
        const maxWaitTime = +this.props.maxWaitTime;
        if (maxWaitTime > 0) {
            maxWaitTimePromises.push(new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject('Max waiting time has expired!');
                }, maxWaitTime);
            }));
        }

        return Promise.race(maxWaitTimePromises)
            .then((matchObjects) => {
                this._prevPayloadMap = this._payloadMap;
                this._payloadMap = optionalMaps[0];
                return matchObjects;
            });
    }

    _matchObjectToPromise (matchObject, optionalMaps) {
        return this.props.getPayload(matchObject)
            .then((payload) => {
                optionalMaps[0].set(matchObject, payload);
                return matchObject;
            });
    }

    _onUriChange () {
        const matchObjects = this._getMatchObjects().slice(0, Math.max(0, this.props.childLimit));
        const navigationKey = this._getNavigationKey();

        // Loop below looks for declarative redirects (from routes' table) and executes them
        for (let matchObject of matchObjects) {
            if (!matchObject.payload ||
                !matchObject.payload.type ||
                matchObject.payload.type !== Redirect) {
                continue;
            }
            // Emulate react component (instance of Redirect)
            const fakeRedirectInstance = Object.create(Redirect.prototype, {
                context: {value: this.context},
                props: {value: matchObject.payload.props}
            });
            // Ensure that redirect will be executed after switch is mounted
            this.setState({}, () => {
                fakeRedirectInstance.componentDidMount();
            });
            return;
        }

        const payloadMap = new Map();
        this._getPayload(matchObjects, payloadMap)
            .then(this._onPayloadResolve.bind(this, navigationKey))
            .catch(this._onPayloadReject.bind(this, navigationKey));

        if (typeof this.props.renderSpinner === 'function') {
            this.state.isSpinnerVisible = true;
        }
        this.setState({isWaiting: true});

        this._emitUriChange(matchObjects);
        const {onWaitStart} = this.props;
        const type = 'waitstart';
        onWaitStart && onWaitStart({type, matchObjects});
    }

    _onPayloadResolve (navigationKey, matchObjects) {
        if (navigationKey !== this._getNavigationKey()) {
            return;
        }

        const isWaiting = false;
        const isSpinnerVisible = false;
        this.setState({
            matchObjects,
            isWaiting,
            isSpinnerVisible
        });

        const {onWaitEnd} = this.props;
        const type = 'waitend';
        onWaitEnd && onWaitEnd({type, matchObjects});
    }

    _onPayloadReject (navigationKey, error) {
        if (navigationKey !== this._getNavigationKey()) {
            return;
        }

        this.state.isWaiting = false;
        this.state.isSpinnerVisible = false;
        this._matchError = error;
        this._throwError();
    }
}

AsyncSwitch.propTypes = {
    childLimit: PropTypes.number,
    getPayload: PropTypes.func.isRequired,
    renderContent: PropTypes.func,
    renderError: PropTypes.func,
    minWaitTime: PropTypes.number,
    maxWaitTime: PropTypes.number,
    onUriChange: PropTypes.func,
    onError: PropTypes.func,
    onWaitStart: PropTypes.func,
    onWaitEnd: PropTypes.func
};

AsyncSwitch.defaultProps = {
    childLimit: 1,
    getPayload: (matchObject) => new Promise((resolve) => resolve(matchObject)),
    minWaitTime: 0,
    maxWaitTime: 60000
};
