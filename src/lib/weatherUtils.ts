
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

export const exportToXML = (data: any): string => {
  const createXMLElement = (key: string, value: any): string => {
    // Handle null or undefined values
    if (value === null || value === undefined) {
      return `<${key}></${key}>`;
    }
    
    // Special handling for temperatures array to better structure the XML
    if (key === 'temperatures' && Array.isArray(value)) {
      return `<${key}>${value.map((item) => 
        `<weatherRecord>
          <date>${escapeXML(String(item.date || ''))}</date>
          <temperature>${escapeXML(String(item.temp || ''))}</temperature>
          ${item.temp_min ? `<temperatureMin>${escapeXML(String(item.temp_min))}</temperatureMin>` : ''}
          ${item.temp_max ? `<temperatureMax>${escapeXML(String(item.temp_max))}</temperatureMax>` : ''}
          ${item.feels_like ? `<feelsLike>${escapeXML(String(item.feels_like))}</feelsLike>` : ''}
          ${item.description ? `<description>${escapeXML(String(item.description))}</description>` : ''}
          ${item.humidity ? `<humidity>${escapeXML(String(item.humidity))}</humidity>` : ''}
          ${item.wind_speed ? `<windSpeed>${escapeXML(String(item.wind_speed))}</windSpeed>` : ''}
          ${item.wind_deg ? `<windDirection>${escapeXML(String(item.wind_deg))}</windDirection>` : ''}
          ${item.wind_gust ? `<windGust>${escapeXML(String(item.wind_gust))}</windGust>` : ''}
          ${item.pressure ? `<pressure>${escapeXML(String(item.pressure))}</pressure>` : ''}
          ${item.visibility ? `<visibility>${escapeXML(String(item.visibility))}</visibility>` : ''}
          ${item.cloudiness !== undefined ? `<cloudiness>${escapeXML(String(item.cloudiness))}</cloudiness>` : ''}
          ${item.rain_1h ? `<rain>${escapeXML(String(item.rain_1h))}</rain>` : ''}
          ${item.snow_1h ? `<snow>${escapeXML(String(item.snow_1h))}</snow>` : ''}
          ${item.icon ? `<icon>${escapeXML(String(item.icon))}</icon>` : ''}
        </weatherRecord>`
      ).join('')}</${key}>`;
    }
    
    // Handle regular arrays
    if (Array.isArray(value)) {
      return `<${key}>${value.map((item, index) => 
        typeof item === 'object' 
          ? createXMLObject(`item_${index}`, item)
          : `<item>${escapeXML(String(item))}</item>`
      ).join('')}</${key}>`;
    }
    
    // Handle objects
    if (typeof value === 'object') {
      return createXMLObject(key, value);
    }
    
    // Handle simple values
    return `<${key}>${escapeXML(String(value))}</${key}>`;
  };
  
  const createXMLObject = (name: string, obj: any): string => {
    // Add metadata for location
    let metadata = '';
    if (name === 'record' && obj.lat && obj.lon) {
      metadata = `<coordinates><latitude>${obj.lat}</latitude><longitude>${obj.lon}</longitude></coordinates>`;
    }
    
    const elements = Object.keys(obj).map(key => createXMLElement(key, obj[key]));
    return `<${name}>${metadata}${elements.join('')}</${name}>`;
  };
  
  const escapeXML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };
  
  return `<?xml version="1.0" encoding="UTF-8"?>\n<weatherData>${createXMLObject('record', data)}</weatherData>`;
};

