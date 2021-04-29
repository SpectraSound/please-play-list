var http = require('http');
var fs = require('fs');

exports.servePage = function (page) {
    fs.readFile("views/" + page + ".html", function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
};