const http = require('http');
const fs = require('fs').promises;
const view_dir = './views/';

module.exports = {

    render: function (path, response) {

        path = view_dir + path + '.html'

        fs.readFile(path)
            .then(contents => {

                console.log(contents)
                response.end(contents);

            }).catch(err => {

                response.writeHead(404);
                response.write('file not found');
                response.end();
            });
    },

    data: function (req) {

        return new Promise((resolve, reject) => {

            let body = '';

            req.on('data', chunk => {

                body += chunk.toString();
            });

            req.on('end', () => {

                resolve(body);
            });
        })
    }

}