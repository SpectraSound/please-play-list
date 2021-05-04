const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const doQuery = (query,params) => {
    
    return new Promise((resolve,reject)=>{
        db.query(query,params,(err,results)=>{
            if(err){
                reject(err);
            }  
            
            if(results.length > 0){
                resolve(results);
            }
        })
    })
}

class User {

    constructor(id, username){
        this.id = id;
        this.username = username;
    }


    addPlaylist(name, desc, available){
        return doQuery('INSERT INTO playlists user_id, name, description, public VALUES(?,?,?,?)',[
            this.id,
            name,
            desc,
            available
        ])
    }

    userPlaylists(){
        return doQuery('SELECT * FROM playlists WHERE user_id = ?',[
            this.id
        ]);
    }
}

module.exports = User