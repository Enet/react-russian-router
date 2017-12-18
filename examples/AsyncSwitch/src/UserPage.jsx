import React from 'react';

export default class UserPage extends React.PureComponent {
    render () {
        return <article className="user-page">
            UserPage {this.props.matchObject.params.id}
        </article>
    }
}
