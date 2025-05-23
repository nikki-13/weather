import { 
  findOrCreateLocation, 
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation
} from './database/locationModel';

import {
  createWeatherRecord,
  getAllWeatherRecords,
  getWeatherRecordById,
  updateWeatherRecord,
  deleteWeatherRecord,
  addTemperatureToRecord,
  getTemperaturesForRecord,
  updateTemperature,
  deleteTemperature
} from './database/weatherModel';

import { initializeDatabase, closeDatabase } from './database/dbInit';
import { WeatherHistoryRecord, WeatherLocation, TemperatureRecord } from '@/types/weather';
import * as weatherHistoryLocalStorage from './weatherHistoryDb';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize the database when the service is first imported, but only in Node.js environment
if (!isBrowser) {
  initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
  });
} else {
  console.log('Browser environment detected, using localStorage fallback');
}

// Function to get all weather history records
export const getAllWeatherRecords_db = async (): Promise<WeatherHistoryRecord[]> => {
  try {
    if (isBrowser) {
      console.log('Using localStorage for getAllWeatherRecords_db');
      return weatherHistoryLocalStorage.getAllWeatherRecords();
    }
    return await getAllWeatherRecords();
  } catch (error) {
    console.error('Error retrieving weather history:', error);
    return weatherHistoryLocalStorage.getAllWeatherRecords();
  }
};

// Function to get a weather history record by ID
export const getWeatherRecordById_db = async (id: string): Promise<WeatherHistoryRecord | undefined> => {
  try {
    if (isBrowser) {
      console.log('Using localStorage for getWeatherRecordById_db');
      return weatherHistoryLocalStorage.getWeatherRecordById(id);
    }
    const record = await getWeatherRecordById(id);
    return record || undefined;
  } catch (error) {
    console.error('Error retrieving weather record:', error);
    return weatherHistoryLocalStorage.getWeatherRecordById(id);
  }
};

// Function to create a new weather history record
export const createWeatherRecord_db = async (record: Omit<WeatherHistoryRecord, 'id' | 'createdAt'>): Promise<WeatherHistoryRecord> => {
  try {
    if (isBrowser) {
      console.log('Using localStorage for createWeatherRecord_db');
      return weatherHistoryLocalStorage.createWeatherRecord(record);
    }
    
    // Find or create the location
    const locationData: WeatherLocation = {
      name: record.location.split(',')[0].trim(),
      lat: record.lat || 0,
      lon: record.lon || 0,
      country: record.location.split(',')[1]?.trim() || 'Unknown'
    };
    
    const locationId = await findOrCreateLocation(locationData);
    
    // Create the weather record
    const recordId = await createWeatherRecord({
      locationId,
      startDate: record.startDate,
      endDate: record.endDate
    });
    
    // Add temperature data if available
    if (record.temperatures && record.temperatures.length > 0) {
      for (const temp of record.temperatures) {
        await addTemperatureToRecord(recordId, temp);
      }
    }
    
    const createdRecord = await getWeatherRecordById(recordId);
    if (!createdRecord) {
      throw new Error(`Failed to retrieve created record with ID ${recordId}`);
    }
    
    return createdRecord;
  } catch (error) {
    console.error('Error creating weather record:', error);
    
    // Fall back to localStorage
    console.log('Falling back to localStorage for record creation');
    return weatherHistoryLocalStorage.createWeatherRecord(record);
  }
};

// Function to update a weather history record
export const updateWeatherRecord_db = async (
  id: string,
  updates: Partial<Omit<WeatherHistoryRecord, 'id' | 'createdAt'>>
): Promise<WeatherHistoryRecord> => {
  try {
    if (isBrowser) {
      console.log('Using localStorage for updateWeatherRecord_db');
      return weatherHistoryLocalStorage.updateWeatherRecord(id, updates);
    }
    
    const updatedRecord = await updateWeatherRecord(id, {
      location: updates.location,
      startDate: updates.startDate,
      endDate: updates.endDate
    });
    
    if (!updatedRecord) {
      throw new Error(`Weather record with ID ${id} not found`);
    }
    
    return updatedRecord;
  } catch (error) {
    console.error('Error updating weather record:', error);
    // Fall back to localStorage
    return weatherHistoryLocalStorage.updateWeatherRecord(id, updates);
  }
};

// Function to delete a weather history record
export const deleteWeatherRecord_db = async (id: string): Promise<boolean> => {
  try {
    if (isBrowser) {
      console.log('Using localStorage for deleteWeatherRecord_db');
      return weatherHistoryLocalStorage.deleteWeatherRecord(id);
    }
    
    const deleted = await deleteWeatherRecord(id);
    return deleted > 0;
  } catch (error) {
    console.error('Error deleting weather record:', error);
    // Fall back to localStorage
    return weatherHistoryLocalStorage.deleteWeatherRecord(id);
  }
};

// Function to add temperature records to a weather history record
export const addTemperatureToRecord_db = async (recordId: string, temperature: TemperatureRecord): Promise<WeatherHistoryRecord> => {
  try {
    if (isBrowser) {
      console.log('Using localStorage for addTemperatureToRecord_db');
      // Need to implement this function in localStorage service
      const record = weatherHistoryLocalStorage.getWeatherRecordById(recordId);
      if (!record) throw new Error(`Weather record with ID ${recordId} not found`);
      
      const updatedTemps = [...(record.temperatures || []), temperature];
      return weatherHistoryLocalStorage.updateWeatherRecord(recordId, { temperatures: updatedTemps });
    }
    
    const updatedRecord = await addTemperatureToRecord(recordId, temperature);
    
    if (!updatedRecord) {
      throw new Error(`Weather record with ID ${recordId} not found`);
    }
    
    return updatedRecord;
  } catch (error) {
    console.error('Error adding temperature to record:', error);
    // Fall back to localStorage
    const record = weatherHistoryLocalStorage.getWeatherRecordById(recordId);
    if (!record) throw new Error(`Weather record with ID ${recordId} not found`);
    
    const updatedTemps = [...(record.temperatures || []), temperature];
    return weatherHistoryLocalStorage.updateWeatherRecord(recordId, { temperatures: updatedTemps });
  }
};

// Gracefully close database connection when application exits
// Only add the event listener in Node.js environments
if (typeof process !== 'undefined' && process.on) {
  process.on('exit', () => {
    closeDatabase().catch(console.error);
  });
}

// Export the type
export type WeatherHistoryDb_SQL = {
  getAllWeatherRecords: typeof getAllWeatherRecords_db;
  getWeatherRecordById: typeof getWeatherRecordById_db;
  createWeatherRecord: typeof createWeatherRecord_db;
  updateWeatherRecord: typeof updateWeatherRecord_db;
  deleteWeatherRecord: typeof deleteWeatherRecord_db;
  addTemperatureToRecord: typeof addTemperatureToRecord_db;
};
