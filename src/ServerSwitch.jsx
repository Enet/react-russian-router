import PropTypes from 'prop-types';
import UniversalRussianRouter from './UniversalRussianRouter';
import Switch from './Switch';

export default class ServerSwitch extends Switch {
    renderMatchObjects (matchObjects) {
        return this.renderContent(matchObjects);
    }

    componentWillMount () {
        super.componentWillMount();
        if (this.context.feedback) {
            this.context.feedback.matchObjects = this.state.matchObjects;
        }
    }

    _onUriChange () {
        const matchObjects = this._getMatchObjects();
        this.state.matchObjects = matchObjects;
    }
}

ServerSwitch.contextTypes = {
    router: PropTypes.instanceOf(UniversalRussianRouter).isRequired,
    feedback: PropTypes.object
};
