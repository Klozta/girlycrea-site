#!/usr/bin/env node

/**
 * Script pour créer l'utilisateur admin dans la base de données
 * Usage: node scripts/create-admin-user.js
 */

import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '../.env.docker') });

const { Pool } = pg;

const adminEmail = 'admin@girlycrea.local';
const adminPassword = 'Password123!';
const adminName = 'Admin';

async function createAdminUser() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL n\'est pas défini dans .env.docker');
    process.exit(1);
  }

  console.log('🔐 Création de l\'utilisateur admin...');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Mot de passe: ${adminPassword}`);

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Vérifier si l'utilisateur existe déjà
    const checkResult = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [adminEmail]
    );

    if (checkResult.rows.length > 0) {
      const existingUser = checkResult.rows[0];
      console.log(`✅ L'utilisateur admin existe déjà (ID: ${existingUser.id}, Role: ${existingUser.role})`);
      
      // Mettre à jour le mot de passe si nécessaire
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        'UPDATE users SET password_hash = $1, role = $2 WHERE email = $3',
        [passwordHash, 'admin', adminEmail]
      );
      console.log('✅ Mot de passe admin mis à jour');
      
      await pool.end();
      return;
    }

    // Créer le hash du mot de passe
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Insérer l'utilisateur admin
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [adminEmail, passwordHash, adminName, 'admin']
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Utilisateur admin créé avec succès!');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nom: ${user.name}`);
      console.log(`   Role: ${user.role}`);
    } else {
      console.error('❌ Échec de la création de l\'utilisateur admin');
      process.exit(1);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error.message);
    if (error.code === '42P01') {
      console.error('   La table "users" n\'existe pas. Exécutez d\'abord les migrations.');
    }
    await pool.end();
    process.exit(1);
  }
}

createAdminUser();
