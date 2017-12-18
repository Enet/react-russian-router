module.exports = function ({body, payload, initialError, userData}) {
    const appData = {initialError, userData};
    let initialCss = '';
    let initialJs = '';
    if (payload) {
        initialCss = '<link rel="stylesheet" href="/out/' + payload + '.css" />';
        initialJs = '<script src="/out/' + payload + '.js"></script>';
    }

    return `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>ServerSwitch :: react-russian-router</title>
        <link rel="stylesheet" href="/out/index.css" />
        ${initialCss}
    </head>
    <body>
        <main id="app">${body}</main>
        <script src="/out/index.js"></script>
        ${initialJs}
        <script>window.initApp(${JSON.stringify(appData)});</script>
    </body>
</html>
    `;
}
