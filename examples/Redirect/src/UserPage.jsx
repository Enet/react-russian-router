import React from 'react';
import {
    RussianRedirect
} from 'react-russian-router';

export default class UserPage extends React.PureComponent {
    render () {
        const userId = +this.props.matchObject.params.id;
        if (userId < 1 || userId > 2) {
            return <RussianRedirect name="user" id="1" />
        }

        return <article className="user-page">
            UserPage {userId}
        </article>
    }
}
