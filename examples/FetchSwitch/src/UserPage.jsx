import React from 'react';

export default class UserPage extends React.PureComponent {
    render () {
        return <article className="user-page">
            UserPage {this.props.matchObject.params.id}<br />
            userData.upperCaseEntryName is {this.props.userData.upperCaseEntryName}
        </article>
    }
}
