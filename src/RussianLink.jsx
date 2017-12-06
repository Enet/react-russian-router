import Link from './Link';

export default class RussianLink extends Link {
    _generateUri () {
        const {props} = this;
        const {href, name} = props;
        if (!name) {
            return href;
        }

        const {router} = this.context;
        return router.generateUri(props.name, props);
    }
}