export const exportToMarkdown = (data: any): string => {
  const formatMarkdownTable = (items: any[], title?: string): string => {
    if (!items || items.length === 0) return '';
    
    // For temperature records, create a more detailed table with only relevant columns
    if (title === 'Temperature Records') {
      const tempHeaders = [
        'Date', 'Temperature (°C)', 'Details', 'Wind', 'Conditions', 'Other'
      ];
      
      let markdown = `| ${tempHeaders.join(' | ')} |\n| ${tempHeaders.map(() => '---').join(' | ')} |\n`;
      
      items.forEach(item => {
        const tempDetails = item.temp_min && item.temp_max ? 
          `Min: ${item.temp_min}°C, Max: ${item.temp_max}°C<br>Feels like: ${item.feels_like || '-'}°C` : 
          `Feels like: ${item.feels_like || '-'}°C`;
          
        const windDetails = item.wind_speed ? 
          `${item.wind_speed} m/s${item.wind_deg ? `<br>Direction: ${item.wind_deg}°` : ''}${item.wind_gust ? `<br>Gusts: ${item.wind_gust} m/s` : ''}` : 
          '-';
          
        const conditions = item.description ? 
          `${item.description}${item.humidity ? `<br>Humidity: ${item.humidity}%` : ''}` : 
          (item.humidity ? `Humidity: ${item.humidity}%` : '-');
          
        const other = [
          item.pressure ? `Pressure: ${item.pressure} hPa` : '',
          item.visibility ? `Visibility: ${item.visibility} m` : '',
          item.cloudiness !== undefined ? `Cloudiness: ${item.cloudiness}%` : '',
          item.rain_1h ? `Rain: ${item.rain_1h} mm` : '',
          item.snow_1h ? `Snow: ${item.snow_1h} mm` : ''
        ].filter(Boolean).join('<br>') || '-';
        
        markdown += `| ${item.date} | ${item.temp}°C | ${tempDetails} | ${windDetails} | ${conditions} | ${other} |\n`;
      });
      
      return markdown;
    }
    
    // Default table formatting for other data
    const headers = Object.keys(items[0]);
    let markdown = `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n`;
    
    items.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        return typeof value === 'object' && value !== null 
          ? JSON.stringify(value) 
          : String(value || '');
      });
      markdown += `| ${row.join(' | ')} |\n`;
    });
    
    return markdown;
  };
  
  const formatMarkdownObject = (obj: any, level = 1): string => {
    let md = '';
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        
        if (key === 'temperatures' && Array.isArray(value)) {
          md += `\n${'#'.repeat(level + 1)} Weather Data\n\n`;
          md += formatMarkdownTable(value, 'Temperature Records');
          continue;
        }
        
        if (Array.isArray(value)) {
          md += `${'#'.repeat(level + 1)} ${key}\n\n`;
          value.forEach((item, index) => {
            md += `### Item ${index + 1}\n`;
            md += typeof item === 'object' 
              ? formatMarkdownObject(item, level + 2)
              : `${item}\n\n`;
          });
          continue;
        }
        
        if (typeof value === 'object' && value !== null) {
          md += `${'#'.repeat(level + 1)} ${key}\n`;
          md += formatMarkdownObject(value, level + 1);
          continue;
        }
        
        // Format coordinates nicely when they exist
        if (key === 'lat' && obj['lon'] !== undefined) {
          md += `**Coordinates**: ${value}° N, ${obj['lon']}° E\n\n`;
          continue;
        }
        if (key === 'lon' && obj['lat'] !== undefined) {
          // Skip to avoid duplicate, handled above
          continue;
        }
        
        md += `**${key}**: ${value}\n\n`;
      }
    }
    
    return md;
  };
  
  let markdown = `# Weather Record Export\n\n`;
  markdown += `*Generated on ${new Date().toLocaleString()}*\n\n`;
  markdown += formatMarkdownObject(data);
  
  return markdown;
};

interface PDFGenerationOptions {
  title: string;
}

export const getPDFBlob = async (htmlContent: string): Promise<Blob> => {
  // Dynamic import html2pdf.js
  const html2pdf = (await import('html2pdf.js')).default;
  
  return new Promise((resolve, reject) => {
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    document.body.appendChild(element);
    
    const options = {
      margin: 10,
      filename: 'weather-export.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(options).outputPdf('blob').then((pdf: Blob) => {
      document.body.removeChild(element);
      resolve(pdf);
    }).catch((error: Error) => {
      document.body.removeChild(element);
      reject(error);
    });
  });
};
