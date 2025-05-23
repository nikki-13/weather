import db from './dbConfig';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export async function initializeDatabase() {
  // In browser, just mock the initialization
  if (isBrowser) {
    console.log('Browser environment detected - mocking database initialization');
    return true;
  }
  
  const tablesExist = await db.schema.hasTable('weather_locations');

  if (!tablesExist) {
    // Create location table
    await db.schema.createTable('weather_locations', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.float('lat').notNullable();
      table.float('lon').notNullable();
      table.string('country').notNullable();
      table.string('state');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.index(['lat', 'lon']);
    });

    // Create weather records table
    await db.schema.createTable('weather_records', (table) => {
      table.uuid('id').primary();
      table.integer('location_id').unsigned().references('id').inTable('weather_locations');
      table.date('start_date').notNullable();
      table.date('end_date').notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.index('location_id');
      table.index(['start_date', 'end_date']);
    });

    // Create weather temperature data table
    await db.schema.createTable('weather_temperatures', (table) => {
      table.increments('id').primary();
      table.uuid('record_id').references('id').inTable('weather_records').onDelete('CASCADE');
      table.date('date').notNullable();
      table.float('temp').notNullable();
      table.float('feels_like');
      table.string('description');
      table.string('icon');
      table.integer('humidity');
      table.float('wind_speed');
      table.float('pressure');
      table.float('visibility');
      table.float('cloudiness');
      table.float('rain_1h');
      table.float('snow_1h');
      table.float('temp_min');
      table.float('temp_max');
      table.integer('wind_deg');
      table.float('wind_gust');
      table.index('record_id');
    });
    
    console.log('Database tables created successfully');
  } else {
    console.log('Database already initialized');
  }
}

export async function closeDatabase() {
  // In browser, just mock the close operation
  if (isBrowser) {
    console.log('Browser environment detected - mocking database close');
    return;
  }
  
  try {
    await db.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}
