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

    _extractPayloadProps (matchObject) {
        const payloadProps = super._extractPayloadProps(matchObject);
        const {userData} = this.props;
        if (userData) {
            payloadProps.userData = userData;
        }
        return payloadProps;
    }

    _onUriChange () {
        const matchObjects = this._getMatchObjects();
        this.state.matchObjects = matchObjects;
    }
}

ServerSwitch.contextTypes = {
    router: PropTypes.instanceOf(UniversalRussianRouter).isRequired,
    feedback: PropTypes.object,
    userData: PropTypes.object
};
