const http = require('http');
const fs = require('fs').promises;
const mysql = require('mysql');
const view_dir = './views/';
const jwt = require('../Modules/JWT');
const dotenv = require('dotenv')
const dataHandling = require('../Modules/dataHandling')
const User = require('../models/User.js')

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const doQuery = (query, params) => {

    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                reject(err);
            }

            if (results.length > 0) {
                resolve(results);
            }
        })
    })
}

html = {
    render(path, response) {

        path = view_dir + path + '.html'

        fs.readFile(path)
            .then(contents => {

                response.end(contents);

            }).catch(err => {

                response.writeHead(404);
                response.write('file not found');
                response.end();
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
            fs.readFile('./views/login.html')
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
        var cookies = dataHandling.cookie(headers.cookie);
        let user = new User;
        if (cookies == "" || !cookies['token']) {
            if (method == 'GET') {
                switch (url) {
                    case '/login':
                        html.render('login', res);
                        break;
                    case '/signup':
                        html.render('signup', res);
                        break;
                    default:
                        html.render('login', res);
                        break;
                }
            }
            if (method == 'POST') {
                switch (url) {
                    case '/login':
                        let data = await html.data(req);
                        let credentials = dataHandling.form(data);

                        doQuery('SELECT id, username FROM users WHERE username = ? AND password = ?', [
                            credentials.username,
                            credentials.password
                        ])
                            .then(results => {
                                user = new User(results[0].id, results[0].username);
                                console.log(user);
                                let token = jwt.generateAccessToken(JSON.stringify(user));

                                res.setHeader('Set-Cookie', 'token=' + token)
                                res.setHeader('Set-Cookie', 'user_id=' + user.id)

                                console.log('here');
                                html.render('myPlaylists', res);

                            })
                            .catch(err => {
                                console.log(err)
                                res.statuscode = 401;
                                html.render('login', res);
                            });

                    case '/signup':
                        data = await html.data(req);
                        let formData = dataHandling.form(data);

                        doQuery('INSERT INTO users (username, password) VALUES(?,?)', [
                            formData.username,
                            formData.password
                        ])
                            .then(results => {
                                console.log(results)
                                html.render('login', res)
                            })
                            .catch(err => {
                                res.statuscode = 500;
                                res.end(err);
                            })
                        break;

                    default:
                        html.render('login', res);
                        break;
                }
            }
        }

        jwt.authenticateToken(res, cookies['token']);

        if (method == 'GET') {
            switch (url) {
                case '/my-playlists':
                    html.render('myPlaylists', res)
                    break;

                case '/getPlaylists':

                    break;

                case '/add-playlist':
                    html.render('newPlaylist', res);

                default:
                    html.render('myPlaylists', res);
                    break;

            }
        }

        if (method == 'POST') {
            
            switch(url){
                case '/logout':
                    res.setHeader('Set-Cookie', 'token=;expires=' + Date.now());
                    html.render('login', res);
                    break;

                case '/add-playlist':
                    data = await html.data(req);
                    let formData = dataHandling.form(data);
                    
                    user.addPlaylist(formData.name, formData.description, formData.public ? 1:0)
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