import React from 'react';

export default class IndexPage extends React.PureComponent {
    render () {
        return <article className="index-page">
            IndexPage<br />
            userData.upperCaseEntryName is {this.props.userData.upperCaseEntryName}
        </article>
    }
}
