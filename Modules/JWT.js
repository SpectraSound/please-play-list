var http = require('http');
var fs = require('fs');
const jwt = require('jsonwebtoken');


module.exports = {

    generateAccessToken: function (user) {
        return jwt.sign(user, process.env.TOKEN_SECRET);
    },

    authenticateToken: function(res, token) {
      
        jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
          return err;
        })
      }
}
