const React = require('react');
const ReactDOMServer = require('react-dom/server');

const el = React.createElement('div', { style: { backgroundImage: 'url(foo) !important' } });
console.log(ReactDOMServer.renderToString(el));
