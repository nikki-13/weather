
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { searchLocations } from "@/services/weatherApi";
import { WeatherLocation } from "@/types/weather";

interface SearchBoxProps {
  onSelectLocation: (location: WeatherLocation) => void;
  onUseGeolocation: () => void;
}

const SearchBox = ({ onSelectLocation, onUseGeolocation }: SearchBoxProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const searchRef = useRef<HTMLDivElement>(null);

  // Hide results when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const locations = await searchLocations(query);
      setResults(locations);
      setShowResults(true);
      
      if (locations.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different location or check your spelling.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Error searching for locations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocation = () => {
    onUseGeolocation();
  };

  const handleSelectLocation = (location: WeatherLocation) => {
    setQuery(`${location.name}, ${location.country}`);
    setShowResults(false);
    onSelectLocation(location);
  };

  return (
    <div ref={searchRef} className="w-full mb-6">
      <div className="flex gap-2 relative">
        <Input
          type="text"
          placeholder="Enter city, zip code, or landmark..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
        <Button 
          onClick={handleGeolocation} 
          variant="outline"
          className="whitespace-nowrap"
        >
          My Location
        </Button>
      </div>
      
      {showResults && results.length > 0 && (
        <Card className="absolute w-[calc(100%-6rem)] max-w-3xl max-h-60 mt-1 overflow-y-auto z-10">
          <ul className="p-2">
            {results.map((location, index) => (
              <li
                key={`${location.lat}-${location.lon}-${index}`}
                onClick={() => handleSelectLocation(location)}
                className="p-2 hover:bg-muted cursor-pointer rounded-md"
              >
                {location.name}, {location.state ? `${location.state}, ` : ""}
                {location.country}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default SearchBox;
