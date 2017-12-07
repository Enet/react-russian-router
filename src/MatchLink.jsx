import Link from './Link';

export default class MatchLink extends Link {
    componentWillMount () {
        this._onUriChange = this._onUriChange.bind(this);
        this._onUriChange();
    }

    componentDidMount () {
        const {router} = this.context;
        router.addListener('change', this._onUriChange);
    }

    componentWillUnmount () {
        const {router} = this.context;
        router.removeListener('change', this._onUriChange);
    }

    _getClassName () {
        let className = super._getClassName();
        if (this._isMatched()) {
            className += ' matched';
        }
        return className;
    }

    _onUriChange () {
        const {router} = this.context;
        const matchObjects = router.getMatchObjects();
        this.setState({matchObjects});
    }
}
