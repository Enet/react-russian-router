import React from 'react';
import PropTypes from 'prop-types';
import Switch from './Switch';

export default class TransitionSwitch extends Switch {
    constructor () {
        super(...arguments);
        this.state = {
            matchObjects: [],
            hiddenObjects: []
        };
    }

    render () {
        const {matchObjects, hiddenObjects} = this.state;
        const rawChildren = [
            this.renderMatchObjects(hiddenObjects.length ? hiddenObjects : [{}]),
            this.renderMatchObjects(matchObjects)
        ];

        const processedChildren = [];
        React.Children.forEach(rawChildren, (child, c) => {
            if (!React.isValidElement(child)) {
                return processedChildren.push(child);
            }
            const childPrototype = child.type.prototype;
            if (!childPrototype.isReactComponent) {
                return processedChildren.push(child);
            }
            if (!child.props.matchObject || !child.props.matchObject.name) {
                child = React.cloneElement(child, {
                    key: 'ReactRussianRouter/TransitionSwitch/' + c
                });
                return processedChildren.push(child);
            }
            if (!childPrototype.componentBeforeEnter &&
                !childPrototype.componentWillEnter &&
                !childPrototype.componentDidEnter &&
                !childPrototype.componentBeforeLeave &&
                !childPrototype.componentWillLeave &&
                !childPrototype.componentDidLeave) {
                return processedChildren.push(child);
            }
            const routeName = child.props.matchObject.name;
            child = React.cloneElement(child, {
                ref: this._onChildRef.bind(this, routeName),
                key: routeName
            });
            return processedChildren.push(child);
        });

        return processedChildren;
    }

    componentWillMount () {
        this._onChildRef = this._onChildRef.bind(this);
        this._isAnimationEnabled = this.props.transitionOnAppear;
        this._componentRefs = {};
        this._componentStates = {};
        super.componentWillMount();
    }

    componentWillUnmount () {
        super.componentWillUnmount();
        cancelAnimationFrame(this._animationFrame);
        clearTimeout(this._animationTimer);
    }

    _onAnimationTimerTick () {
        this._isAnimationEnabled = true;
    }

    _onAnimationFrame (routeName) {
        const component = this._componentRefs[routeName];
        if (component && component.componentWillEnter) {
            component.componentWillEnter(this._onEnterComplete.bind(this, routeName));
            this._componentStates[routeName] = 'enter';
        }
    }

    _onEnterComplete (routeName) {
        const component = this._componentRefs[routeName];
        if (component && component.componentDidEnter) {
            component.componentDidEnter();
        }
        this._componentStates[routeName] = null;
    }

    _onLeaveComplete (routeName) {
        const component = this._componentRefs[routeName];
        if (component && component.componentDidLeave) {
            component.componentDidLeave();
        }
        this._componentStates[routeName] = null;

        this._componentRefs[routeName] = null;
        const hiddenObjects = this.state.hiddenObjects.filter((hiddenObject) => {
            return hiddenObject.name !== routeName;
        });
        this.setState({hiddenObjects});
    }

    _onChildRef (routeName, component) {
        if (!component) {
            return;
        }

        const prevComponent = this._componentRefs[routeName];
        this._componentRefs[routeName] = component;
        if (prevComponent) {
            return;
        }
        if (!this._isAnimationEnabled) {
            this._animationTimer = setTimeout(this._onAnimationTimerTick.bind(this));
            return;
        }

        if (this.props.transitionOnAppear) {
            this._animationFrame = requestAnimationFrame(this._onAnimationFrame.bind(this, routeName));
        } else {
            this._onAnimationFrame(routeName);
        }
    }

    _onUriChange () {
        const {router} = this.context;
        const matchObjects = router.getMatchObjects();
        const matchObjectKeys = matchObjects.map((matchObject) => matchObject.name);
        const prevMatchObjects = this.state.matchObjects;
        const prevHiddenObjects = this.state.hiddenObjects;
        const hiddenObjects = [];

        prevHiddenObjects.forEach((prevHiddenObject) => {
            const routeName = prevHiddenObject.name;
            const index = matchObjectKeys.indexOf(routeName);
            if (index === -1) {
                hiddenObjects.push(prevHiddenObject);
            } else {
                const component = this._componentRefs[routeName];
                component && component.componentDidLeave && component.componentDidLeave();
                component && component.componentWillEnter && component.componentWillEnter(this._onEnterComplete.bind(this, routeName));
            }
        });
        prevMatchObjects.forEach((prevMatchObject) => {
            const routeName = prevMatchObject.name;
            const index = matchObjectKeys.indexOf(routeName);
            if (index === -1) {
                hiddenObjects.push(prevMatchObject);
                const component = this._componentRefs[routeName];
                if (component && component.componentWillLeave) {
                    this._componentStates[routeName] = 'leave';
                    component.componentWillLeave(this._onLeaveComplete.bind(this, routeName));
                }
            }
        });

        this.setState({
            matchObjects,
            hiddenObjects
        });
    }
}

TransitionSwitch.propTypes = {
    transitionOnAppear: PropTypes.bool
};

TransitionSwitch.defaultProps = {
    transitionOnAppear: false
};
