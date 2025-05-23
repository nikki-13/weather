import db from './dbConfig';
import { WeatherLocation } from '@/types/weather';

// Location Model
export async function findOrCreateLocation(location: WeatherLocation) {
  // Try to find existing location with same coordinates
  const existingLocation = await db('weather_locations')
    .where({ 
      lat: location.lat,
      lon: location.lon 
    })
    .first();

  if (existingLocation) {
    return existingLocation.id;
  }

  // Create new location if it doesn't exist
  const [locationId] = await db('weather_locations').insert({
    name: location.name,
    lat: location.lat,
    lon: location.lon,
    country: location.country,
    state: location.state || null
  });

  return locationId;
}

export async function getAllLocations() {
  return await db('weather_locations').select('*');
}

export async function getLocationById(id: number) {
  return await db('weather_locations').where({ id }).first();
}

export async function updateLocation(id: number, data: Partial<WeatherLocation>) {
  await db('weather_locations').where({ id }).update({
    name: data.name,
    country: data.country,
    state: data.state
  });
  
  return await getLocationById(id);
}

export async function deleteLocation(id: number) {
  // This will cascade delete all associated weather records
  return await db('weather_locations').where({ id }).delete();
}
