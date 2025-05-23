import { initializeDatabase } from './database/dbInit';
import db from './database/dbConfig';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Initialize the database and log any errors
 * This function should be called once at application startup
 */
export const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    if (!isBrowser) {
      await initializeDatabase();
      console.log('SQLite database setup complete');
    } else {
      console.log('Browser environment detected, using localStorage for storage');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};

/**
 * Get statistics about the database tables
 * @returns Array of table names and their row counts
 */
export const getDatabaseStats = async () => {
  try {
    // Get a list of all tables in the database
    const tables = ['weather_locations', 'weather_records', 'weather_temperatures'];
    const stats = [];
    
    // Query each table for its row count
    for (const table of tables) {
      const result = await db(table).count('* as count').first();
      stats.push({
        table,
        count: result ? Number(result.count) : 0
      });
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error);
    return [];
  }
};
