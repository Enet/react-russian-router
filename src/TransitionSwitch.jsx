import React from 'react';
import PropTypes from 'prop-types';
import Switch from './Switch';

export default class TransitionSwitch extends Switch {
    constructor () {
        super(...arguments);
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
            if (!React.isValidElement(child)) {
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

    renderContent (matchObjects) {
        if (matchObjects === this.state.matchObjects && !matchObjects.length) {
            throw 'Switch cannot render matchObjects!';
        }
        return matchObjects.map((matchObject) => this.renderPayload(matchObject));
    }

    componentWillMount () {
        this._isAnimationEnabled = this.props.transitionOnAppear;
        this._componentRefs = {};
        this._componentStates = {};
        this._componentAnimationFrames = {};
        this._routeIds = {};
        super.componentWillMount();
    }

    componentDidMount () {
        super.componentDidMount(...arguments);
        this._animationTimer = setTimeout(this._onAnimationTimerTick.bind(this));
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
        super.componentWillUnmount();
    }

    _getComponentRef (objectKey) {
        return this._componentRefs[objectKey];
    }

    _setComponentRef (objectKey, component) {
        this._componentRefs[objectKey] = component;
    }

    _onUriChange () {
        const {router} = this.context;
        const prevMatchObjects = this.state.matchObjects;
        const prevMatchKeys = this.state.matchKeys;
        const prevHiddenObjects = this.state.hiddenObjects;
        const prevHiddenKeys = this.state.hiddenKeys;
        const matchObjects = router.getMatchObjects();
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
                matchKeys.push(routeName + '~' + this._routeIds[routeName]++);
            } else {
                matchKeys.push(prevMatchKeys[objectIndex]);
            }
        });

        prevMatchObjects.forEach((prevMatchObject, p) => {
            const routeName = prevMatchObject.name;
            const objectKey = prevMatchKeys[p];
            const objectIndex = matchKeys.indexOf(objectKey);
            if (objectIndex === -1) {
                hiddenObjects.push(prevMatchObject);
                hiddenKeys.push(objectKey);

                const component = this._getComponentRef(objectKey);
                if (!component) {
                    return;
                }
                this._onEnterComplete(objectKey);
                component.componentBeforeLeave && component.componentBeforeLeave();
                if (component.componentWillLeave) {
                    this._componentAnimationFrames[objectKey] = requestAnimationFrame(this._onLeaveStart.bind(this, objectKey));
                } else {
                    this._onLeaveComplete(objectKey);
                }
            }
        });

        this.setState({
            matchObjects,
            matchKeys,
            hiddenObjects,
            hiddenKeys
        });
    }

    _onChildRef (objectKey, component) {
        if (!component) {
            return;
        }

        const prevComponent = this._getComponentRef(objectKey);
        this._setComponentRef(objectKey, component);
        if (prevComponent) {
            return;
        }

        if (!this._isAnimationEnabled) {
            return;
        }

        component.componentBeforeEnter && component.componentBeforeEnter();
        if (component.componentWillEnter) {
            this._componentAnimationFrames[objectKey] = requestAnimationFrame(this._onEnterStart.bind(this, objectKey));
        } else if (component.componentDidEnter) {
            this._componentStates[objectKey] = 'enter';
            this._onEnterComplete(objectKey);
        }
    }

    _onAnimationTimerTick () {
        this._isAnimationEnabled = true;
    }

    _onEnterStart (objectKey) {
        const component = this._getComponentRef(objectKey);
        if (!component) {
            return;
        }
        this._componentAnimationFrames[objectKey] = null;
        this._componentStates[objectKey] = 'enter';
        component.componentWillEnter(this._onEnterComplete.bind(this, objectKey));
    }

    _onEnterComplete (objectKey) {
        const component = this._getComponentRef(objectKey);
        if (!component) {
            return;
        }
        if (this._componentStates[objectKey] !== 'enter') {
            return;
        }
        this._componentStates[objectKey] = null;
        component.componentDidEnter && component.componentDidEnter();
    }

    _onLeaveStart (objectKey) {
        const component = this._getComponentRef(objectKey);
        if (!component) {
            return;
        }
        this._componentAnimationFrames[objectKey] = null;
        this._componentStates[objectKey] = 'leave';
        component.componentWillLeave(this._onLeaveComplete.bind(this, objectKey));
    }

    _onLeaveComplete (objectKey) {
        const component = this._getComponentRef(objectKey);
        if (!component) {
            return;
        }
        this._componentStates[objectKey] = null;
        component.componentDidLeave && component.componentDidLeave();

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
    }
}

TransitionSwitch.propTypes = {
    transitionOnAppear: PropTypes.bool
};

TransitionSwitch.defaultProps = {
    transitionOnAppear: false
};
