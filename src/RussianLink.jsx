import Link from './Link';

export default class RussianLink extends Link {
    _generateUri () {
        const {router} = this.context;
        const {props} = this;
        return router.generateUri(props.name, props);
    }
}
