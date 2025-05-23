
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import SearchBox from "@/components/SearchBox";
import CurrentWeather from "@/components/CurrentWeather";
import ForecastWeather from "@/components/ForecastWeather";
import WeatherHistoryForm from "@/components/WeatherHistoryForm";
import WeatherHistoryList from "@/components/WeatherHistoryList";
import DatabaseStatus from "@/components/DatabaseStatus";
// Import the migration tool
import DataMigrationTool from "@/components/DataMigrationTool";
import { WeatherLocation, WeatherData, ForecastData, WeatherView, WeatherHistoryRecord } from "@/types/weather";
import { getCurrentWeather, getForecast, getWeatherByGeolocation } from "@/services/weatherApi";
import { getAllWeatherRecords_db } from "@/services/weatherHistoryDb_sql";

const Index = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<WeatherView>("current");
  const [historyRecords, setHistoryRecords] = useState<WeatherHistoryRecord[]>([]);
  const { toast } = useToast();

  // Load weather history records on mount
  useEffect(() => {
    loadHistoryRecords();
  }, []);

  const loadHistoryRecords = async () => {
    const records = await getAllWeatherRecords_db();
    setHistoryRecords(records);
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(lat, lon),
        getForecast(lat, lon)
      ]);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Failed to fetch weather data. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: WeatherLocation) => {
    fetchWeatherData(location.lat, location.lon);
  };

  const handleUseGeolocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const { weather, location } = await getWeatherByGeolocation();
      const forecastData = await getForecast(weather.coord.lat, weather.coord.lon);

      setCurrentWeather(weather);
      setForecast(forecastData);
      toast({
        title: "Location detected",
        description: `Weather data for ${location}`,
      });
    } catch (err) {
      console.error("Geolocation error:", err);
      setError("Could not get your location. Please enable location services and try again.");
      toast({
        title: "Geolocation error",
        description: "Could not get your location. Please enable location services and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryUpdate = () => {
    loadHistoryRecords();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">Weather Dashboard</h1>

      <SearchBox
        onSelectLocation={handleLocationSelect}
        onUseGeolocation={handleUseGeolocation}
      />

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as WeatherView)}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="current" className="flex-1">Current Weather</TabsTrigger>
          <TabsTrigger value="forecast" className="flex-1">5-Day Forecast</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">Weather History</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-pulse text-center">
                <div className="h-8 w-32 bg-gray-200 mx-auto rounded mb-4"></div>
                <div className="h-24 w-24 bg-gray-200 mx-auto rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-gray-200 mx-auto rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setError(null)}
              >
                Try Again
              </Button>
            </div>
          ) : currentWeather ? (
            <CurrentWeather data={currentWeather} />
          ) : (
            <div className="text-center p-12">
              <p className="text-xl text-muted-foreground">
                Search for a location to see the current weather
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="forecast">
          {loading ? (
            <div className="flex flex-col gap-4 p-12">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex justify-between items-center">
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setError(null)}
              >
                Try Again
              </Button>
            </div>
          ) : forecast ? (
            <ForecastWeather data={forecast} />
          ) : (
            <div className="text-center p-12">
              <p className="text-xl text-muted-foreground">
                Search for a location to see the forecast
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {/* Database components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <DatabaseStatus />
            <DataMigrationTool />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <WeatherHistoryForm onSaveRecord={handleHistoryUpdate} />
            </div>
            <div>
              <WeatherHistoryList 
                records={historyRecords} 
                onRecordChange={handleHistoryUpdate}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
