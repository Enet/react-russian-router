import React from 'react';

import AnimatedPage from './AnimatedPage.jsx';

export default class ErrorPage extends AnimatedPage {
    render () {
        return <article className={this.getClassName()}>
            ErrorPage
        </article>
    }

    getClassName () {
        return super.getClassName() + ' error-page';
    }
}
