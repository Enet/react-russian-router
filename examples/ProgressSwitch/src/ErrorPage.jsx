import React from 'react';

export default class ErrorPage extends React.PureComponent {
    render () {
        const style = {
            opacity: this.props.transitionProgress / 100
        };

        return <article className="error-page" style={style}>
            ErrorPage
        </article>
    }
}
