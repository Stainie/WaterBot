const http = require('http');
const app = require('./app');
const port = process.env.PORT || 1238;

const server = http.createServer(app);

server.listen(port, () => console.log(`Server started on port ${port}`));

setInterval(() => {
    http.get("http://blooming-river-72137.herokuapp.com");
    console.log("keep alive");
}, 300000);