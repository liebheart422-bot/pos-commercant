require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mysql = require('mysql2/promise');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,

});

app.get('/api//health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({status:'ok', database: 'conecté'});
    }catch(err){
        res.status(500).json({status:'erreur', message:'base innaccessible'});
    }
});
app.listen(process.env.PORT, () => {
    console.log('serveur lancé avec succès sur http://localhost:${process.env.PORT');
});