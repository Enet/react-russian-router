import React from 'react';

import './IndexPage.css';

export default class IndexPage extends React.PureComponent {
    render () {
        return <article className="index-page">
            IndexPage<br />
            keywords: [{this.props.userData.keywords.join(', ')}]
        </article>
    }
}
