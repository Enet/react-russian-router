import React from 'react';
import PropTypes from 'prop-types';
import TransitionSwitch from './TransitionSwitch';

export default class ProgressSwitch extends TransitionSwitch {
    constructor () {
        super(...arguments);
        this.state.currentTime = Date.now();
    }

    render () {
        return super.render(...arguments);
    }

    renderProcessedChildren (rawChildren, rawKeys) {
        const processedChildren = [];

        React.Children.forEach(rawChildren, (child, c) => {
            if (!React.isValidElement(child)) {
                return processedChildren.push(child);
            }
            if (!child.props.matchObject ||
                !child.props.matchObject.name) {
                return processedChildren.push(React.Children.map(child, (c) => c));
            }
            const objectKey = rawKeys[c];
            child = React.cloneElement(child, {
                ref: (component) => this._onChildRef(objectKey, component),
                key: objectKey,
                transitionProgress: this._getTransitionProgress(objectKey)
            });
            return processedChildren.push(child);
        });

        return processedChildren;
    }

    componentWillMount () {
        if (+this.props.progressEasing(0) !== 0 ||
            +this.props.progressEasing(100) !== 100) {
            throw 'Prop progressEasing must be presented by function that returns 0 for 0, 100 for 100!';
        }
        if ((+this.props.transitionDuration > 0) === false) {
            throw 'Prop transitionDuration must be presented by positive number!';
        }
        super.componentWillMount();
        this._componentStartTimes = {};
    }

    componentDidUpdate () {
        const {transitionDuration} = this.props;
        const {hiddenKeys} = this.state;
        const currentTime = Date.now();
        let shouldUpdateTime = false;
        for (let objectKey in this._componentStartTimes) {
            const isHidden = hiddenKeys.indexOf(objectKey) !== -1;
            const transitionStartTime = this._componentStartTimes[objectKey];
            if (currentTime - transitionStartTime < transitionDuration) {
                shouldUpdateTime = true;
            } else if (isHidden) {
                this._onLeaveComplete(objectKey);
            } else {
                this._onEnterComplete(objectKey);
            }
        }


        if (!shouldUpdateTime) {
            return;
        }
        cancelAnimationFrame(this._updateAnimationFrame);
        this._updateAnimationFrame = requestAnimationFrame(() => {
            const currentTime = Date.now();
            this.setState({currentTime});
        });
    }

    componentWillUnmount () {
        cancelAnimationFrame(this._updateAnimationFrame);
        super.componentWillUnmount();
    }

    _getRawProgress (objectKey) {
        const {transitionDuration} = this.props;
        const transitionStartTime = this._componentStartTimes[objectKey];
        const transitionCurrentTime = this.state.currentTime;
        const rawProgress = Math.max(0, Math.min(100, 100 * (transitionCurrentTime - transitionStartTime) / transitionDuration));
        return rawProgress;
    }

    _getTransitionProgress (objectKey) {
        const isHidden = this.state.hiddenKeys.indexOf(objectKey) !== -1;
        const isAnimating = this._componentStartTimes.hasOwnProperty(objectKey);
        const rawProgress = isAnimating ? this._getRawProgress(objectKey) : 100;
        const processedProgress = +this.props.progressEasing(isHidden ? 100 - rawProgress : rawProgress) || 0;
        return processedProgress;
    }

    _makeEnter (objectKey, component) {
        component.componentBeforeEnter && component.componentBeforeEnter();
        this._onEnterStart(objectKey);
    }

    _makeLeave (objectKey, component) {
        component.componentBeforeLeave && component.componentBeforeLeave();
        this._onLeaveStart(objectKey);
    }

    _onUriChange () {
        super._onUriChange(...arguments);
        const currentTime = Date.now();
        this.setState({currentTime});
    }

    _onChildRef () {
        if (!super._onChildRef(...arguments)) {
            return false;
        }
        const currentTime = Date.now();
        this.setState({currentTime});
        return true;
    }

    _onTransitionCallback () {

    }

    _onEnterStart (objectKey) {
        if (!super._onEnterStart(...arguments)) {
            return false;
        }
        this._componentStartTimes[objectKey] = Date.now();
        return true;
    }

    _onEnterComplete (objectKey) {
        this._componentStates[objectKey] = 'enter';
        if (!super._onEnterComplete(...arguments)) {
            return false;
        }
        delete this._componentStartTimes[objectKey];
        return true;
    }

    _onLeaveStart (objectKey) {
        if (!super._onLeaveStart(...arguments)) {
            return false;
        }
        this._componentStartTimes[objectKey] = Date.now();
        return true;
    }

    _onLeaveComplete (objectKey) {
        if (!super._onLeaveComplete(...arguments)) {
            return false;
        }
        delete this._componentStartTimes[objectKey];
        const currentTime = Date.now();
        this.setState({currentTime});
        return true;
    }
}

ProgressSwitch.propTypes = {
    transitionOnAppear: PropTypes.bool,
    transitionDuration: PropTypes.number,
    progressEasing: PropTypes.func
};

ProgressSwitch.defaultProps = {
    transitionOnAppear: false,
    transitionDuration: 1000,
    progressEasing: (progress) => progress
};
