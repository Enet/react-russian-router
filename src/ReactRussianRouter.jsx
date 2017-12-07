import React from 'react';
import PropTypes from 'prop-types';
import BrowserRussianRouter from 'browser-russian-router';

export default class ReactRussianRouter extends React.PureComponent {
    render () {
        return this.props.children;
    }

    getChildContext () {
        const {matchObjects} = this.state;
        return {
            router: this._router
        };
    }

    componentWillMount () {
        const {routes, options} = this.props;
        const router = new BrowserRussianRouter(routes, options);
        this._router = router;
        this._onUriChange = this._onUriChange.bind(this);
        this._onUriChange();
    }

    componentDidMount () {
        const router = this._router;
        router.addListener('change', this._onUriChange);
    }

    componentWillUnmount () {
        const router = this._router;
        router.removeListener('change', this._onUriChange);
        router.destructor();
    }

    _onUriChange () {
        const router = this._router;
        const matchObjects = router.getMatchObjects();
        this.setState({matchObjects});
    }
}

ReactRussianRouter.childContextTypes = {
    router: PropTypes.instanceOf(BrowserRussianRouter)
};

ReactRussianRouter.propTypes = {
    routes: PropTypes.objectOf(PropTypes.shape({
        uri: PropTypes.string,
        payload: PropTypes.any,
        params: PropTypes.object,
        options: PropTypes.object
    })),
    options: PropTypes.object
};

ReactRussianRouter.defaultProps = {
    routes: {},
    options: {}
};
