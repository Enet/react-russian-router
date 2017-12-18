import React from 'react';

import './UserPage.css';

export default class UserPage extends React.PureComponent {
    render () {
        return <article className="user-page">
            UserPage {this.props.matchObject.params.id}<br />
            user.name is {this.props.userData.name}
        </article>
    }
}
