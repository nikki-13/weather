
import { v4 as uuidv4 } from 'uuid';
import { WeatherHistoryRecord, TemperatureRecord } from '@/types/weather';

// Local storage key for weather history
const STORAGE_KEY = 'weather_history_records';

// Function to get all weather history records
export const getAllWeatherRecords = (): WeatherHistoryRecord[] => {
  try {
    const records = localStorage.getItem(STORAGE_KEY);
    return records ? JSON.parse(records) : [];
  } catch (error) {
    console.error('Error retrieving weather history:', error);
    return [];
  }
};

// Function to get a weather history record by ID
export const getWeatherRecordById = (id: string): WeatherHistoryRecord | undefined => {
  try {
    const records = getAllWeatherRecords();
    return records.find(record => record.id === id);
  } catch (error) {
    console.error('Error retrieving weather record:', error);
    return undefined;
  }
};

// Function to create a new weather history record
export const createWeatherRecord = (record: Omit<WeatherHistoryRecord, 'id' | 'createdAt'>): WeatherHistoryRecord => {
  try {
    const newRecord: WeatherHistoryRecord = {
      ...record,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    
    const records = getAllWeatherRecords();
    records.unshift(newRecord); // Add to the beginning of the array
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return newRecord;
  } catch (error) {
    console.error('Error creating weather record:', error);
    throw error;
  }
};

// Function to update an existing weather history record
export const updateWeatherRecord = (id: string, updates: Partial<WeatherHistoryRecord>): WeatherHistoryRecord => {
  try {
    const records = getAllWeatherRecords();
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) {
      throw new Error(`Weather record with ID ${id} not found`);
    }
    
    const updatedRecord = { ...records[index], ...updates };
    records[index] = updatedRecord;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return updatedRecord;
  } catch (error) {
    console.error('Error updating weather record:', error);
    throw error;
  }
};

// Function to delete a weather history record
export const deleteWeatherRecord = (id: string): boolean => {
  try {
    const records = getAllWeatherRecords();
    const filteredRecords = records.filter(record => record.id !== id);
    
    if (filteredRecords.length === records.length) {
      return false; // No record was deleted
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
    return true;
  } catch (error) {
    console.error('Error deleting weather record:', error);
    return false;
  }
};

// Function to add temperature records to a weather history record
export const addTemperatureToRecord = (recordId: string, temperature: TemperatureRecord): WeatherHistoryRecord => {
  try {
    const records = getAllWeatherRecords();
    const index = records.findIndex(record => record.id === recordId);
    
    if (index === -1) {
      throw new Error(`Weather record with ID ${recordId} not found`);
    }
    
    const record = records[index];
    const temperatures = record.temperatures || [];
    
    // Add the new temperature record
    const updatedTemperatures = [...temperatures, temperature];
    const updatedRecord = { ...record, temperatures: updatedTemperatures };
    
    records[index] = updatedRecord;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    
    return updatedRecord;
  } catch (error) {
    console.error('Error adding temperature to record:', error);
    throw error;
  }
};

// Function to clear all weather history records (for testing or resetting)
export const clearWeatherRecords = (): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
};

// Export the type
export type WeatherHistoryDb = {
  getAllWeatherRecords: typeof getAllWeatherRecords;
  getWeatherRecordById: typeof getWeatherRecordById;
  createWeatherRecord: typeof createWeatherRecord;
  updateWeatherRecord: typeof updateWeatherRecord;
  deleteWeatherRecord: typeof deleteWeatherRecord;
  addTemperatureToRecord: typeof addTemperatureToRecord;
  clearWeatherRecords: typeof clearWeatherRecords;
};
