
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { WeatherHistoryRecord } from "@/types/weather";
import { updateWeatherRecord_db } from "@/services/weatherHistoryDb_sql";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { validateDateRange } from "@/lib/weatherUtils";

interface WeatherHistoryEditProps {
  record: WeatherHistoryRecord;
  onSave: () => void;
}

const WeatherHistoryEdit = ({ record, onSave }: WeatherHistoryEditProps) => {
  const [location, setLocation] = useState(record.location);
  const [startDate, setStartDate] = useState<Date>(new Date(record.startDate));
  const [endDate, setEndDate] = useState<Date>(new Date(record.endDate));
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date range
    const validationError = validateDateRange(startDate, endDate);
    if (validationError) {
      toast({
        title: "Invalid date range",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      await updateWeatherRecord_db(record.id, {
        location,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      toast({
        title: "Record updated",
        description: "Weather record has been updated successfully",
      });

      onSave();
    } catch (error) {
      console.error("Error updating record:", error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating the record",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
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
                id="endDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  );
};

export default WeatherHistoryEdit;
