import PropTypes from 'prop-types';
import Switch from './Switch';
import Redirect from './Redirect';

const spinnerProps = {key: 'ReactRussianRouter/AsyncSwitch/Spinner'};

export default class AsyncSwitch extends Switch {
    constructor () {
        super();
        this.state.isInited = false;
        this.state.isWaiting = true;
    }

    render () {
        const {isInited} = this.state;
        if (!isInited && !this.props.spinnerBeforeInit) {
            return null;
        }
        if ((!isInited && this.props.spinnerBeforeInit) ||
            (this.state.isWaiting && this.props.spinnerWhenWaiting)) {
            return this.renderComponent(this.props.spinnerComponent, spinnerProps);
        }
        return super.render();
    }

    componentWillMount () {
        const {getPayloadPromise} = this.props;
        if (getPayloadPromise === AsyncSwitch.defaultProps.getPayloadPromise) {
            // eslint-disable-next-line
            console.warn('You didn\'t provide getPayloadPromise function. Most likely it means that you don\'t need AsyncSwitch.');
        }

        this._prevMatchObjects = this.state.matchObjects;
        this._payloadMap = new Map();
        this._prevPayloadMap = this._payloadMap;
        this._catchedError = this.props.initialError;
        super.componentWillMount();
    }

    componentDidUpdate () {
        super.componentDidUpdate();

        if (this.state.isWaiting) {
            return;
        }

        this._initSwitch();
        const currentMatchObjects = this._getMatchObjects();
        const renderedMatchObjects = this.state.matchObjects;

        if (!renderedMatchObjects.length) {
            // If there are no renderedMatchObjects, don't cache empty array
            return;
        }

        const isError = renderedMatchObjects[0] && renderedMatchObjects[0].hasOwnProperty('error');
        if (isError && this._catchedError) {
            // If error occured, don't cache renderedMatchObjects
            return;
        }

        // Check whether redirect occured or not during rendering
        for (let r = 0, rl = renderedMatchObjects.length; r < rl; r++) {
            if (renderedMatchObjects[r] !== currentMatchObjects[r]) {
                // If redirect occured, set previous state to avoid content flashes
                const isInited = !isError || this._prevMatchObjects.length > 0;
                this._restorePrevState(isInited);
                return;
            }
        }

        // If rendering has gone without errors, cache renderedMatchObjects
        this._prevMatchObjects = renderedMatchObjects;
        this._catchedError = null;
        const {router} = this.context;
        router.resetRedirectChain();
    }

    componentDidCatch (error) {
        this._catchedError = error;
        this.state.isWaiting = false;
        super.componentDidCatch(error);
    }

    _initSwitch () {
        const isInited = true;
        this.setState({isInited});
    }

    _restorePrevState (isInited) {
        this._payloadMap = this._prevPayloadMap;
        this.setState({
            isInited,
            matchObjects: this._prevMatchObjects
        });
    }

    _restoreScroll () {
        if (this.state.isWaiting) {
            return;
        }
        super._restoreScroll(...arguments);
    }

    _extractPayloadNode (matchObject) {
        if (matchObject.hasOwnProperty('error')) {
            return matchObject.payload;
        }
        return this._payloadMap.get(matchObject);
    }

    _getNavigationKey () {
        const {router} = this.context;
        return router.getNavigationKey();
    }

    _getInitialPayload (matchObjects, ...optionalMaps) {
        const initialMatchObjects = matchObjects.map((matchObject) => {
            return this._matchObjectToInitial(matchObject, optionalMaps);
        });
        this._prevPayloadMap = this._payloadMap;
        this._payloadMap = optionalMaps[0];
        return initialMatchObjects;
    }

    _matchObjectToInitial (matchObject, optionalMaps) {
        const payload = this.props.getInitialPayload(matchObject);
        optionalMaps[0].set(matchObject, payload);
        return matchObject;
    }

