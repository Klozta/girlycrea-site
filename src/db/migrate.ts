/**
 * GirlyCrea - Database Migration Runner
 * Description: Exécute les migrations SQL et le seed dans l'ordre
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MigrationFile {
  name: string;
  path: string;
  order: number;
}

/**
 * Lit tous les fichiers de migration dans le dossier migrations/
 */
async function getMigrationFiles(): Promise<MigrationFile[]> {
  const migrationsDir = join(__dirname, 'migrations');
  const files = await readdir(migrationsDir);
  
  // Filtrer uniquement les fichiers .sql et les trier par nom
  const sqlFiles = files
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map((file, index) => ({
      name: file,
      path: join(migrationsDir, file),
      order: index + 1,
    }));

  return sqlFiles;
}

/**
 * Exécute une requête SQL
 */
async function executeSQL(pool: pg.Pool, sql: string, description: string): Promise<void> {
  try {
    await pool.query(sql);
    logger.info(`✅ ${description}`);
  } catch (error: any) {
    logger.error(`❌ Erreur lors de l'exécution: ${description}`, error);
    throw error;
  }
}

/**
 * Vérifie si une migration a déjà été exécutée
 */
async function isMigrationExecuted(pool: pg.Pool, migrationName: string): Promise<boolean> {
  try {
    // Vérifier si la table migrations existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);

    if (!checkTable.rows[0].exists) {
      return false;
    }

    // Vérifier si la migration a été exécutée
    const result = await pool.query(
      'SELECT COUNT(*) FROM migrations WHERE name = $1',
      [migrationName]
    );

    return parseInt(result.rows[0].count, 10) > 0;
  } catch (error) {
    // Si la table n'existe pas, retourner false
    return false;
  }
}

/**
 * Marque une migration comme exécutée
 */
async function markMigrationExecuted(pool: pg.Pool, migrationName: string): Promise<void> {
  try {
    // Créer la table migrations si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insérer l'enregistrement de migration
    await pool.query(
      'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [migrationName]
    );
  } catch (error: any) {
    logger.warn(`⚠️  Impossible de marquer la migration comme exécutée: ${error.message}`);
  }
}

/**
 * Exécute toutes les migrations SQL
 */
async function runMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL n\'est pas défini dans les variables d\'environnement');
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    logger.info('🔧 Démarrage des migrations de base de données...');

    // Obtenir tous les fichiers de migration
    const migrationFiles = await getMigrationFiles();

    if (migrationFiles.length === 0) {
      logger.warn('⚠️  Aucun fichier de migration trouvé');
      return;
    }

    logger.info(`📋 ${migrationFiles.length} migration(s) trouvée(s)`);

    // Exécuter chaque migration dans l'ordre
    for (const migration of migrationFiles) {
      const isExecuted = await isMigrationExecuted(pool, migration.name);

      if (isExecuted) {
        logger.info(`⏭️  Migration déjà exécutée: ${migration.name}`);
        continue;
      }

      logger.info(`🔄 Exécution de la migration: ${migration.name}`);

      // Lire le contenu du fichier SQL
      const sql = await readFile(migration.path, 'utf-8');

      // Exécuter le SQL
      await executeSQL(pool, sql, `Migration ${migration.name} exécutée`);

      // Marquer comme exécutée
      await markMigrationExecuted(pool, migration.name);
    }

    logger.info('✅ Toutes les migrations ont été exécutées avec succès');

    // Exécuter le seed si demandé
    const runSeed = process.env.RUN_SEED !== 'false';
    if (runSeed) {
      await runSeedData(pool);
    }

  } catch (error: any) {
    logger.error('❌ Erreur lors de l\'exécution des migrations', error);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Exécute le seed data
 */
async function runSeedData(pool: pg.Pool): Promise<void> {
  try {
    const seedPath = join(__dirname, 'seed.sql');
    
    logger.info('🌱 Exécution du seed data...');

    // Lire le contenu du fichier seed
    const sql = await readFile(seedPath, 'utf-8');

    // Exécuter le SQL
    await executeSQL(pool, sql, 'Seed data exécuté');

    logger.info('✅ Seed data exécuté avec succès');
  } catch (error: any) {
    // Si le fichier n'existe pas, ce n'est pas une erreur critique
    if (error.code === 'ENOENT') {
      logger.warn('⚠️  Fichier seed.sql non trouvé, seed ignoré');
      return;
    }
    logger.error('❌ Erreur lors de l\'exécution du seed', error);
    throw error;
  }
}

/**
 * Fonction principale exportée
 */
export async function runMigrationsAndSeed(): Promise<void> {
  try {
    await runMigrations();
  } catch (error: any) {
    logger.error('❌ Échec des migrations', error);
    process.exit(1);
  }
}

// Si le fichier est exécuté directement (pas importé)
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrationsAndSeed()
    .then(() => {
      logger.info('✅ Migrations terminées');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Erreur fatale', error);
      process.exit(1);
    });
}
