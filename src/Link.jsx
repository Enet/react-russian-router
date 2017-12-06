import React from 'react';
import PropTypes from 'prop-types';
import BrowserRussianRouter from 'browser-russian-router';

const isLeftButtonClick = (event) => {
    return event.button === 0;
};

const isMetaKeyPressed = (event) => {
    return event.metaKey || event.ctrlKey || event.altKey || event.shiftKey;
};

export default class Link extends React.PureComponent {
    render () {
        const href = this._generateUri();
        return <a
            {...this.props}
            name={null}
            params={null}
            action={null}
            href={href}
            className={this._getClassName()}
            onClick={this._onClick.bind(this, href)}>
            {this.props.children}
        </a>
    }

    _getClassName () {
        const {className} = this.props;
        return (className || '') + '';
    }

    _generateUri () {
        const {href, name, params} = this.props;
        if (!name) {
            return href;
        }

        const {router} = this.context;
        return router.generateUri(name, params);
    }

    _onClick (uri, event) {
        const {onClick} = this.props;
        if (onClick) {
            onClick(event);
        }
        if (event.defaultPrevented) {
            return;
        }
        if (this.props.target !== '_self') {
            return;
        }
        if (!isLeftButtonClick(event)) {
            return;
        }
        if (isMetaKeyPressed(event)) {
            return;
        }

        event.preventDefault();
        const {router} = this.context;
        const {action} = this.props;
        if (action === 'replace') {
            router.replaceUri(uri);
        } else {
            router.pushUri(uri);
        }
    }
}

Link.contextTypes = {
    router: PropTypes.instanceOf(BrowserRussianRouter).isRequired
};

Link.propTypes = {
    href: PropTypes.string,
    name: PropTypes.string,
    params: PropTypes.object,
    action: PropTypes.oneOf(['replace', 'push']),
    target: PropTypes.string,
    onClick: PropTypes.func
};

Link.defaultProps = {
    action: 'push',
    target: '_self'
};
