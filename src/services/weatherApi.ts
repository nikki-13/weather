
import { WeatherData, WeatherLocation, ForecastData } from "@/types/weather";

// Get WeatherAPI.com API key from environment variables with fallback
const API_KEY = import.meta.env.VITE_WEATHERAPI_KEY || "";
const BASE_URL = "https://api.weatherapi.com/v1";

// Mock data for when API is not available
const MOCK_ENABLED = API_KEY === "" || import.meta.env.VITE_USE_MOCK_DATA === "true";

// Import mock data
import { mockLocations, mockWeatherData, mockForecastData } from "./mockData";

// Helper function to convert WeatherAPI.com format to OpenWeatherMap format
const convertWeatherApiToOpenWeatherFormat = (data: any): WeatherData => {
  const current = data.current;
  const location = data.location;
  
  return {
    coord: {
      lon: location.lon,
      lat: location.lat
    },
    weather: [
      {
        id: current.condition.code,
        main: current.condition.text,
        description: current.condition.text,
        icon: current.condition.icon.split('/').pop()?.replace('.png', '') || '01d'
      }
    ],
    base: "stations",
    main: {
      temp: current.temp_c,
      feels_like: current.feelslike_c,
      temp_min: current.temp_c - 1, // WeatherAPI doesn't provide min/max in current
      temp_max: current.temp_c + 1, // so we approximate
      pressure: current.pressure_mb,
      humidity: current.humidity
    },
    visibility: current.vis_km * 1000, // convert km to meters
    wind: {
      speed: current.wind_kph * 0.277778, // convert kph to m/s
      deg: current.wind_degree,
      gust: current.gust_kph * 0.277778 // convert kph to m/s
    },
    clouds: {
      all: current.cloud
    },
    dt: Math.floor(new Date(location.localtime).getTime() / 1000),
    sys: {
      type: 1,
      id: 1,
      country: location.country,
      // No sunrise/sunset data needed
      sunrise: 0,
      sunset: 0,
    },
    timezone: location.localtime_epoch - Math.floor(new Date().getTime() / 1000),
    id: parseInt(location.lat.toString() + location.lon.toString().replace('-', ''), 10),
    name: location.name,
    cod: 200
  };
};

// Helper function to convert WeatherAPI.com forecast to OpenWeatherMap format
const convertWeatherApiToOpenWeatherForecast = (data: any): ForecastData => {
  const location = data.location;
  const forecast = data.forecast;
  
  return {
    cod: "200",
    message: 0,
    cnt: forecast.forecastday.length * 8, // Typically 3 days with 8 3-hour periods per day
    list: forecast.forecastday.flatMap((day: any) => {
      // Create 8 entries per day (3-hour intervals)
      const dayTimestamp = new Date(day.date).getTime();
      return Array.from({ length: 8 }, (_, i) => {
        const hourOffset = i * 3; // 3-hour intervals
        const timestamp = dayTimestamp + hourOffset * 3600 * 1000;
        const hour = Math.floor(hourOffset % 24);
        
        // Use the hour data if available, otherwise use day average
        const hourData = day.hour.find((h: any) => new Date(h.time).getHours() === hour) || day.day;
        
        return {
          dt: Math.floor(timestamp / 1000),
          main: {
            temp: hourData.temp_c || day.day.avgtemp_c,
            feels_like: hourData.feelslike_c || day.day.avgtemp_c,
            temp_min: day.day.mintemp_c,
            temp_max: day.day.maxtemp_c,
            pressure: hourData.pressure_mb || 1013,
            sea_level: hourData.pressure_mb || 1013,
            grnd_level: hourData.pressure_mb || 1010,
            humidity: hourData.humidity || day.day.avghumidity,
            temp_kf: 0
          },
          weather: [
            {
              id: hourData.condition?.code || day.day.condition.code,
              main: hourData.condition?.text || day.day.condition.text,
              description: hourData.condition?.text || day.day.condition.text,
              icon: (hourData.condition?.icon || day.day.condition.icon).split('/').pop()?.replace('.png', '') || '01d'
            }
          ],
          clouds: { all: hourData.cloud || 0 },
          wind: {
            speed: (hourData.wind_kph || day.day.maxwind_kph) * 0.277778,
            deg: hourData.wind_degree || 0,
            gust: (hourData.gust_kph || day.day.maxwind_kph) * 0.277778
          },
          visibility: (hourData.vis_km || 10) * 1000,
          pop: day.day.daily_chance_of_rain ? day.day.daily_chance_of_rain / 100 : 0,
          sys: { pod: hour >= 6 && hour < 18 ? 'd' : 'n' },
          dt_txt: new Date(timestamp).toISOString().split('.')[0].replace('T', ' ')
        };
      });
    }),
    city: {
      id: parseInt(location.lat.toString() + location.lon.toString().replace('-', ''), 10),
      name: location.name,
      coord: {
        lat: location.lat,
        lon: location.lon
      },
      country: location.country,
      population: 0,
      timezone: location.localtime_epoch - Math.floor(new Date().getTime() / 1000),
      // No sunrise/sunset data needed
      sunrise: 0,
      sunset: 0,
    }
  };
};

