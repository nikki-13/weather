import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { searchLocations } from "@/services/weatherApi";
import { getDefaultLocation, saveDefaultLocation } from "@/services/weatherApi";
import { WeatherLocation } from "@/types/weather";

const LocationPreferences = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [defaultLocation, setDefaultLocation] = useState<{ 
    lat: number;
    lon: number;
    name: string;
    country: string;
  } | null>(null);
  const { toast } = useToast();

  // Load saved default location on mount
  useEffect(() => {
    const savedLocation = getDefaultLocation();
    if (savedLocation) {
      setDefaultLocation(savedLocation);
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
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

  const handleLocationSelect = (location: WeatherLocation) => {
    // Save the selected location
    const locationToSave = {
      lat: location.lat,
      lon: location.lon,
      name: location.name,
      country: location.country
    };
    
    saveDefaultLocation(locationToSave);
    setDefaultLocation(locationToSave);
    setShowResults(false);
    
    toast({
      title: "Default location set",
      description: `${location.name}, ${location.country} set as your default location`,
    });
  };

  const handleClearDefault = () => {
    localStorage.removeItem('defaultLocation');
    setDefaultLocation(null);
    
    toast({
      title: "Default location cleared",
      description: "Your default location preference has been removed",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {defaultLocation ? (
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Your Default Location</h3>
            <p className="mb-4">{defaultLocation.name}, {defaultLocation.country}</p>
            <Button variant="outline" size="sm" onClick={handleClearDefault}>
              Remove Default Location
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">No default location set. Search for a location below to set it as your default.</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="location-search">Search for a location</Label>
          <div className="relative">
            <div className="flex gap-2">
              <Input
                id="location-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city, zip code, or landmark..."
                className="flex-grow"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            {showResults && searchResults.length > 0 && (
              <Card className="absolute w-full mt-1 max-h-60 overflow-y-auto z-10">
                <ul className="p-2">
                  {searchResults.map((loc, index) => (
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
      </CardContent>
    </Card>
  );
};

export default LocationPreferences;
