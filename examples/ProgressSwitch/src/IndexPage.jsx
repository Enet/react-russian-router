import React from 'react';

export default class IndexPage extends React.PureComponent {
    render () {
        const {transitionProgress} = this.props;
        const style = {
            opacity: transitionProgress / 100
        };

        return <article className="index-page">
            <span style={Object.assign({}, style, {
                letterSpacing: 100 - transitionProgress
            })}>IndexPage</span><br />
            <span style={style}>transitionProgress: {transitionProgress}</span>
        </article>
    }
}