// Function to search locations by query (city name, zip code, etc.)
export const searchLocations = async (query: string): Promise<WeatherLocation[]> => {
  try {
    // If mock data is enabled or no API key, return filtered mock locations
    if (MOCK_ENABLED) {
      console.log("Using mock location data");
      const lowerQuery = query.toLowerCase();
      return mockLocations.filter(loc => 
        loc.name.toLowerCase().includes(lowerQuery) || 
        (loc.country && loc.country.toLowerCase().includes(lowerQuery)) ||
        (loc.state && loc.state.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Using WeatherAPI.com for location search
    const response = await fetch(
      `${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch location data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return data.map((location: any) => ({
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        country: location.country,
        state: location.region,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error searching locations:", error);
    throw error;
  }
};

// Function to get current weather by coordinates
export const getCurrentWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    // If mock data is enabled or no API key, return mock data
    if (MOCK_ENABLED) {
      console.log("Using mock weather data");
      // Modify the mock data to use the requested coordinates
      return { 
        ...mockWeatherData, 
        coord: { lat, lon },
        name: lat.toFixed(2) + ", " + lon.toFixed(2) // Use coordinates as location name
      };
    }

    // Using WeatherAPI.com for current weather
    const response = await fetch(
      `${BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lon}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Convert WeatherAPI.com format to match OpenWeatherMap format expected by the app
    return convertWeatherApiToOpenWeatherFormat(data);
  } catch (error) {
    console.error("Error fetching current weather:", error);
    // If API call fails, fall back to mock data
    console.log("Falling back to mock weather data");
    return { 
      ...mockWeatherData, 
      coord: { lat, lon },
      name: lat.toFixed(2) + ", " + lon.toFixed(2)
    };
  }
};

// Function to get 5-day forecast by coordinates
export const getForecast = async (lat: number, lon: number): Promise<ForecastData> => {
  try {
    // If mock data is enabled or no API key, return mock data
    if (MOCK_ENABLED) {
      console.log("Using mock forecast data");
      // Modify the mock data to use the requested coordinates
      return {
        ...mockForecastData,
        city: {
          ...mockForecastData.city,
          coord: { lat, lon },
          name: lat.toFixed(2) + ", " + lon.toFixed(2)
        }
      };
    }

    // Using WeatherAPI.com for forecast data
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=5`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch forecast data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Convert WeatherAPI.com format to match OpenWeatherMap format expected by the app
    return convertWeatherApiToOpenWeatherForecast(data);
  } catch (error) {
    console.error("Error fetching forecast:", error);
    // If API call fails, fall back to mock data
    console.log("Falling back to mock forecast data");
    return {
      ...mockForecastData,
      city: {
        ...mockForecastData.city,
        coord: { lat, lon },
        name: lat.toFixed(2) + ", " + lon.toFixed(2)
      }
    };
  }
};

// Function to get current weather by user's geolocation
export const getWeatherByGeolocation = async (): Promise<{ weather: WeatherData, location: string }> => {
  try {
    // If mock data is enabled, simulate geolocation with London coordinates
    if (MOCK_ENABLED) {
      console.log("Using mock geolocation data");
      const weather = await getCurrentWeather(mockLocations[0].lat, mockLocations[0].lon);
      return { 
        weather, 
        location: `${mockLocations[0].name}, ${mockLocations[0].country}` 
      };
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const weather = await getCurrentWeather(latitude, longitude);
            resolve({ weather, location: `${weather.name}, ${weather.sys.country}` });
          } catch (error) {
            console.error("Error fetching geolocation weather data:", error);
            
            // Fall back to mock data
            console.log("Falling back to mock geolocation data");
            const weather = await getCurrentWeather(mockLocations[0].lat, mockLocations[0].lon);
            resolve({ 
              weather, 
              location: `${mockLocations[0].name}, ${mockLocations[0].country}` 
            });
          }
        },
        (error) => {
          console.error(`Geolocation error: ${error.message}`);
          
          // Fall back to mock data
          console.log("Falling back to mock geolocation data due to geolocation error");
          getCurrentWeather(mockLocations[0].lat, mockLocations[0].lon)
            .then(weather => {
              resolve({ 
                weather, 
                location: `${mockLocations[0].name}, ${mockLocations[0].country}` 
              });
            })
            .catch(err => reject(err));
        },
        { timeout: 5000 } // Add a timeout to avoid long waits
      );
    });
  } catch (error) {
    console.error("Error fetching geolocation weather:", error);
    
    // Last resort fallback to mock data
    console.log("Last resort fallback to mock geolocation data");
    const weather = await getCurrentWeather(mockLocations[0].lat, mockLocations[0].lon);
    return { 
      weather, 
      location: `${mockLocations[0].name}, ${mockLocations[0].country}` 
    };
  }
};

// Function to get historical weather data by coordinates for a date range
// WeatherAPI.com supports historical data in the free tier!
export const getHistoricalWeather = async (
  lat: number, 
  lon: number, 
  startDate: Date, 
  endDate: Date
): Promise<ForecastData> => {
  try {
    console.log(`Getting historical weather for dates: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // If mock data is enabled, return modified forecast data
    if (MOCK_ENABLED) {
      // Get forecast data as placeholder
      const forecastData = await getForecast(lat, lon);
      
      // Modify the list to simulate historical data
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      const historicalList = forecastData.list.map((item, index) => {
        const historicalDate = new Date(startDate);
        // Distribute the items across the requested date range
        historicalDate.setHours(
          historicalDate.getHours() + Math.floor(index * (daysDiff * 24) / forecastData.list.length)
        );
        
        return {
          ...item,
          dt: Math.floor(historicalDate.getTime() / 1000),
          dt_txt: historicalDate.toISOString().split(".")[0].replace("T", " ")
        };
      });
      
      return {
        ...forecastData,
        list: historicalList
      };
    }
    
    // Using WeatherAPI.com for historical data
    // WeatherAPI.com requires dates in YYYY-MM-DD format
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    // Calculate days between dates to determine how many API calls we need
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    // WeatherAPI.com allows bulk history for paid plans, but for free tier we need to get each day separately
    // We'll limit to 7 days to avoid excessive API calls
    const maxDays = Math.min(daysDiff, 7); 
    
    const historyPromises = [];
    const currentDate = new Date(startDate);
    
    // Make separate API calls for each day (up to maxDays)
    for (let i = 0; i < maxDays; i++) {
      const dateStr = formatDate(currentDate);
      
      historyPromises.push(
        fetch(`${BASE_URL}/history.json?key=${API_KEY}&q=${lat},${lon}&dt=${dateStr}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch historical data for ${dateStr}: ${response.status}`);
            }
            return response.json();
          })
      );
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const historyResults = await Promise.all(historyPromises);
    
    // Combine all history results
    const combinedData = {
      location: historyResults[0].location,
      forecast: {
        forecastday: historyResults.map(result => result.forecast.forecastday[0])
      }
    };
    
    // Convert to OpenWeatherMap format
    return convertWeatherApiToOpenWeatherForecast(combinedData);
  } catch (error) {
    console.error("Error fetching historical weather:", error);
    
    // Fall back to forecast data if historical data fails
    console.log("Falling back to forecast data for historical request");
    const forecastData = await getForecast(lat, lon);
    
    // Modify the list to simulate historical data
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const historicalList = forecastData.list.map((item, index) => {
      const historicalDate = new Date(startDate);
      historicalDate.setHours(
        historicalDate.getHours() + Math.floor(index * (daysDiff * 24) / forecastData.list.length)
      );
      
      return {
        ...item,
        dt: Math.floor(historicalDate.getTime() / 1000),
        dt_txt: historicalDate.toISOString().split(".")[0].replace("T", " ")
      };
    });
    
    return {
      ...forecastData,
      list: historicalList
    };
  }
};
