import React from 'react';
import PropTypes from 'prop-types';
import Switch from './Switch';

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

        this._payloadMap = new Map();
        this._navigationId = 0;
        super.componentWillMount();
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

    _getMatchObjects () {
        if (this._matchObjects) {
            return this._matchObjects;
        }

        const {router} = this.context;
        const matchObjects = router.getMatchObjects();
        this._matchObjects = matchObjects;
        return matchObjects;
    }

    _getPayload (matchObjects, ...optionalMaps) {
        const matchObjectPromises = matchObjects
            .slice(0, Math.max(0, this.props.childLimit))
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
        const matchObjects = this._getMatchObjects();
        const navigationId = ++this._navigationId;

        const payloadMap = new Map();
        this._getPayload(matchObjects, payloadMap)
            .then(this._onPayloadResolve.bind(this, navigationId))
            .catch(this._onPayloadReject.bind(this, navigationId));

        if (typeof this.props.renderSpinner === 'function') {
            this.state.isSpinnerVisible = true;
        }
        this.setState({isWaiting: true});

        this._emitUriChange(matchObjects);
        const {onWaitStart} = this.props;
        const type = 'waitstart';
        onWaitStart && onWaitStart({type, matchObjects});
    }

    _onPayloadResolve (navigationId, matchObjects) {
        if (navigationId !== this._navigationId) {
            return;
        }

        this._matchObjects = null;
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

    _onPayloadReject (navigationId, error) {
        if (navigationId !== this._navigationId) {
            return;
        }

        this.state.isWaiting = false;
        this.state.isSpinnerVisible = false;
        this._matchObjects = null;
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
