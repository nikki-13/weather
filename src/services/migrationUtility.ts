import { getAllWeatherRecords as getAllLocalRecords } from './weatherHistoryDb';
import { createWeatherRecord_db } from './weatherHistoryDb_sql';

/**
 * Migrate data from localStorage to SQLite database
 * This function fetches all records from localStorage and imports them into the SQLite database
 * @returns Object containing counts of total records and successfully migrated records
 */
export const migrateDataToSQLite = async () => {
  try {
    console.log('Starting data migration from localStorage to SQLite...');
    
    // Get all records from localStorage
    const localRecords = getAllLocalRecords();
    console.log(`Found ${localRecords.length} records in localStorage`);
    
    // Keep track of migration results
    const results = {
      total: localRecords.length,
      success: 0,
      failures: 0,
      errors: [] as string[]
    };
    
    // Import each record into SQLite database
    for (const record of localRecords) {
      try {
        // Create a new record in the SQLite database
        await createWeatherRecord_db({
          location: record.location,
          lat: record.lat,
          lon: record.lon,
          startDate: record.startDate,
          endDate: record.endDate,
          temperatures: record.temperatures || []
        });
        
        results.success++;
      } catch (err) {
        console.error(`Failed to migrate record ${record.id}:`, err);
        results.failures++;
        results.errors.push(`Record ${record.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    console.log(`Migration complete: ${results.success} of ${results.total} records migrated successfully`);
    
    return {
      success: true,
      message: `Migration complete: ${results.success} of ${results.total} records migrated successfully`,
      details: results
    };
  } catch (err) {
    console.error('Migration failed:', err);
    return {
      success: false,
      message: `Migration failed: ${err instanceof Error ? err.message : String(err)}`,
      details: {
        total: 0,
        success: 0,
        failures: 0,
        errors: [err instanceof Error ? err.message : String(err)]
      }
    };
  }
};
