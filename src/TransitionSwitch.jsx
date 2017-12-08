import React from 'react';
import PropTypes from 'prop-types';
import Switch from './Switch';

export default class TransitionSwitch extends Switch {
    constructor () {
        super();
        this.state = {
            matchObjects: [],
            matchKeys: [],
            hiddenObjects: [],
            hiddenKeys: []
        };
    }

    render () {
        const {matchObjects, matchKeys, hiddenObjects, hiddenKeys} = this.state;
        const rawHiddenChildren = this.renderMatchObjects(hiddenObjects);
        const rawMatchChildren = this.renderMatchObjects(matchObjects);
        const processedHiddenChildren = this.renderProcessedChildren(rawHiddenChildren, hiddenKeys);
        const processedMatchChildren = this.renderProcessedChildren(rawMatchChildren, matchKeys);

        return processedHiddenChildren.concat(processedMatchChildren);
    }

    renderProcessedChildren (rawChildren, rawKeys) {
        const processedChildren = [];

        React.Children.forEach(rawChildren, (child, c) => {
            if (!React.isValidElement(child) || typeof child.type === 'string') {
                return processedChildren.push(child);
            }
            const childPrototype = child.type.prototype;
            if (!childPrototype.isReactComponent ||
                !child.props.matchObject ||
                !child.props.matchObject.name) {
                return processedChildren.push(React.Children.map(child, (c) => c));
            }
            if (!childPrototype.componentBeforeEnter &&
                !childPrototype.componentWillEnter &&
                !childPrototype.componentDidEnter &&
                !childPrototype.componentBeforeLeave &&
                !childPrototype.componentWillLeave &&
                !childPrototype.componentDidLeave) {
                return processedChildren.push(React.Children.map(child, (c) => c));
            }
            const objectKey = rawKeys[c];
            child = React.cloneElement(child, {
                ref: (component) => this._onChildRef(objectKey, component),
                key: objectKey
            });
            return processedChildren.push(child);
        });

        return processedChildren;
    }

    renderError (matchObjects, error) {
        if (matchObjects === this.state.matchObjects) {
            this._matchError = error;
        } else {
            this._hiddenError = error;
        }
        console.error(error);
        return null;
    }

    renderContent (matchObjects) {
        let childLimit = Infinity;
        if (matchObjects === this.state.matchObjects) {
            childLimit = this.props.childLimit;
            if (!matchObjects.length) {
                throw 'Switch cannot render matchObjects!';
            }
        }
        return matchObjects
            .slice(0, Math.max(0, childLimit))
            .map((matchObject) => this.renderPayload(matchObject));
    }

    componentWillMount () {
        this._isAnimationEnabled = this.props.transitionOnAppear;
        this._componentRefs = {};
        this._componentStates = {};
        this._componentAnimationFrames = {};
        this._routeIds = {};
        this._callbackTimers = [];
        this._hiddenError = null;

        super.componentWillMount();
    }

    componentDidMount () {
        super.componentDidMount();
        this._animationTimer = setTimeout(this._onAnimationTimerTick.bind(this));
    }

    componentDidUpdate () {
        if (!this._matchError && !this._hiddenError) {
            this._restoreScroll();
            return;
        }
        this._errorId++;
        this._matchError && this._throwError('match');
        this._hiddenError && this._throwError('hidden');
    }

    componentWillUnmount () {
        const componentAnimationFrames = this._componentAnimationFrames;
        for (let objectKey in componentAnimationFrames) {
            cancelAnimationFrame(componentAnimationFrames[objectKey]);
        }

        const componentStates = this._componentStates;
        for (let objectKey in componentStates) {
            const componentState = componentStates[objectKey];
            if (componentState === 'enter') {
                this._onEnterComplete(objectKey);
            } else if (componentState === 'leave') {
                this._onLeaveComplete(objectKey);
            }
        }

        clearTimeout(this._animationTimer);
        const callbackTimers = this._callbackTimers;
        for (let callbackTimer of callbackTimers) {
            clearTimeout(callbackTimer);
        }

        super.componentWillUnmount();
    }

    _getComponentRef (objectKey) {
        return this._componentRefs[objectKey];
    }

    _setComponentRef (objectKey, component) {
        this._componentRefs[objectKey] = component;
    }

    _makeEnter (objectKey, component) {
        component.isComponentMounted &&
        component.componentBeforeEnter &&
        component.componentBeforeEnter();
        if (component.componentWillEnter) {
            this._componentAnimationFrames[objectKey] = requestAnimationFrame(this._onEnterStart.bind(this, objectKey));
        } else if (component.componentDidEnter) {
            this._componentStates[objectKey] = 'enter';
            this._onEnterComplete(objectKey);
        }
    }

    _makeLeave (objectKey, component) {
        this._onEnterComplete(objectKey);
        component.isComponentMounted &&
        component.componentBeforeLeave &&
        component.componentBeforeLeave();
        if (component.componentWillLeave) {
            this._componentAnimationFrames[objectKey] = requestAnimationFrame(this._onLeaveStart.bind(this, objectKey));
        } else {
            this._onLeaveComplete(objectKey);
        }
    }

