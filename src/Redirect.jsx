import React from 'react';
import PropTypes from 'prop-types';
import BrowserRussianRouter from 'browser-russian-router';
import Link from './Link';

export default class Redirect extends React.PureComponent {
    render () {
        return null;
    }

    componentDidMount () {
        const {router} = this.context;
        const redirectChain = router.getRedirectChain();
        const uri = this._generateUri();

        if (redirectChain.indexOf(uri) !== -1) {
            let redirectError = 'Redirect loop was detected!\n';
            redirectError += redirectChain.join('\n');
            redirectError += '\n' + uri + ' again...';
            throw redirectError;
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
    router: PropTypes.instanceOf(BrowserRussianRouter)
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
