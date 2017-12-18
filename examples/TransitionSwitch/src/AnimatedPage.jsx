import React from 'react';

import './AnimatedPage.css';

export default class AnimatedPage extends React.PureComponent {
    getClassName () {
        return [
            'animated-page',
            'animated-page_enter_' + this.state.enter,
            'animated-page_leave_' + this.state.leave
        ].join(' ');
    }

    componentWillMount () {
        this._enterTimerId = null;
        this._leaveTimerId = null;
        this.setState({
            enter: 'none',
            leave: 'none'
        });
    }

    componentBeforeEnter () {
        const enter = 'before';
        this.setState({enter});
    }

    componentWillEnter (callback) {
        const enter = 'in-progress';
        this.setState({enter}, () => {
            this._enterTimerId = callback(2000);
        });
    }

    componentDidEnter () {
        const enter = 'none';
        this.setState({enter});
    }

    componentBeforeLeave () {
        const leave = 'before';
        this.setState({leave});
    }

    componentWillLeave (callback) {
        const leave = 'in-progress';
        this.setState({leave}, () => {
            this._leaveTimerId = callback(2000);
        });
    }

    componentDidLeave () {
        const leave = 'none';
        this.setState({leave});
    }

    componentWillUnmount () {
        clearTimeout(this._enterTimerId);
        clearTimeout(this._leaveTimerId);
    }
}
