const http = require('http');


module.exports = {

    form: function (data) {

        var postdata = {};
        var formKeyValuePairs = data.split('&');

        formKeyValuePairs.forEach(formField => {

            var keyValue = formField.split('=');

            postdata[keyValue[0]] = keyValue[1];
        })

        return (postdata);
    },

    cookie: function (data) {
        var cookies = {};
        
        if(!data){
            return ('');
        } else {
            var cookieKeyValuePairs = data.split(';');
    
            cookieKeyValuePairs.forEach(cookie => {
    
                var keyValue = cookie.split('=');
    
                cookies[keyValue[0]] = keyValue[1];
            });
    
            return (cookies);
        }
    }
}