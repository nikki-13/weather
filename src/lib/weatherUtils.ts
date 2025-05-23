
import { format, parseISO, isValid } from 'date-fns';

// Format a date in a user-friendly way
export const formatDate = (dateStr: string | number, formatStr: string = 'MMM d, yyyy'): string => {
  try {
    let date: Date;
    
    if (typeof dateStr === 'number') {
      // If it's a Unix timestamp (in seconds), convert to milliseconds
      date = new Date(dateStr * 1000);
    } else {
      date = parseISO(dateStr);
    }
    
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Format time from a Unix timestamp
export const formatTime = (timestamp: number): string => {
  try {
    const date = new Date(timestamp * 1000);
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

// Convert temperature from Celsius to Fahrenheit
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

// Get weather description with first letter capitalized
export const capitalizeWeatherDesc = (description: string): string => {
  return description.charAt(0).toUpperCase() + description.slice(1);
};

// Group forecast items by day
export const groupForecastByDay = (forecastList: any[]): Record<string, any[]> => {
  return forecastList.reduce((days: Record<string, any[]>, item: any) => {
    const date = format(new Date(item.dt * 1000), 'yyyy-MM-dd');
    if (!days[date]) {
      days[date] = [];
    }
    days[date].push(item);
    return days;
  }, {});
};

// Determine if it's day or night based on current time and sunrise/sunset
export const isDaytime = (dt: number, sunrise: number, sunset: number): boolean => {
  // If sunrise and sunset are 0, use a simple day/night calculation based on hour
  if (sunrise === 0 && sunset === 0) {
    const hour = new Date(dt * 1000).getHours();
    return hour >= 6 && hour < 18; // Day is from 6 AM to 6 PM
  }
  return dt > sunrise && dt < sunset;
};

// Determine the appropriate weather gradient class based on weather conditions
export const getWeatherGradientClass = (
  weatherId: number, 
  isDay: boolean,
): string => {
  // Weather condition codes: https://openweathermap.org/weather-conditions
  if (weatherId >= 200 && weatherId < 600) {
    // Thunderstorm, drizzle, rain
    return 'weather-gradient-rainy';
  } else if (weatherId >= 600 && weatherId < 700) {
    // Snow
    return isDay ? 'weather-gradient-cloudy' : 'weather-gradient-night';
  } else if (weatherId >= 801) {
    // Cloudy
    return 'weather-gradient-cloudy';
  } else {
    // Clear or mostly clear
    return isDay ? 'weather-gradient-day' : 'weather-gradient-night';
  }
};

// Get appropriate weather icon based on weather conditions and time of day
export const getWeatherIconName = (weatherId: number, isDay: boolean): string => {
  // Weather condition codes: https://openweathermap.org/weather-conditions
  if (weatherId >= 200 && weatherId < 300) {
    return 'cloud-lightning'; // Thunderstorm
  } else if (weatherId >= 300 && weatherId < 600) {
    return 'cloud-rain'; // Drizzle and Rain
  } else if (weatherId >= 600 && weatherId < 700) {
    return 'cloud-snow'; // Snow
  } else if (weatherId >= 700 && weatherId < 800) {
    return 'wind'; // Atmosphere (fog, mist, etc.)
  } else if (weatherId === 800) {
    return isDay ? 'sun' : 'moon'; // Clear sky
  } else {
    return isDay ? 'cloud-sun' : 'cloud-moon-rain'; // Clouds
  }
};

// Format wind direction in degrees to compass direction
export const formatWindDirection = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

// Validate a date range
export const validateDateRange = (startDate: Date, endDate: Date): string | null => {
  if (!isValid(startDate)) {
    return 'Invalid start date';
  }
  
  if (!isValid(endDate)) {
    return 'Invalid end date';
  }
  
  if (startDate > endDate) {
    return 'Start date must be before end date';
  }
  
  const today = new Date();
  if (endDate > today) {
    return 'End date cannot be in the future';
  }
  
  // Calculate the difference in days
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 30) {
    return 'Date range cannot exceed 30 days';
  }
  
  return null;
};

// Export data to different formats
export const exportToJSON = (data: any): string => {
  return JSON.stringify(data, null, 2);
};

export const exportToCSV = (data: any[]): string => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects
        const cellValue = typeof value === 'object' && value !== null 
          ? JSON.stringify(value).replace(/"/g, '""') 
          : value;
        return `"${cellValue}"`;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
};
