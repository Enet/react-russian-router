import React from 'react';
import PropTypes from 'prop-types';
import UniversalRussianRouter from './UniversalRussianRouter';

export default class ReactRussianRouter extends React.PureComponent {
    render () {
        return this.props.children;
    }

    getChildContext () {
        const router = this._router;
        const {feedback} = this.props;
        return {router, feedback};
    }

    componentWillMount () {
        const {routes, options} = this.props;
        const router = new UniversalRussianRouter(routes, options, this.props.request);
        let redirectChain = [];
        router.resetRedirectChain = () => redirectChain = [];
        router.getRedirectChain = () => redirectChain;
        router.increaseRedirectChain = (uri) => redirectChain.push(uri);

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

    _onUriChange (event) {
        const router = this._router;
        const matchObjects = router.getMatchObjects();
        this.setState({matchObjects});

        const {onUriChange} = this.props;
        event && onUriChange && onUriChange(event);
    }
}

ReactRussianRouter.childContextTypes = {
    router: PropTypes.instanceOf(UniversalRussianRouter),
    feedback: PropTypes.object
};

ReactRussianRouter.propTypes = {
    routes: PropTypes.objectOf(PropTypes.shape({
        uri: PropTypes.string,
        payload: PropTypes.any,
        params: PropTypes.object,
        options: PropTypes.object
    })),
    options: PropTypes.object,
    request: PropTypes.object,
    feedback: PropTypes.object,
    onUriChange: PropTypes.func
};

ReactRussianRouter.defaultProps = {
    routes: {},
    options: {}
};
