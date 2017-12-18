import React from 'react';

export default class Spinner extends React.PureComponent {
    render () {
        return <div className="spinner">
            {this.state.number}
        </div>
    }

    componentWillMount () {
        this._onNumberTimerTick = this._onNumberTimerTick.bind(this);
        this.setState({
            number: 0
        });
    }

    componentDidMount () {
        this._onNumberTimerTick();
    }

    componentWillUnmount () {
        clearTimeout(this._numberTimerId);
    }

    _onNumberTimerTick () {
        const number = this.state.number + 1;
        this.setState({number});
        this._numberTimerId = setTimeout(this._onNumberTimerTick, 50);
    }
}
