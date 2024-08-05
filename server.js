const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const connectDB = require('./utils/connectDB');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    connectDB().then(() => {
      console.log('> Connected to database');
      console.log('> Ready on http://localhost:3000');
    }).catch(err => {
      console.error('Failed to connect to database:', err);
      process.exit(1); // Exit the process with failure
    });
  });
});
