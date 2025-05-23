
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastData, ForecastItem } from "@/types/weather";
import { formatDate, groupForecastByDay, getWeatherIconName, isDaytime } from "@/lib/weatherUtils";
import WeatherIcon from "./WeatherIcon";
import { Separator } from "@/components/ui/separator";

interface ForecastWeatherProps {
  data: ForecastData;
}

const ForecastWeather = ({ data }: ForecastWeatherProps) => {
  const { list, city } = data;
  const dailyForecasts = groupForecastByDay(list);
  
  // Get daily summary (take midday forecast for each day)
  const getDailySummary = (items: ForecastItem[]) => {
    // Try to get afternoon forecast (around 12-15)
    const midDayForecast = items.find(item => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 12 && hour <= 15;
    });
    
    // If no afternoon forecast, just take the first one
    return midDayForecast || items[0];
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>5-Day Forecast</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(dailyForecasts).slice(0, 5).map(([date, items], index) => {
            const summary = getDailySummary(items);
            const isDay = true; // Always use day icons for forecast
            const iconName = getWeatherIconName(summary.weather[0].id, isDay);
            
            return (
              <div key={date}>
                {index > 0 && <Separator className="my-2" />}
                <div className="flex justify-between items-center py-2">
                  <div className="font-medium">
                    {formatDate(date, 'EEEE, MMM d')}
                  </div>
                  
                  <div className="flex items-center">
                    <WeatherIcon name={iconName} className="mr-2" />
                    <span>{Math.round(summary.main.temp)}°C</span>
                  </div>
                  
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {summary.weather[0].description}
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">{Math.round(summary.main.temp_max)}°</span>
                    <span className="text-muted-foreground ml-1">
                      {Math.round(summary.main.temp_min)}°
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastWeather;
