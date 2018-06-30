const http = require('http');
const app = require('./app');
const port = process.env.PORT || 1238;

const server = http.createServer(app);


server.listen(port, () => console.log(`Server started on port ${port}`));