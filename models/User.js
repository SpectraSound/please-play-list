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
        return doQuery('INSERT INTO playlists (user_id, name, description, public) VALUES(?,?,?,?)',[
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

    getPlaylist(playlist_id){
        return doQuery('SELECT * FROM playlists WHERE user_id = ? AND id = ?',[
            this.id,
            playlist_id
        ]);
    }

    deletePlaylist(playlist_id){
        return doQuery('DELETE * FROM playlists WHERE user_id = ? AND id = ?',[
            this.id,
            playlist_id
        ]);
    }

    updatePlaylist(playlist_id, postData){
        let params = {}

        doQuery('SELECT * FROM playlists WHERE user_id = ? AND id = ?',[
            this.id,
            playlist_id
        ])
        .then(results => {
            params['name'] = postData['name'] ? postData['name']:results[0].name;
            params['description'] = postData['description'] ? postData['description']:results[0].description
            params['public'] = postData['public'] ? 1:0

            return doQuery('UPDATE playlists SET name = ?, description = ?, public = ? WHERE id = ?',[
                params['name'],
                params['description'],
                params['public'],
                playlist_id
            ]);
        })
        .catch(err => {
            return err;
        })
    }
}

module.exports = User