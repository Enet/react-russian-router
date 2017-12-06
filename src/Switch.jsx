import React from 'react';
import PropTypes from 'prop-types';
import BrowserRussianRouter from 'browser-russian-router';

export default class Switch extends React.PureComponent {
    render () {
        const {matchObjects} = this.state;
        return this.renderMatchObjects(matchObjects);
    }

    renderMatchObjects (matchObjects) {
        try {
            return this.renderContent(matchObjects);
        } catch (error) {
            return this.renderError(matchObjects, error);
        }
    }

    renderError (matchObjects, error) {
        console.error(error);
        return null;
    }

    renderContent (matchObjects) {
        const matchObject = matchObjects[0];
        if (!matchObject) {
            throw 'Switch cannot render matchObject!';
        }
        return this.renderPayload(matchObject);
    }

    renderPayload (matchObject) {
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
        const {renderContent, renderError} = this.props;
        if (typeof renderContent === 'function') {
            this.renderContent = renderContent;
        }
        if (typeof renderError === 'function') {
            this.renderError = renderError;
        }

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
    renderContent: PropTypes.func,
    renderError: PropTypes.func
};
