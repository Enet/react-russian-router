const UniversalRussianRouter = typeof window === 'undefined' ?
    require('server-russian-router') :
    require('browser-russian-router').default;

export default UniversalRussianRouter;
