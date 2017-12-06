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

        this._errorId = 0;
        this._matchError = null;
        this._onUriChange = this._onUriChange.bind(this);
        this._onUriChange();
    }

    componentDidMount () {
        const {router} = this.context;
        router.addListener('change', this._onUriChange);
    }

    componentDidUpdate () {
        if (!this._matchError) {
            return;
        }
        this._errorId++;
        this._matchError && this._throwError();
    }

    componentWillUnmount () {
        const {router} = this.context;
        router.removeListener('change', this._onUriChange);
    }

    _throwError (section='match') {
        const errorKey = 'ReactRussianRouter/Error~' + this._errorId;
        const errorObject = {
            name: errorKey,
            payload: this.props.renderError,
            error: this['_' + section + 'Error']
        };
        this.setState({
            [section + 'Keys']: [errorKey],
            [section + 'Objects']: [errorObject]
        });
        this['_' + section + 'Error'] = null;
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
