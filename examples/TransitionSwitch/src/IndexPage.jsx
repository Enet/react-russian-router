import React from 'react';

import AnimatedPage from './AnimatedPage.jsx';

export default class IndexPage extends AnimatedPage {
    render () {
        return <article className={this.getClassName()}>
            IndexPage
        </article>
    }

    getClassName () {
        return super.getClassName() + ' index-page';
    }
}
