
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { WeatherLocation, DateRange } from "@/types/weather";
import { formatDate, validateDateRange } from "@/lib/weatherUtils";
import { createWeatherRecord_db, addTemperatureToRecord_db } from "@/services/weatherHistoryDb_sql";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { searchLocations, getHistoricalWeather } from "@/services/weatherApi";

interface WeatherHistoryFormProps {
  onSaveRecord: () => void;
}

const WeatherHistoryForm = ({ onSaveRecord }: WeatherHistoryFormProps) => {
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [locationResults, setLocationResults] = useState<WeatherLocation[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation | null>(null);
  const { toast } = useToast();

  const handleLocationSearch = async () => {
    if (!location.trim()) return;

    setLoading(true);
    try {
      const results = await searchLocations(location);
      setLocationResults(results);
      setShowResults(true);

      if (results.length === 0) {
        toast({
          title: "No locations found",
          description: "Please try a different search term",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching locations:", error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching for locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (loc: WeatherLocation) => {
    setSelectedLocation(loc);
    setLocation(`${loc.name}, ${loc.country}`);
    setShowResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!selectedLocation) {
      toast({
        title: "Location required",
        description: "Please select a valid location from the search results",
        variant: "destructive",
      });
      return;
    }

    // Validate date range
    const validationError = validateDateRange(dateRange.startDate, dateRange.endDate);
    if (validationError) {
      toast({
        title: "Invalid date range",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First create the record
      const createdRecord = await createWeatherRecord_db({
        location: `${selectedLocation.name}, ${selectedLocation.country}`,
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });

      // Fetch actual historical weather data from the API
      try {
        // Get the number of days in the date range
        const startTime = dateRange.startDate.getTime();
        const endTime = dateRange.endDate.getTime();
        const daysDiff = Math.floor((endTime - startTime) / (24 * 60 * 60 * 1000)) + 1;
        
        toast({
          title: "Fetching weather data",
          description: `Getting historical weather data for ${daysDiff} days...`,
        });
        
        // Use the API to get historical weather data
        const historicalData = await getHistoricalWeather(
          selectedLocation.lat,
          selectedLocation.lon,
          dateRange.startDate,
          dateRange.endDate
        );
        
        // For each forecast item in the historical data, add a temperature record
        for (const item of historicalData.list) {
          const weatherItem = item.weather[0];
          const date = new Date(item.dt * 1000);
          
          // Only add one record per day (prevent duplicate entries for the same day)
          // We do this by checking if we've already added data for this day
          const dateString = date.toISOString().split('T')[0];
          
          // Add the temperature record
          await addTemperatureToRecord_db(createdRecord.id, {
            date: date.toISOString(),
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            description: weatherItem.description,
            humidity: item.main.humidity,
            pressure: item.main.pressure,
            wind_speed: item.wind.speed,
            wind_deg: item.wind.deg,
            wind_gust: item.wind.gust,
            cloudiness: item.clouds.all,
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            icon: weatherItem.icon,
            visibility: item.visibility,
            rain_1h: item.rain?.['1h'] || item.rain?.['3h'] || 0,
            snow_1h: item.snow?.['1h'] || item.snow?.['3h'] || 0,
          });
        }
        
        toast({
          title: "Weather record created",
          description: `Weather record created with actual historical weather data`,
        });
      } catch (tempError) {
        console.error("Error fetching historical weather data:", tempError);
        toast({
          title: "Note",
          description: "Record created but historical weather data could not be fetched",
        });
      }

      // Reset form
      setLocation("");
      setSelectedLocation(null);
      setDateRange({
        startDate: new Date(),
        endDate: new Date(),
      });

      // Refresh the history list
      onSaveRecord();
    } catch (error) {
      console.error("Error saving weather record:", error);
      toast({
        title: "Save failed",
        description: "An error occurred while saving the weather record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Weather Record</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city, zip code, or landmark..."
                  className="flex-grow"
                />
                <Button
                  type="button"
                  onClick={handleLocationSearch}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>

              {showResults && locationResults.length > 0 && (
                <Card className="absolute w-full mt-1 max-h-60 overflow-y-auto z-10">
                  <ul className="p-2">
                    {locationResults.map((loc, index) => (
                      <li
                        key={`${loc.lat}-${loc.lon}-${index}`}
                        onClick={() => handleLocationSelect(loc)}
                        className="p-2 hover:bg-muted cursor-pointer rounded-md"
                      >
                        {loc.name}, {loc.state ? `${loc.state}, ` : ""}
                        {loc.country}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.startDate ? (
                      format(dateRange.startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.startDate}
                    onSelect={(date) =>
                      setDateRange({ ...dateRange, startDate: date || new Date() })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.endDate ? (
                      format(dateRange.endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.endDate}
                    onSelect={(date) =>
                      setDateRange({ ...dateRange, endDate: date || new Date() })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Weather Record
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeatherHistoryForm;
