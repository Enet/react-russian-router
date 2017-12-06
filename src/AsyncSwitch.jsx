import React from 'react';
import PropTypes from 'prop-types';
import Switch from './Switch';

export default class AsyncSwitch extends Switch {
    render () {
        if (!this._isInited) {
            return null;
        }
        return super.render();
    }

    componentWillMount () {
        if (this.props.handlePayload === defaultProps.handlePayload) {
            console.warn('You don\'t provide handlePayload function. Most likely it means that you don\'t need AsyncSwitch.');
        }
        this._navigationId = 0;
        this._isInited = false;
        super.componentWillMount();
    }

    _onUriChange () {
        const {router} = this.context;
        const matchObjects = router.getMatchObjects();
        const prevMatchObjects = this.state.matchObjects;
        const navigationId = ++this._navigationId;

        this.props.handlePayload(matchObjects, prevMatchObjects)
            .then(this._onPayloadResolve.bind(this, navigationId))
            .catch(this._onPayloadReject.bind(this, navigationId));
    }

    _onPayloadResolve (navigationId, matchObjects) {
        if (navigationId !== this._navigationId) {
            return;
        }
        this._isInited = true;
        super._onUriChange();
    }

    _onPayloadReject (navigationId, error) {
        if (navigationId !== this._navigationId) {
            return;
        }
        this._isInited = true;
        this._matchError = error;
        this._throwError();
    }
}

AsyncSwitch.propTypes = {
    handlePayload: PropTypes.func.isRequired,
    renderContent: PropTypes.func,
    renderError: PropTypes.func
};

AsyncSwitch.defaultProps = {
    handlePayload: (matchObjects) => new Promise((resolve) => resolve(matchObjects))
};
