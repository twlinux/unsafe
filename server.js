const st = require('st');
const ip = require('ip');
const http = require('http');
const colors = require('colors');

var port = process.env.PORT || 80; // default HTTP port is 80

// st server settings
var mount = st({
    cache: false,
    path: `${__dirname}/blog`,
    url: '/',
    index: 'index.html',
    gzip: false,
    passthrough: true
});

http.createServer(function (request, response) {
    mount(request, response, function () {
        response.writeHead(404);
        response.end();
    });

    let date = new Date();
    console.log(colors.dim(`[  ${date.getHours()}:${date.getMinutes()} ${date.getSeconds()} ]`)
        + ` Request from: ${colors.bold(request.connection.remoteAddress)} wants: ${colors.cyan(request.url)}`);
}).listen(port);

let url = (`http://${colors.bold(ip.address())}:${colors.cyan(port.toString())}/`);
console.log(`Server running at ${colors.underline(url)}`);

process.on('SIGINT', function () {
    console.log(`${'SIGINT'.underline.red} recieved, process exiting.`);
    process.exit();
});
process.on('SIGTERM', function () {
    console.log(`${'SIGTERM'.underline.red} recieved, process exiting.`);
    process.exit();
});
