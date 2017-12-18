import React from 'react';

import AnimatedPage from './AnimatedPage.jsx';

export default class UserPage extends AnimatedPage {
    render () {
        return <article className={this.getClassName()}>
            UserPage {this.props.matchObject.params.id}
        </article>
    }

    getClassName () {
        return super.getClassName() + ' user-page';
    }
}
