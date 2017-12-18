import React from 'react';
import {
    Redirect
} from 'react-russian-router';

import IndexPage from './IndexPage.jsx';
import UserPage from './UserPage.jsx';

export default {
    index: {
        uri: '/',
        payload: IndexPage
    },
    about: {
        uri: '/about',
        payload: <Redirect name="index" />
    },
    etc: {
        uri: '/etc',
        payload: <Redirect href="/about" />
    },
    user: {
        uri: '/user/{id}',
        params: {
            id: [1, 2, 3, 4, 5]
        },
        payload: UserPage
    }
};
