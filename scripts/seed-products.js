#!/usr/bin/env node

/**
 * Script de seed pour insérer des produits de test dans PostgreSQL
 * Usage: node scripts/seed-products.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.docker') });

const { Pool } = pg;

const products = [
  { title: 'Coque iPhone Rose Gold - GirlyCrea', description: 'Coque rose gold premium, finition brillante, protection antichoc. Compatible iPhone 12/13/14/15.', price: 19.9, category: 'Coques', stock: 25, images: ['https://picsum.photos/seed/girlycoque1/900/900'], tags: ['rose-gold', 'iphone', 'tendance', 'protection'] },
  { title: 'Coque iPhone Transparente avec Strass', description: 'Coque transparente élégante avec strass, protection renforcée, design unique.', price: 24.9, category: 'Coques', stock: 18, images: ['https://picsum.photos/seed/girlycoque2/900/900'], tags: ['transparent', 'strass', 'iphone', 'elegant'] },
  { title: 'Coque iPhone Floral Print', description: 'Coque avec motif floral délicat, protection complète, design féminin.', price: 22.5, category: 'Coques', stock: 30, images: ['https://picsum.photos/seed/girlycoque3/900/900'], tags: ['floral', 'print', 'feminin', 'iphone'] },
  { title: 'Bracelet Perlé Personnalisé', description: 'Bracelet fait main, perles + initiale. Idéal cadeau. Personnalisation disponible.', price: 14.9, category: 'Bijoux', stock: 40, images: ['https://picsum.photos/seed/girlybracelet/900/900'], tags: ['fait-main', 'cadeau', 'personnalise', 'perles'] },
  { title: 'Boucles d\'oreilles Coeur - Rose', description: 'Boucles légères, coeur rose, finition douce. Hypoallergénique.', price: 12.5, category: 'Bijoux', stock: 30, images: ['https://picsum.photos/seed/girlyearrings/900/900'], tags: ['coeur', 'rose', 'leger', 'hypoallergenique'] },
  { title: 'Collier Perle de Culture', description: 'Collier perle de culture, longueur ajustable, fermoir doré. Élégant et intemporel.', price: 45.0, category: 'Bijoux', stock: 15, images: ['https://picsum.photos/seed/girlynecklace/900/900'], tags: ['perle', 'culture', 'elegant', 'ajustable'] },
  { title: 'Bague Argent 925 avec Pierre', description: 'Bague en argent 925, pierre naturelle, taille ajustable. Design unique.', price: 35.0, category: 'Bijoux', stock: 20, images: ['https://picsum.photos/seed/girlyring/900/900'], tags: ['argent', '925', 'pierre', 'naturelle'] },
  { title: 'Pochette Crochet Bohème', description: 'Pochette crochet style bohème, doublée, fermeture zip. Fait main avec amour.', price: 24.0, category: 'Crochet', stock: 8, images: ['https://picsum.photos/seed/girlycrochet1/900/900'], tags: ['crochet', 'boheme', 'artisanat', 'fait-main'] },
  { title: 'Tote bag Crochet "Noël"', description: 'Tote bag crochet, édition Noël, stock limité. Parfait pour les fêtes.', price: 29.0, category: 'Crochet', stock: 5, images: ['https://picsum.photos/seed/girlytote/900/900'], tags: ['noel', 'stock-limite', 'crochet', 'fetes'] },
  { title: 'Bonnet Crochet Hiver', description: 'Bonnet crochet doux et chaud, plusieurs coloris disponibles. Fait main.', price: 18.5, category: 'Crochet', stock: 12, images: ['https://picsum.photos/seed/girlyhat/900/900'], tags: ['bonnet', 'hiver', 'chaud', 'crochet'] },
  { title: 'Écharpe Crochet Longue', description: 'Écharpe crochet extra longue, motifs géométriques, laine douce.', price: 32.0, category: 'Crochet', stock: 10, images: ['https://picsum.photos/seed/girlyscarf/900/900'], tags: ['echarpe', 'longue', 'geometrique', 'laine'] },
  { title: 'Trousse de Maquillage Rose', description: 'Trousse de maquillage rose, compartiments multiples, design pratique.', price: 15.9, category: 'Beauté', stock: 35, images: ['https://picsum.photos/seed/girlymakeup/900/900'], tags: ['trousse', 'maquillage', 'rose', 'pratique'] },
  { title: 'Pinceau Maquillage Premium', description: 'Set de 5 pinceaux maquillage premium, poils synthétiques doux.', price: 22.0, category: 'Beauté', stock: 25, images: ['https://picsum.photos/seed/girlybrush/900/900'], tags: ['pinceau', 'maquillage', 'premium', 'set'] },
  { title: 'Miroir de Poche LED', description: 'Miroir de poche avec éclairage LED, rechargeable, design compact.', price: 19.9, category: 'Beauté', stock: 28, images: ['https://picsum.photos/seed/girlymirror/900/900'], tags: ['miroir', 'led', 'rechargeable', 'compact'] },
  { title: 'Sac à Main Cuir Rose', description: 'Sac à main en cuir véritable, couleur rose poudré, intérieur spacieux.', price: 89.0, category: 'Mode', stock: 8, images: ['https://picsum.photos/seed/girlybag/900/900'], tags: ['sac', 'cuir', 'rose', 'luxe'] },
  { title: 'Foulard Soie Imprimé', description: 'Foulard en soie, imprimé floral, dimensions 90x90cm. Accessoire élégant.', price: 45.0, category: 'Mode', stock: 15, images: ['https://picsum.photos/seed/girlyscarf2/900/900'], tags: ['foulard', 'soie', 'imprime', 'floral'] },
  { title: 'Ceinture Cuir avec Boucle Dorée', description: 'Ceinture en cuir véritable, boucle dorée, taille ajustable. Style classique.', price: 35.0, category: 'Mode', stock: 20, images: ['https://picsum.photos/seed/girlybelt/900/900'], tags: ['ceinture', 'cuir', 'dorée', 'ajustable'] },
  { title: 'Porte-clés Personnalisé', description: 'Porte-clés personnalisé avec initiale, plusieurs coloris disponibles.', price: 8.9, category: 'Accessoires', stock: 50, images: ['https://picsum.photos/seed/girlykeychain/900/900'], tags: ['porte-cles', 'personnalise', 'initiale', 'cadeau'] },
  { title: 'Étui à Lunettes Rose', description: 'Étui à lunettes en cuir synthétique, couleur rose, protection renforcée.', price: 12.5, category: 'Accessoires', stock: 30, images: ['https://picsum.photos/seed/girlyglasses/900/900'], tags: ['etui', 'lunettes', 'rose', 'protection'] },
  { title: 'Chouchou Cheveux Satin', description: 'Chouchou cheveux en satin, plusieurs coloris, doux pour les cheveux.', price: 6.9, category: 'Accessoires', stock: 45, images: ['https://picsum.photos/seed/girlyhair/900/900'], tags: ['chouchou', 'satin', 'cheveux', 'doux'] },
];

async function seedProducts() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL n\'est pas défini dans .env.docker');
    process.exit(1);
  }

  console.log('🌱 Démarrage du seed des produits...');
  console.log(`   Nombre de produits à insérer: ${products.length}`);

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    let inserted = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        // Vérifier si le produit existe déjà
        const checkResult = await pool.query(
          'SELECT id FROM products WHERE title = $1',
          [product.title]
        );

        if (checkResult.rows.length > 0) {
          skipped++;
          continue;
        }

        // Insérer le produit
        await pool.query(
          `INSERT INTO products (title, description, price, category, stock, images, tags, is_deleted)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            product.title,
            product.description,
            product.price,
            product.category,
            product.stock,
            product.images,
            product.tags,
            false
          ]
        );

        inserted++;
      } catch (error) {
        console.error(`❌ Erreur lors de l'insertion de "${product.title}":`, error.message);
      }
    }

    console.log('');
    console.log('✅ Seed terminé!');
    console.log(`   Produits insérés: ${inserted}`);
    console.log(`   Produits ignorés (déjà existants): ${skipped}`);
    console.log(`   Total produits: ${inserted + skipped}`);

    await pool.end();
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error.message);
    if (error.code === '42P01') {
      console.error('   La table "products" n\'existe pas. Exécutez d\'abord les migrations.');
    }
    await pool.end();
    process.exit(1);
  }
}

seedProducts();
