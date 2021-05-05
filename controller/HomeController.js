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
        var params = dataHandling.params(url);
        var endpoint = dataHandling.endpoint(url)
        var prefixGrouping = endpoint.split('/')
        
        if (cookies == "" || !cookies['token']) {
            if (method == 'GET') {
                switch (endpoint) {
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
                switch (endpoint) {
                    case '/login':
                        let data = await html.data(req);
                        let credentials = dataHandling.form(data);

                        doQuery('SELECT id, username FROM users WHERE username = ? AND password = ?', [
                            credentials.username,
                            credentials.password
                        ])
                            .then(results => {
                                user = new User(results[0].id, results[0].username);
                                let token = process.env.TOKEN_SECRET;

                                res.writeHead(200,[
                                    ['Set-Cookie', 'token=' + token],
                                    ['Set-Cookie', 'user_id=' + user.id],
                                    ['Set-Cookie', 'username=' + user.username]
                                ]);

                                html.render('myPlaylists', res);

                            })
                            .catch(err => {
                                
                                res.statusCode = 401;
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
                                html.render('login', res)
                            })
                            .catch(err => {
                                res.statusCode = 500;
                                res.end(err);
                            })
                        break;

                    default:
                        html.render('login', res);
                        break;
                }
            }
        }

        if(cookies['token'] == process.env.TOKEN_SECRET){
            
            let user = new User(cookies['user_id'],cookies['username']);

            if (method == 'GET') {
                switch (endpoint) {
                    case '/my-playlists':
                        html.render('myPlaylists', res)
                        break;
    
                    case '/get-playlists':
                        user.userPlaylists()
                        .then(results => {
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(results))
                        })
                        .catch(err => {
                            res.statusCode = 500;
                            res.end(err);
                        });

                        break;
    
                    case '/add-playlist':
                        html.render('newPlaylist', res);
                        break;

                    case '/playlist/show/':

                        if(params['id']){
                        
                            user.getPlaylist(params['id'])
                            .then(results => {
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(results))
                            })
                            .catch(err => {
                                res.statusCode = 500;
                                res.end(err);
                            });
                        
                        }
                        break;

                    default:
                        res.end()
                        break;
    
                }
            }
    
            if (method == 'POST') {
            
                switch(endpoint){
                    case '/logout':
                        res.writeHead(200,[
                            ['Set-Cookie', 'token=;expires=' + Date.now()],
                            ['Set-Cookie', 'user_id=;expires=' + Date.now()],
                            ['Set-Cookie', 'username=;expires=' + Date.now()]
                        ]);
                        
                        html.render('login', res);
                        break;
    
                    case '/add-playlist':
                        data = await html.data(req);
                        let formData = dataHandling.form(data);
                        let user = new User(cookies['user_id'],cookies['username']);
                        user.addPlaylist(formData.name, formData.description, formData.public ? 1:0)
                        html.render('myPlaylists', res);

                        break;
                }
                html.render('myPlaylists', res); 
            }
    
            if (method == 'PUT') {
                switch(endpoint){
                    case '/playlist/update/':
                        if(params['id']){
                            data = await html.data(req);
                            let formData = dataHandling.form(data);
                            user.updatePlaylist(params['id'],formData)
                            .then(results =>{
                                html.render('myPlaylists', res); 
                            })
                        }
                        break;
                }
            }
    
            if (method == 'DELETE') {
                switch(endpoint){
                    case '/playlist/delete/':
                        user.deletePlaylist(params['id'])
                        .then(results => {
                            res.setHeader('Content-Type', 'application/json');
                            html.render('myPlaylists', res);
                        })
                        .catch(err => {
                            res.statusCode = 500;
                            res.end(err);
                        });
                        
                        break;
                }
            }
        }
    }
}