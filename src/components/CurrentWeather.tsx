
import React from "react";
import { WeatherData } from "@/types/weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WeatherIcon from "./WeatherIcon";
import { 
  formatDate, 
  formatTime, 
  capitalizeWeatherDesc, 
  isDaytime,
  getWeatherIconName,
  formatWindDirection
} from "@/lib/weatherUtils";

interface CurrentWeatherProps {
  data: WeatherData;
}

const CurrentWeather = ({ data }: CurrentWeatherProps) => {
  const { dt, main, weather, wind, sys, name, visibility, clouds, rain, snow } = data;
  const isDay = isDaytime(dt, sys.sunrise, sys.sunset);
  const iconName = getWeatherIconName(weather[0].id, isDay);
  
  return (
    <Card className="overflow-hidden mb-6">
      <div 
        className={`w-full ${isDay ? 'bg-weather-blue' : 'bg-weather-gray-dark text-white'} p-6`}
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="text-sm">{formatDate(dt)}</div>
            <h2 className="text-3xl font-bold mb-1">{name}</h2>
            <div className="text-xl">{capitalizeWeatherDesc(weather[0].description)}</div>
          </div>
          
          <div className="flex items-center">
            <WeatherIcon name={iconName} size={64} className="mr-4" />
            <div className="text-center">
              <div className="text-5xl font-bold">{Math.round(main.temp)}°C</div>
              <div className="text-sm">Feels like {Math.round(main.feels_like)}°C</div>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* First row: Primary metrics */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Wind</div>
            <div className="font-semibold">{Math.round(wind.speed)} m/s</div>
            <div className="text-xs">{formatWindDirection(wind.deg)}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Humidity</div>
            <div className="font-semibold">{main.humidity}%</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Pressure</div>
            <div className="font-semibold">{main.pressure} hPa</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">Visibility</div>
            <div className="font-semibold">{(visibility / 1000).toFixed(1)} km</div>
          </div>

          {/* Second row: Additional metrics */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Min Temp</div>
            <div className="font-semibold">{Math.round(main.temp_min)}°C</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">Max Temp</div>
            <div className="font-semibold">{Math.round(main.temp_max)}°C</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">Cloudiness</div>
            <div className="font-semibold">{clouds.all}%</div>
          </div>
          
          {/* Conditionally available data */}
          {wind.gust && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Wind Gust</div>
              <div className="font-semibold">{Math.round(wind.gust)} m/s</div>
            </div>
          )}
          
          {rain && rain["1h"] !== undefined && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Rain (1h)</div>
              <div className="font-semibold">{rain["1h"]} mm</div>
            </div>
          )}
          
          {snow && snow["1h"] !== undefined && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Snow (1h)</div>
              <div className="font-semibold">{snow["1h"]} mm</div>
            </div>
          )}
          
          {sys.sunrise !== 0 && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Sunrise</div>
              <div className="font-semibold">{formatTime(sys.sunrise)}</div>
            </div>
          )}
          
          {sys.sunset !== 0 && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Sunset</div>
              <div className="font-semibold">{formatTime(sys.sunset)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentWeather;
