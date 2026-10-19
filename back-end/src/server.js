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


app.get('/api/produits', async (req, res) => {
    try{
        const commercantId = 1 ; 
        const [rows] = await pool.query (
            'SELECT * FROM prduits WHERE commercant_id = ? AND actif = TRUE',
            [commercantId]
        );
        res.json(rows);
    }catch(err){
        console.error(err);
        res.json(500).json({message:'erreur serveur'});
    }
});


app.post('/api/produits', async (req, res) => {
    try{
        const commercantId = 1;
        const {nom, categorie, prix_achat, prix_vente, quantite_stock, seuil_alerte} = req.body;

        if(!nom || prix_vente === undefined) {
            return res.status(400).json({message: 'les prix et quantités sont obligatoires'});
        }

        if(Number(prix_vente) < 0 || Number(prix_achat || 0) < 0 || Number(quantite_stock || 0) < 0){
            return res.status(400).json({message:'les prix et quantites ne peuvent pas etre negatifs'});
        }
        const [result] = await pool.query(
            `INSERT INTO produits
            (commercant_id, nom_prod, categorie, prix_achat, prix_vente, quantite_stock, seuil_alerte)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [commercantId, nom, categorie || null,  prix_achat || 0, prix_vente, quantite_stock || 0, seuil_alerte || 0]  
        );

        res.status(201).json({id: result.insertId, message: 'produit créé'});
    }catch(err){
        console.error(err);
        res.status(500).json({message:'erreur serveur'})
    }
});

app.listen(process.env.PORT, () => {
    console.log('serveur lancé avec succès sur http://localhost:${process.env.PORT}');
});