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
            'SELECT * FROM produits WHERE commercant_id = ? AND actif = TRUE',
            [commercantId]
        );
        res.json(rows);
    }catch(err){
        console.error(err);
        res.status(500).json({message:'erreur serveur'});
    }
});

app.get('/api/produits/:id', async (req, res) => {
    try{
        commercantId = 1;
        const  {id} = req.params;
        const [rows] = await pool.query(
            `SELECT * FROM produits WHERE id = ? AND commercant_id = ?`,
            [id, commercantId]
        );
        if(rows.length === 0) {
            return res.status(404).json({message:'produit introvable'});
        }
            res.json(rows[0]);
    }catch(err){
        console.error(err)
        res.status(500).json({message:"erreur serveur"})
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

app.put('/api/produits/:id', async (req, res) => {
    try{
        const commercantId = 1;
        const  {id} = req.params;
        const{nom, categorie, prix_achat, prix_vente, seuil_alerte} = req.body;

        if(!nom || prix_vente === undefined || Number(prix_vente) < 0 )
        {
            return res.status(400).json({message:"nom et prix de vente obligatoires"});
        }

        const [result] = await pool.query(
            `UPDATE produits
            SET nom_prod = ?, categorie = ?, prix_achat = ?, prix_vente = ?, seuil_alerte = ?
            WHERE id =? AND commercant_id = ?`,
            [nom, categorie || null, prix_achat || 0 , prix_vente, seuil_alerte || 0, id, commercantId ]
        );

        if (result.affectedRows === 0 ){
            return res.status(404).json({message:'produit introuvable'});
        }
        res.json({message: "produit modifié"});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"erreur serveur"})
    }
})

app.delete('/api/produits/:id', async (req, res) =>  {
    try{
        const commercantId = 1 ;
        const [result] = await pool.query(
            `UPDATE produits SET actif = FALSE WHERE id = ? AND commercant_id = ?`,
            [req.params.id, commercantId] 
        );

        if (result.affectedRows ===0) {
            return res.status(404).json({message:"produit introuvable"});
        }
        res.json({message:'produit archivé'})
    }catch(err){
        console.error(err);quantite_stock
        res.status(500).json({message:'erreur serveur'});
    }
});

app.post('/api/produits/:id/restock', async (req, res) => {

    const commercantId = 1;
    const {id} = req.params;
    const {quantite} = req.body;

    if (!Number.isInteger(quantite) || quantite <= 0) {
            return res.status(400).json({message:'quantite doit etre en entier'});
    }

    const conn = await pool.getConnection();
    try{
        await conn.beginTransaction();

        const [result] = await conn.query(
           `UPDATE produits SET quantite_stock = quantite_stock + ? 
            WHERE id = ? AND commercant_id = ?`,
            [quantite, id, commercantId ]
        );

        if(result.affectedRows === 0) {
            await conn.rollback();
        return res.status(404).json({message: "produit introuvable"});
        }

        await conn.query(
        `INSERT INTO mouvements_stock(
        commercant_id, produit_id, type, quantite, motif)
        VALUES(?, ?, 'entree', ?, 'reaprovisionnement')`,
        [commercantId, id,quantite]
        );

        await conn.commit();
        res.json({message:'stock a jour'});
    } catch(err){
        await conn.roolback()
        console.error(err);
        res.status(500).json({message:'erreur de serveur'});
    }finally {
        conn.release();
    }
});

app.post('/api/ventes', async (req, res) => {
  const commercantId = 1; // provisoire
  const { lignes } = req.body;

  // 1. validation de la liste
  if (!Array.isArray(lignes) || lignes.length === 0) {
    return res.status(400).json({ message: 'lignes est vide ou invalide' });
  }
  for (const l of lignes) {
    if (!Number.isInteger(l.produit_id) || !Number.isInteger(l.quantite) || l.quantite <= 0) {
      return res.status(400).json({ message: 'ligne invalide' });
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 2. créer la vente avec un total provisoire de 0
    const [vente] = await conn.query(
      'INSERT INTO ventes (commercant_id, total) VALUES (?, 0)',
      [commercantId]
    );
    const venteId = vente.insertId;

    let total = 0;

    // 3. boucle sur chaque ligne
    for (const l of lignes) {
      const [rows] = await conn.query(
        'SELECT * FROM produits WHERE id = ? AND commercant_id = ? AND actif = TRUE FOR UPDATE',
        [l.produit_id, commercantId]
      );
      if (rows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: `Produit ${l.produit_id} introuvable` });
      }
      const produit = rows[0];

      if (produit.quantite_stock < l.quantite) {
        await conn.rollback();
        return res.status(400).json({ message: `Stock insuffisant pour le produit ${l.produit_id}` });
      }

      const sousTotal = produit.prix_vente * l.quantite;
      total += sousTotal;

      await conn.query(
        `INSERT INTO ventes_lignes (vente_id, produit_id, quantite, prix_unitaire, sous_total)
         VALUES (?, ?, ?, ?, ?)`,
        [venteId, produit.id, l.quantite, produit.prix_vente, sousTotal]
      );

      await conn.query(
        'UPDATE produits SET quantite_stock = quantite_stock - ? WHERE id = ? AND commercant_id = ?',
        [l.quantite, produit.id, commercantId]
      );

      await conn.query(
        `INSERT INTO mouvements_stock (commercant_id, produit_id, type, quantite, motif)
         VALUES (?, ?, 'sortie', ?, ?)`,
        [commercantId, produit.id, l.quantite, `Vente n°${venteId}`]
      );
    }

    // 4. total final
    await conn.query('UPDATE ventes SET total = ? WHERE id = ?', [total, venteId]);

    await conn.commit();
    res.status(201).json({ vente_id: venteId, total });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    conn.release();
  }
});

app.listen(process.env.PORT, () => {
    console.log(`serveur lancé avec succès sur http://localhost:${process.env.PORT}`);
});