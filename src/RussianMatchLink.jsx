import MatchLink from './MatchLink';
import RussianLink from './RussianLink';

export default class RussianMatchLink extends MatchLink {
    _generateUri () {
        return RussianLink.prototype._generateUri.call(this, ...arguments);
    }
}
