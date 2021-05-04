var mysql = require('mysql');

const db = mysql.createConnection({
    host: "localhost",
    database: "engroceries",
    user: "root",
    password: ""
});

const doQuery = (query) => {
    
    return new Promise((resolve,reject)=>{
        db.query(query,(err,results)=>{
            if(err){
                reject(err);
            }  
            
            if(results.length > 0){
                resolve(results);
            }
        })
    })
}

class user {

    constructor(id){
        this.id = id;
    }

    userPlaylists(){
        query = 'SELECT * FROM playlists WHERE user_id = ' + this.id;

        return doQuery(query);
    }
}