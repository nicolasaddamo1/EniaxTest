const nextHttps = require('next-https');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });

nextHttps(app).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
});