    _getAsyncPayload (matchObjects, ...optionalMaps) {
        if (!matchObjects.length) {
            return Promise.reject('Switch cannot render matchObjects!');
        }

        const matchObjectPromises = matchObjects
            .map((matchObject) => this._matchObjectToPromise(matchObject, optionalMaps));
        const minWaitTimePromises = [Promise.all(matchObjectPromises)];
        const minWaitTime = +this.props.minWaitTime;
        let minWaitTimer;
        if (minWaitTime > 0) {
            minWaitTimePromises.push(new Promise((resolve, reject) => {
                minWaitTimer = setTimeout(resolve, minWaitTime);
            }));
        }

        const maxWaitTimePromises = [Promise.all(minWaitTimePromises).then(([a, b]) => a)];
        const maxWaitTime = +this.props.maxWaitTime;
        let maxWaitTimer;
        if (maxWaitTime > 0) {
            maxWaitTimePromises.push(new Promise((resolve, reject) => {
                maxWaitTimer = setTimeout(() => {
                    reject('Max waiting time has expired!');
                }, maxWaitTime);
            }));
        }

        return Promise.race(maxWaitTimePromises)
            .then((matchObjects) => {
                clearTimeout(minWaitTimer);
                clearTimeout(maxWaitTimer);
                this._prevPayloadMap = this._payloadMap;
                this._payloadMap = optionalMaps[0];
                return matchObjects;
            })
            .catch((error) => {
                clearTimeout(minWaitTimer);
                clearTimeout(maxWaitTimer);
                throw error;
            });
    }

    _matchObjectToPromise (matchObject, optionalMaps) {
        return this.props.getPayloadPromise(matchObject)
            .then((payload) => {
                optionalMaps[0].set(matchObject, payload);
                return matchObject;
            });
    }

    _throwError () {
        this.state.isWaiting = false;
        this._initSwitch();
        super._throwError(...arguments);
    }

    _onUriChange () {
        const matchObjects = this._getMatchObjects()
            .slice(0, Math.max(0, this.props.childLimit))
            .filter((matchObject) => !!matchObject.payload || !!matchObject.error);
        const navigationKey = this._getNavigationKey();

        // Loop below looks for declarative redirects (from routes' table) and executes them
        for (let matchObject of matchObjects) {
            if (!matchObject.payload ||
                !matchObject.payload.type ||
                matchObject.payload.type !== Redirect) {
                continue;
            }
            // Emulate react component (instance of Redirect)
            const fakeRedirectInstance = Object.create(Redirect.prototype, {
                context: {value: this.context},
                props: {value: matchObject.payload.props}
            });
            // Ensure that redirect will be executed after switch is mounted
            this.setState({}, () => {
                fakeRedirectInstance.componentDidMount();
            });
            return;
        }

        const payloadMap = new Map();

        if (this.state.isInited || !this.props.getInitialPayload) {
            this._getAsyncPayload(matchObjects, payloadMap)
                .then(this._onPayloadResolve.bind(this, navigationKey))
                .catch(this._onPayloadReject.bind(this, navigationKey));
        }

        const isWaiting = true;
        this.setState({isWaiting});

        this._emitUriChange(matchObjects);
        const {onWaitStart} = this.props;
        const type = 'waitstart';
        onWaitStart && onWaitStart({type, matchObjects});

        if (!this.state.isInited && this.props.getInitialPayload) {
            try {
                const initialMatchObjects = this._getInitialPayload(matchObjects, payloadMap);
                this.state.isInited = true;
                this._onPayloadResolve(navigationKey, initialMatchObjects);
            } catch (error) {
                this._onPayloadReject(navigationKey, error);
            }
        }
    }

    _onPayloadResolve (navigationKey, matchObjects) {
        if (navigationKey !== this._getNavigationKey()) {
            return;
        }

        const isWaiting = false;
        this.setState({
            matchObjects,
            isWaiting
        });

        const {onWaitEnd} = this.props;
        const type = 'waitend';
        onWaitEnd && onWaitEnd({type, matchObjects});
    }

    _onPayloadReject (navigationKey, error) {
        if (navigationKey !== this._getNavigationKey()) {
            return;
        }

        this._catchedError = error;
        this._matchError = (error || '') + '';
        this._throwError();

        const {matchObjects} = this.state;
        const {onWaitEnd} = this.props;
        const type = 'waitend';
        onWaitEnd && onWaitEnd({type, matchObjects});
    }
}

AsyncSwitch.propTypes = {
    childLimit: PropTypes.number,
    getPayloadPromise: PropTypes.func.isRequired,
    getInitialPayload: PropTypes.func,
    errorComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    initialError: PropTypes.any,
    spinnerComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    spinnerBeforeInit: PropTypes.bool,
    spinnerWhenWaiting: PropTypes.bool,
    minWaitTime: PropTypes.number,
    maxWaitTime: PropTypes.number,
    onUriChange: PropTypes.func,
    onError: PropTypes.func,
    onWaitStart: PropTypes.func,
    onWaitEnd: PropTypes.func
};

AsyncSwitch.defaultProps = {
    childLimit: 1,
    getPayloadPromise: (matchObject) => Promise.resolve(matchObject.payload),
    minWaitTime: 0,
    maxWaitTime: 60000
};
