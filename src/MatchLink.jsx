import Link from './Link';

export default class MatchLink extends Link {
    _getClassName () {
        let className = super._getClassName();
        if (this._isMatched()) {
            className += ' matched';
        }
        return className;
    }
}
