import db from './dbConfig';
import { v4 as uuidv4 } from 'uuid';
import { WeatherHistoryRecord, TemperatureRecord } from '@/types/weather';

// Weather Record Model
export async function createWeatherRecord(record: {
  locationId: number;
  startDate: string;
  endDate: string;
}) {
  const id = uuidv4();
  
  await db('weather_records').insert({
    id,
    location_id: record.locationId,
    start_date: record.startDate,
    end_date: record.endDate
  });
  
  return id;
}

export async function getAllWeatherRecords() {
  const records = await db('weather_records as wr')
    .join('weather_locations as wl', 'wr.location_id', 'wl.id')
    .select(
      'wr.id',
      'wl.name as location',
      'wl.lat',
      'wl.lon',
      'wr.start_date as startDate',
      'wr.end_date as endDate', 
      'wr.created_at as createdAt'
    )
    .orderBy('wr.created_at', 'desc');

  // Get temperatures for each record
  for (const record of records) {
    record.temperatures = await getTemperaturesForRecord(record.id);
  }
  
  return records;
}

export async function getWeatherRecordById(id: string) {
  const record = await db('weather_records as wr')
    .join('weather_locations as wl', 'wr.location_id', 'wl.id')
    .where('wr.id', id)
    .select(
      'wr.id',
      'wl.name as location',
      'wl.lat',
      'wl.lon',
      'wr.start_date as startDate',
      'wr.end_date as endDate',
      'wr.created_at as createdAt'
    )
    .first();
    
  if (!record) return null;
  
  // Get temperatures for this record
  record.temperatures = await getTemperaturesForRecord(id);
  
  return record;
}

export async function updateWeatherRecord(id: string, data: {
  startDate?: string;
  endDate?: string;
  location?: string;
}) {
  // Only update the dates in the weather_records table
  if (data.startDate || data.endDate) {
    await db('weather_records')
      .where({ id })
      .update({
        start_date: data.startDate,
        end_date: data.endDate
      });
  }
  
  return await getWeatherRecordById(id);
}

export async function deleteWeatherRecord(id: string) {
  return await db('weather_records').where({ id }).delete();
}

// Temperature Data Model
export async function addTemperatureToRecord(recordId: string, temperature: TemperatureRecord) {
  await db('weather_temperatures').insert({
    record_id: recordId,
    date: temperature.date,
    temp: temperature.temp,
    feels_like: temperature.feels_like,
    description: temperature.description,
    icon: temperature.icon,
    humidity: temperature.humidity,
    wind_speed: temperature.wind_speed,
    pressure: temperature.pressure,
    visibility: temperature.visibility,
    cloudiness: temperature.cloudiness,
    rain_1h: temperature.rain_1h,
    snow_1h: temperature.snow_1h,
    temp_min: temperature.temp_min,
    temp_max: temperature.temp_max,
    wind_deg: temperature.wind_deg,
    wind_gust: temperature.wind_gust
  });
  
  return await getWeatherRecordById(recordId);
}

export async function getTemperaturesForRecord(recordId: string) {
  return await db('weather_temperatures')
    .where({ record_id: recordId })
    .select('*')
    .orderBy('date', 'asc')
    .then(temps => temps.map(temp => ({
      date: temp.date,
      temp: temp.temp,
      feels_like: temp.feels_like,
      description: temp.description,
      icon: temp.icon,
      humidity: temp.humidity,
      wind_speed: temp.wind_speed,
      pressure: temp.pressure,
      visibility: temp.visibility,
      cloudiness: temp.cloudiness,
      rain_1h: temp.rain_1h,
      snow_1h: temp.snow_1h,
      temp_min: temp.temp_min,
      temp_max: temp.temp_max,
      wind_deg: temp.wind_deg,
      wind_gust: temp.wind_gust
    })));
}

export async function updateTemperature(id: number, data: Partial<TemperatureRecord>) {
  await db('weather_temperatures')
    .where({ id })
    .update({
      temp: data.temp,
      feels_like: data.feels_like,
      description: data.description,
      humidity: data.humidity,
      wind_speed: data.wind_speed,
      // Add other fields as needed
    });
  
  // Get the record_id to return the updated record
  const temp = await db('weather_temperatures')
    .where({ id })
    .select('record_id')
    .first();
    
  if (temp) {
    return await getWeatherRecordById(temp.record_id);
  }
  
  return null;
}

export async function deleteTemperature(id: number) {
  // Get the record_id before deleting
  const temp = await db('weather_temperatures')
    .where({ id })
    .select('record_id')
    .first();
    
  if (!temp) return null;
  
  await db('weather_temperatures').where({ id }).delete();
  
  return await getWeatherRecordById(temp.record_id);
}
