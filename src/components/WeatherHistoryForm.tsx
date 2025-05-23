
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
import { createWeatherRecord_db } from "@/services/weatherHistoryDb_sql";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { searchLocations } from "@/services/weatherApi";

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

    try {
      // Save to SQLite database
      await createWeatherRecord_db({
        location: `${selectedLocation.name}, ${selectedLocation.country}`,
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });

      toast({
        title: "Weather record created",
        description: "Your weather history record has been saved",
      });

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