    _onUriChange () {
        const {router} = this.context;
        const prevMatchObjects = this.state.matchObjects;
        const prevMatchKeys = this.state.matchKeys;
        const prevHiddenObjects = this.state.hiddenObjects;
        const prevHiddenKeys = this.state.hiddenKeys;
        const matchObjects = this._getMatchObjects();
        const matchKeys = [];
        const hiddenObjects = prevHiddenObjects.slice();
        const hiddenKeys = prevHiddenKeys.slice();

        matchObjects.forEach((matchObject) => {
            const routeName = matchObject.name;
            if (!this._routeIds[routeName]) {
                this._routeIds[routeName] = 1;
            }
            const objectIndex = prevMatchObjects.findIndex((prevMatchObject) => prevMatchObject.name === routeName);
            if (objectIndex === -1) {
                matchKeys.push(matchObject.key + '~' + router.getNavigationKey());
            } else {
                matchKeys.push(prevMatchKeys[objectIndex]);
            }
        });

        prevMatchObjects.forEach((prevMatchObject, p) => {
            const routeName = prevMatchObject.name;
            const objectKey = prevMatchKeys[p];
            const objectIndex = matchKeys.indexOf(objectKey);
            if (objectIndex !== -1) {
                return;
            }
            const component = this._getComponentRef(objectKey);
            if (!component) {
                return;
            }
            hiddenObjects.push(prevMatchObject);
            hiddenKeys.push(objectKey);
            this._makeLeave(objectKey, component);
        });

        this.setState({
            matchObjects,
            matchKeys,
            hiddenObjects,
            hiddenKeys
        });

        this._emitUriChange(matchObjects);
    }

    _onChildRef (objectKey, component) {
        if (!component) {
            return false;
        }

        const prevComponent = this._getComponentRef(objectKey);
        if (component !== prevComponent) {
            this._setComponentRef(objectKey, component);
            component.isComponentMounted = true;
            const {componentWillUnmount} = component;
            component.componentWillUnmount = () => {
                component.isComponentMounted = false;
                typeof componentWillUnmount === 'function' && componentWillUnmount.call(component);
            };
        }
        if (prevComponent) {
            return false;
        }

        if (!this._isAnimationEnabled) {
            return false;
        }

        this._makeEnter(objectKey, component);
        return true;
    }

    _onAnimationTimerTick () {
        this._isAnimationEnabled = true;
    }

    _onTransitionCallback (callbackName, objectKey, transitionDuration) {
        if (+transitionDuration > 0) {
            const callbackTimer = setTimeout(this[callbackName].bind(this, objectKey), +transitionDuration);
            this._callbackTimers.push(callbackTimer);
            return callbackTimer;
        } else {
            this[callbackName](objectKey);
        }
    }

    _onEnterStart (objectKey) {
        const component = this._getComponentRef(objectKey);
        if (!component) {
            return false;
        }
        this._componentAnimationFrames[objectKey] = null;
        this._componentStates[objectKey] = 'enter';
        component.isComponentMounted &&
        component.componentWillEnter &&
        component.componentWillEnter(this._onTransitionCallback.bind(this, '_onEnterComplete', objectKey));

        const {onEnterStart} = this.props;
        const {matchObjects, hiddenObjects} = this.state;
        const type = 'enterstart';
        onEnterStart && onEnterStart({type, component, matchObjects, hiddenObjects});
        return true;
    }

    _onEnterComplete (objectKey) {
        const component = this._getComponentRef(objectKey);
        if (!component) {
            return false;
        }
        if (this._componentStates[objectKey] !== 'enter') {
            return false;
        }
        this._componentStates[objectKey] = null;
        component.isComponentMounted &&
        component.componentDidEnter &&
        component.componentDidEnter();

        const {onEnterEnd} = this.props;
        const {matchObjects, hiddenObjects} = this.state;
        const type = 'enterend';
        onEnterEnd && onEnterEnd({type, component, matchObjects, hiddenObjects});
        return true;
    }

    _onLeaveStart (objectKey) {
        const component = this._getComponentRef(objectKey);
        if (!component) {
            return false;
        }
        this._componentAnimationFrames[objectKey] = null;
        this._componentStates[objectKey] = 'leave';
        component.isComponentMounted &&
        component.componentWillLeave &&
        component.componentWillLeave(this._onTransitionCallback.bind(this, '_onLeaveComplete', objectKey));

        const {onLeaveStart} = this.props;
        const {matchObjects, hiddenObjects} = this.state;
        const type = 'leavestart';
        onLeaveStart && onLeaveStart({type, component, matchObjects, hiddenObjects});
        return true;
    }

    _onLeaveComplete (objectKey) {
        const component = this._getComponentRef(objectKey);
        if (!component) {
            return false;
        }
        this._componentStates[objectKey] = null;
        component.isComponentMounted &&
        component.componentDidLeave &&
        component.componentDidLeave();

        this._setComponentRef(objectKey, null);
        const objectIndex = this.state.hiddenKeys.indexOf(objectKey);
        const hiddenObjects = this.state.hiddenObjects.slice();
        const hiddenKeys = this.state.hiddenKeys.slice();
        hiddenObjects.splice(objectIndex, 1);
        hiddenKeys.splice(objectIndex, 1);
        this.setState({
            hiddenObjects,
            hiddenKeys
        });

        const {onLeaveEnd} = this.props;
        const {matchObjects} = this.state;
        const type = 'leaveend';
        onLeaveEnd && onLeaveEnd({type, component, matchObjects, hiddenObjects});
        return true;
    }
}

TransitionSwitch.propTypes = {
    childLimit: PropTypes.number,
    transitionOnAppear: PropTypes.bool,
    errorComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    onUriChange: PropTypes.func,
    onError: PropTypes.func,
    onEnterStart: PropTypes.func,
    onEnterEnd: PropTypes.func,
    onLeaveStart: PropTypes.func,
    onLeaveEnd: PropTypes.func
};

TransitionSwitch.defaultProps = {
    childLimit: 1,
    transitionOnAppear: false
};
