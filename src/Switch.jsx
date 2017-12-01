import React from 'react';
import PropTypes from 'prop-types';
import BrowserRussianRouter from 'browser-russian-router';

export default class Switch extends React.PureComponent {
    render () {
        const {matchObjects} = this.state;
        const {renderPayload, renderError} = this.props;

        try {
            if (typeof renderPayload === 'function') {
                return renderPayload(matchObjects);
            } else {
                return this.renderPayload(matchObjects);
            }
        } catch (error) {
            if (typeof renderError === 'function') {
                return renderError(error);
            } else {
                return this.renderError(error);
            }
        }
    }

    renderError (error) {
        console.error(error);
        return null;
    }

    renderPayload (matchObjects) {
        const matchObject = matchObjects[0];
        if (!matchObject) {
            throw 'Switch cannot render matchObject!';
        }
        const Payload = matchObject.payload;
        if (Payload instanceof React.Component || typeof Payload === 'function') {
            return <Payload matchObject={matchObject} />
        } else if (Payload === undefined) {
            return null;
        } else {
            return Payload;
        }
    }

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

    _onUriChange () {
        const {router} = this.context;
        const matchObjects = router.getMatchObjects();
        this.setState({matchObjects});
    }
}

Switch.contextTypes = {
    router: PropTypes.instanceOf(BrowserRussianRouter).isRequired
};

Switch.propTypes = {
    renderPayload: PropTypes.func,
    renderError: PropTypes.func
};
