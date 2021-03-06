import React from 'react';
import PropTypes from 'prop-types';
import UniversalRussianRouter from './UniversalRussianRouter';

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
        this._matchError = (error || '') + '';
        // eslint-disable-next-line
        console.error(error);
        return null;
    }

    renderContent (matchObjects) {
        const contentNodes = matchObjects
            .slice(0, Math.max(0, this.props.childLimit))
            .filter((matchObject) => !!matchObject.payload || !!matchObject.error)
            .map((matchObject) => this.renderPayload(matchObject));
        if (!contentNodes.length) {
            throw new Error('Switch cannot render matchObjects!');
        }
        return contentNodes;
    }

    renderPayload (matchObject) {
        const Payload = this._extractPayloadNode(matchObject);
        const payloadProps = this._extractPayloadProps(matchObject);
        return this.renderComponent(Payload, payloadProps);
    }

    renderComponent (Component, props) {
        if (Component instanceof React.Component || typeof Component === 'function') {
            return <Component {...props} />
        } else if (Component === undefined) {
            return null;
        } else if (React.isValidElement(Component)) {
            return React.cloneElement(Component, typeof Component.type === 'string' ? {
                key: props.key
            } : props);
        } else {
            return Component;
        }
    }

    componentWillMount () {
        this._errorId = 0;
        this._matchError = (this.props.initialError || '') + '';
        this._onUriChange = this._onUriChange.bind(this);
        if (this._matchError) {
            this._throwError();
        } else {
            this._onUriChange();
        }
    }

    componentDidMount () {
        const {router} = this.context;
        router.addListener('change', this._onUriChange);
        this.componentDidUpdate();
    }

    componentDidUpdate () {
        if (!this._matchError) {
            this._restoreScroll();
            const {router} = this.context;
            router.resetRedirectChain();
            return;
        }
        this._throwError();
    }

    componentDidCatch (error) {
        this._matchError = (error || '') + '';
        this._throwError();
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
        const errorKey = errorName + '~' + this._errorId++;
        const errorObject = {
            name: errorName,
            key: errorKey,
            payload: this.props.errorComponent,
            data: null,
            error
        };

        this['_' + section + 'Error'] = null;
        this.state[section + 'Keys'] = [errorKey];
        this.state[section + 'Objects'] = [errorObject];
        this.forceUpdate();

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
    router: PropTypes.instanceOf(UniversalRussianRouter).isRequired
};

Switch.propTypes = {
    childLimit: PropTypes.number,
    errorComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    initialError: PropTypes.any,
    onUriChange: PropTypes.func,
    onError: PropTypes.func
};

Switch.defaultProps = {
    childLimit: 1
};
