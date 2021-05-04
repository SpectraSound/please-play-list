var http = require('http');
var fs = require('fs');
var mysql = require('mysql');
var files = require('./controller/HomeController');

const port = 8080;
const host = 'localhost';

const requestListener = function (req, res) {
   const {url, headers} = req;
   console.log(headers);
   
   if(url.includes('.') || url == '/'){
      files.servePage(req,res);
   } else {
      files.endPoints(req,res);
   }
}


const server = http.createServer(requestListener); 

server.listen(port, host, () => {
  console.log(`server is running on http://${host}:${port}`);
})