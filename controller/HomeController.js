let http = require('http');
let fs = require('fs').promises;
let mysql = require('mysql');
const view_dir = './views/';
let JWT = require('jsonwebtoken');

const db = mysql.createConnection({
    host: "localhost",
    database: "engroceries",
    user: "root",
    password: ""
});




html = {

    render(path, response) {

        path = view_dir + path + '.html'

        fs.readFile(path)
            .then(contents => {

                response.writeHead(200);
                response.end(contents);

            }).catch(err => {

                response.writeHead(404);
                response.write('file not found');

            });
    },

    data(req) {

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


dataHandling = {

    form(data) {

        var postdata = {};
        var formKeyValuePairs = data.split('&');

        formKeyValuePairs.forEach(formField => {

            var keyValue = formField.split('=');

            postdata[keyValue[0]] = keyValue[1];
        })

        return (postdata);
    },

    cookie(data) {

        var cookies = {};
        var cookieKeyValuePairs = data.split(';');

        cookieKeyValuePairs.forEach(cookie => {

            var keyValue = cookie.split('=');

            cookies[keyValue[0]] = keyValue[1];
        });

        return (cookies);
    }
}




module.exports = {


    servePage: function (req, res) {

        if (req.url.includes('.')) {
            fs.readFile('./' + req.url)
                .then(contents => {
                    res.end(contents);
                })
                .catch(err => {
                    res.writeHead(500, 'something went wrong')
                    res.end();
                });
        } else {
            fs.readFile('./views/loginPage.html')
                .then(contents => {
                    res.end(contents);
                })
                .catch(err => {
                    res.writeHead(500, 'something went wrong')
                    res.end()
                });
        }
    },


    endPoints: async function (req, res) {
        const { url, headers, method } = req;
        var cookies = {};

        if (headers.cookie) {

            var cookies = dataHandling.cookie(headers.cookie);
            

            if (!cookies['token']) {
                switch (url) {
                    case '/login':
                        html.render('loginPage', res);
                        break;

                    case '/signup':
                        html.render('signupPage', res);
                        break;
                }
            }
        }





        if (method == 'GET') {
            switch (url) {
                case '/my-playlists':
                    html.render('myPlaylistsPage', res)
                    break;

                case '/getPlaylists':
                    
            }
        }

        if (method == 'POST') {

            switch (url) {

                case '/login':

                    let data = await html.data(req);
                    let credentials = dataHandling.form(data);





                    res.end();
                    break;
            }
        }

        if (method == 'PUT') {

        }

        if (method == 'DELETE') {

        }
    }

}