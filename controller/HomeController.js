var http = require('http');
var fs = require('fs').promises;
var mysql = require('mysql');
const view_dir = './views/';
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
        }).catch(err =>{
            response.writeHead(404);
            response.write('file not found');
        });
    }
}


module.exports = {
    servePage:  function (req, res) {
        const {url, method, headers} = req;
        
        if (req.url !== '/'){
            fs.readFile('./' + req.url)
            .then(contents => {
                res.writeHead(200);
                res.end(contents);
            })
            .catch(err => {
                res.writeHead(500, 'something went wrong')
                res.end();
            });
        } else {            
            fs.readFile('./views/loginPage.html')
            .then(contents => {
                res.writeHead(200);
                res.end(contents);
            })
            .catch(err =>{
                res.writeHead(500, 'something went wrong')
                res.end()
            });
        }
    },

    endPoints: function (req, res) {
        const {url, method, headers} = req;

        
        if (method == 'GET') {
            switch(url){
                case '/login':
                    html.render('loginPage', res);
                    break;

                case '/signup':
                    

            }
        }

        if (method == 'POST') {
            if(url == '/login'){}
        }

        if (method == 'PUT'){

        }

        if (method == 'DELETE'){

        }
    }

}