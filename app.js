try {
  require('./server/dist/index.js');
} catch (e) {
  const http = require('http');
  http.createServer((req, res) => {
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Node App Crashed on Startup: \n\n' + e.toString() + '\n\n' + e.stack);
  }).listen(process.env.PORT || 3000);
}
