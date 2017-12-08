import Redirect from './Redirect';
import RussianLink from './RussianLink';

export default class RussianRedirect extends Redirect {
    _generateUri () {
        return RussianLink.prototype._generateUri.call(this, ...arguments);
    }
}
