import IndexPage from './IndexPage.jsx';
import UserPage from './UserPage.jsx';

export default {
    index: {
        uri: '/',
        payload: IndexPage
    },
    user: {
        uri: '/user/{id}',
        params: {
            id: [1, 2, 3, 4, 5]
        },
        payload: UserPage,
        key: (matchObject) => matchObject.params.id
    }
};
