import React from 'react';

export default class UserPage extends React.PureComponent {
    render () {
        const {transitionProgress} = this.props;
        const r = Math.floor(255 - 255 * transitionProgress / 100);
        const g = Math.floor(128 * transitionProgress / 100);
        const b = Math.floor(255 * Math.random() * (100 - transitionProgress));
        const a = transitionProgress / 100;
        const style = {
            color: 'rgba(' + [r, g, b, a].join() + ')'
        };

        return <article className="user-page" style={style}>
            UserPage {this.props.matchObject.params.id}
        </article>
    }
}
