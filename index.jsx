import React from 'react';
import BrowserRussianRouter from 'browser-russian-router';

export default class ReactRussianRouter extends React.PureComponent {
    render () {
        return <div>
            Hello world
        </div>
    }

    componentWillMount () {
        const {routes, options} = this.props;
        this._router = new BrowserRussianRouter(routes, options);
    }

    componentWillUnmount () {
        this._router.destructor();
    }
}

export {ReactRussianRouter};
