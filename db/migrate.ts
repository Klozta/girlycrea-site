import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  try {
    console.log('🔧 Running database migrations...');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Vérifier si le dossier existe
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No migrations folder found');
      return;
    }
    
    // Lire les fichiers SQL triés
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    if (files.length === 0) {
      console.log('⚠️  No migration files found');
      return;
    }
    
    // Exécuter chaque migration
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`📝 Executing migration: ${file}`);
      await pool.query(sql);
      console.log(`✅ Migration completed: ${file}`);
    }
    
    // Exécuter le seed
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Running seed data...');
      const seedSql = fs.readFileSync(seedPath, 'utf-8');
      
      // Split par ; et exécuter
      const statements = seedSql.split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        await pool.query(statement);
      }
      console.log('✅ Seed data completed');
    }
    
    console.log('✅ All migrations and seeds completed!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    // Ne pas arrêter l'app si les migrations échouent
  }
}
