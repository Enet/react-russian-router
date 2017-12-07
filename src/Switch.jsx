import React from 'react';
import PropTypes from 'prop-types';
import BrowserRussianRouter from 'browser-russian-router';

export default class Switch extends React.PureComponent {
    constructor () {
        super();
        const matchObjects = [];
        this.state = {matchObjects};
    }

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
        this._matchError = error;
        console.error(error);
        return null;
    }

    renderContent (matchObjects) {
        if (!matchObjects.length) {
            throw 'Switch cannot render matchObject!';
        }
        return matchObjects
            .slice(0, Math.max(0, this.props.childLimit))
            .map((matchObject) => this.renderPayload(matchObject));
    }

    renderPayload (matchObject) {
        const Payload = this._extractPayloadNode(matchObject);
        const payloadProps = this._extractPayloadProps(matchObject);
        if (Payload instanceof React.Component || typeof Payload === 'function') {
            return <Payload {...payloadProps} />
        } else if (Payload === undefined) {
            return null;
        } else if (React.isValidElement(Payload)) {
            return React.cloneElement(Payload, payloadProps);
        } else {
            return Payload;
        }
    }

    componentWillMount () {
        const {renderContent} = this.props;
        if (typeof renderContent === 'function') {
            this.renderContent = renderContent;
        }

        this._errorId = 0;
        this._matchError = null;
        this._onUriChange = this._onUriChange.bind(this);
        this._onUriChange();
    }

    componentDidMount () {
        const {router} = this.context;
        router.addListener('change', this._onUriChange);
        this.componentDidUpdate();
    }

    componentDidUpdate () {
        if (!this._matchError) {
            this._restoreScroll();
            return;
        }
        this._errorId++;
        this._matchError && this._throwError();
    }

    componentWillUnmount () {
        const {router} = this.context;
        router.removeListener('change', this._onUriChange);
    }

    _extractPayloadNode (matchObject) {
        return matchObject.payload;
    }

    _extractPayloadProps (matchObject) {
        const {key} = matchObject;
        return {key, matchObject};
    }

    _getMatchObjects () {
        const {router} = this.context;
        const matchObjects = router.getMatchObjects();
        return matchObjects;
    }

    _restoreScroll () {
        const {router} = this.context;
        const navigationKey = router.getNavigationKey();
        if (navigationKey !== this._navigationKey) {
            this._navigationKey = navigationKey;
            router.restoreScroll();
        }
    }

    _throwError (section='match') {
        const error = this['_' + section + 'Error'];
        const errorName = 'ReactRussianRouter/Switch/Error';
        const errorKey = errorName + '~' + this._errorId;
        const errorObject = {
            name: errorName,
            key: errorKey,
            payload: this.props.renderError,
            data: null,
            error
        };
        this.setState({
            [section + 'Keys']: [errorKey],
            [section + 'Objects']: [errorObject]
        });
        this['_' + section + 'Error'] = null;

        const {onError} = this.props;
        const type = 'error';
        onError && onError({type, error, section});
    }

    _emitUriChange (matchObjects) {
        const {onUriChange} = this.props;
        const type = 'urichange';
        onUriChange && onUriChange({type, matchObjects});
    }

    _onUriChange () {
        const matchObjects = this._getMatchObjects();
        this.setState({matchObjects});
        this._emitUriChange(matchObjects);
    }
}

Switch.contextTypes = {
    router: PropTypes.instanceOf(BrowserRussianRouter).isRequired
};

Switch.propTypes = {
    childLimit: PropTypes.number,
    renderContent: PropTypes.func,
    renderError: PropTypes.func,
    onUriChange: PropTypes.func,
    onError: PropTypes.func
};

Switch.defaultProps = {
    childLimit: 1
};
