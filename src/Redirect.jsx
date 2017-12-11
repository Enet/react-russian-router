import React from 'react';
import PropTypes from 'prop-types';
import UniversalRussianRouter from './UniversalRussianRouter';
import Link from './Link';

export default class Redirect extends React.PureComponent {
    render () {
        return null;
    }

    componentWillMount () {
        if (typeof window !== 'undefined') {
            return;
        }
        const {feedback} = this.context;
        if (!feedback || feedback.redirect) {
            return;
        }
        const uri = this._generateUri();
        feedback.redirect = uri;
    }

    componentDidMount () {
        const {router} = this.context;
        const redirectChain = router.getRedirectChain();
        const uri = this._generateUri();

        if (redirectChain.indexOf(uri) !== -1) {
            let redirectError = 'Redirect loop was detected!\n';
            redirectError += redirectChain.join('\n');
            redirectError += '\n' + uri + ' again...';
            throw new Error(redirectError);
        }

        router.increaseRedirectChain(uri);
        if (this.props.action === 'push') {
            router.pushUri(uri);
        } else {
            router.replaceUri(uri);
        }
    }

    _generateUri () {
        return Link.prototype._generateUri.call(this, ...arguments);
    }
}

Redirect.contextTypes = {
    router: PropTypes.instanceOf(UniversalRussianRouter),
    feedback: PropTypes.object
};

Redirect.propTypes = {
    href: PropTypes.string,
    name: PropTypes.string,
    params: PropTypes.object,
    action: PropTypes.oneOf(['replace', 'push'])
};

Redirect.defaultProps = {
    action: 'replace'
};
