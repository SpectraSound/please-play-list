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
            var cookieKeyValuePairs = data.split('; ');
    
            cookieKeyValuePairs.forEach(cookie => {
    
                var keyValue = cookie.split('=');
    
                cookies[keyValue[0]] = keyValue[1];
            });
            
            return (cookies);
        }
    },

    params: function(url){

        var params = {};
        var post_string = url.split("?").pop();
        var values = post_string.split("&");

        values.forEach(pair => {
            var key_value_pair = pair.split("=");
            params[key_value_pair[0]] = key_value_pair[1];
        });
        
        return(params)
    },

    endpoint: function(url){
        var url = url.split("?")
        return url[0];
    }
}