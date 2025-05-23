
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
    if (value === null || value === undefined) {
      return `<${key}></${key}>`;
    }
    
    if (Array.isArray(value)) {
      return `<${key}>${value.map((item, index) => 
        typeof item === 'object' 
          ? createXMLObject(`item_${index}`, item)
          : `<item>${escapeXML(String(item))}</item>`
      ).join('')}</${key}>`;
    }
    
    if (typeof value === 'object') {
      return createXMLObject(key, value);
    }
    
    return `<${key}>${escapeXML(String(value))}</${key}>`;
  };
  
  const createXMLObject = (name: string, obj: any): string => {
    const elements = Object.keys(obj).map(key => createXMLElement(key, obj[key]));
    return `<${name}>${elements.join('')}</${name}>`;
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
  const formatMarkdownTable = (items: any[]): string => {
    if (!items || items.length === 0) return '';
    
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
          md += `\n${'#'.repeat(level + 1)} Temperature Records\n\n`;
          md += formatMarkdownTable(value);
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
