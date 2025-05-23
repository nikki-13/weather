// Try to import modules that are only available in Node.js
let knex: any;
let path: any;
let fs: any;
let db: any;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a more robust browser check
const isNodeEnvironment = (() => {
  try {
    // These modules only exist in Node.js
    // Using dynamic imports to prevent Vite from trying to bundle them
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
})();

const initializeDb = async () => {
  if (!isNodeEnvironment) {
    console.log('Browser environment detected, using mock database interface');
    // In browser environment, create a mock DB interface
    db = {
      schema: {
        hasTable: async () => false,
        createTable: async () => console.log('Mock: createTable called'),
      },
      fn: { now: () => new Date().toISOString() },
      select: () => db,
      insert: () => ({ returning: () => [1] }),
      where: () => db,
      update: () => Promise.resolve(1),
      delete: () => Promise.resolve(1),
      from: () => db,
      join: () => db,
      count: () => db,
      first: () => Promise.resolve({}),
      andWhere: () => db,
      orderBy: () => db,
      raw: () => ({ then: (fn: any) => fn(null, {}) }),
    };
    return;
  }

  try {
    // Only import Node.js specific modules if we're in Node
    knex = (await import('knex')).default;
    path = (await import('path')).default;
    fs = (await import('fs')).default;

    // Server-side SQLite setup
    // Ensure the data directory exists
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Configure the database connection
    db = knex({
      client: 'sqlite3',
      connection: {
        filename: path.join(dbDir, 'weather.sqlite'),
      },
      useNullAsDefault: true,
      pool: { 
        min: 1, 
        max: 1,
        afterCreate: (conn: any, cb: any) => {
          // Enable foreign key constraints
          conn.run('PRAGMA foreign_keys = ON', cb);
        }
      }
    });
    
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    // Provide a simple mock DB interface as fallback
    db = {
      schema: {
        hasTable: async () => false,
        createTable: async () => console.log('Mock: createTable called'),
      },
      fn: { now: () => new Date().toISOString() },
      select: () => db,
      insert: () => ({ returning: () => [1] }),
      where: () => db,
      update: () => Promise.resolve(1),
      delete: () => Promise.resolve(1),
      from: () => db,
      join: () => db,
      count: () => db,
      first: () => Promise.resolve({}),
      andWhere: () => db,
      orderBy: () => db,
    };
  }
};

// Initialize the database
initializeDb();

export default db;
