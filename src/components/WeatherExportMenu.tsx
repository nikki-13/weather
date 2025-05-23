import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { WeatherHistoryRecord } from "@/types/weather";
import { useToast } from "@/components/ui/use-toast";
import {
  exportToJSON,
  exportToCSV,
  exportToXML,
  exportToMarkdown,
  getPDFBlob,
} from "@/lib/weatherUtils";

interface WeatherExportMenuProps {
  record: WeatherHistoryRecord;
  label?: string;
}

const WeatherExportMenu: React.FC<WeatherExportMenuProps> = ({
  record,
  label = "Export",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Helper function to download file
  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper function to flatten record for CSV export
  const flattenRecordForCSV = (record: WeatherHistoryRecord) => {
    return record.temperatures?.map((temp) => ({
      location: record.location,
      latitude: record.lat || "",
      longitude: record.lon || "",
      date: temp.date,
      temp: temp.temp,
      temp_min: temp.temp_min || "",
      temp_max: temp.temp_max || "",
      feels_like: temp.feels_like || "",
      description: temp.description || "",
      humidity: temp.humidity || "",
      pressure: temp.pressure || "",
      visibility: temp.visibility || "",
      cloudiness: temp.cloudiness || "",
      wind_speed: temp.wind_speed || "",
      wind_direction: temp.wind_deg || "",
      wind_gust: temp.wind_gust || "",
      rain_1h: temp.rain_1h || "",
      snow_1h: temp.snow_1h || "",
      icon: temp.icon || "",
    })) || [
      {
        location: record.location,
        latitude: record.lat || "",
        longitude: record.lon || "",
        startDate: record.startDate,
        endDate: record.endDate,
        createdAt: record.createdAt,
      },
    ];
  };

  const handleExport = async (format: "json" | "csv" | "xml" | "md" | "pdf") => {
    try {
      setIsExporting(true);
      let content: string | Blob;
      let mimeType: string;
      let fileName: string = `weather-${record.location}-${record.id.substring(0, 8)}`;

      switch (format) {
        case "json":
          content = exportToJSON(record);
          mimeType = "application/json";
          fileName += ".json";
          break;

        case "csv":
          content = exportToCSV(flattenRecordForCSV(record));
          mimeType = "text/csv";
          fileName += ".csv";
          break;

        case "xml":
          content = exportToXML(record);
          mimeType = "application/xml";
          fileName += ".xml";
          break;

        case "md":
          content = exportToMarkdown(record);
          mimeType = "text/markdown";
          fileName += ".md";
          break;

        case "pdf":
          // Generate HTML content for PDF
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
              <h1>Weather Records Export</h1>
              <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Total Records:</strong> ${record.temperatures?.length || 0}</p>
              
              <h2>Record #1: ${record.location}</h2>
              <p><strong>Period:</strong> ${record.startDate} to ${record.endDate}</p>
              <p><strong>Created:</strong> ${record.createdAt}</p>
              <p><strong>Coordinates:</strong> ${record.lat ? `${record.lat}° N, ${record.lon}° E` : 'Not available'}</p>
              
              ${record.temperatures && record.temperatures.length > 0 ? `
                <h3>Weather Data</h3>
                <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%">
                  <thead>
                    <tr style="background-color: #f2f2f2;">
                      <th>Date & Time</th>
                      <th>Temperature</th>
                      <th>Feels Like</th>
                      <th>Weather</th>
                      <th>Humidity</th>
                      <th>Wind</th>
                      <th>Additional Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${record.temperatures
                      .map(
                        (temp) => `
                      <tr>
                        <td>${temp.date}</td>
                        <td>
                          ${temp.temp}°C
                          ${temp.temp_min && temp.temp_max ? 
                            `<br><small>Min: ${temp.temp_min}°C<br>Max: ${temp.temp_max}°C</small>` : ''}
                        </td>
                        <td>${temp.feels_like || "-"}°C</td>
                        <td>
                          ${temp.description ? `<strong>${temp.description}</strong>` : '-'}
                          ${temp.icon ? `<br><small>Icon: ${temp.icon}</small>` : ''}
                        </td>
                        <td>${temp.humidity || "-"}%</td>
                        <td>
                          ${temp.wind_speed ? `${temp.wind_speed} m/s` : '-'}
                          ${temp.wind_deg ? `<br><small>Direction: ${temp.wind_deg}°</small>` : ''}
                          ${temp.wind_gust ? `<br><small>Gusts: ${temp.wind_gust} m/s</small>` : ''}
                        </td>
                        <td>
                          ${temp.pressure ? `Pressure: ${temp.pressure} hPa<br>` : ''}
                          ${temp.visibility ? `Visibility: ${temp.visibility} m<br>` : ''}
                          ${temp.cloudiness !== undefined ? `Cloudiness: ${temp.cloudiness}%<br>` : ''}
                          ${temp.rain_1h ? `Rain (1h): ${temp.rain_1h} mm<br>` : ''}
                          ${temp.snow_1h ? `Snow (1h): ${temp.snow_1h} mm` : ''}
                        </td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              ` : ''}
            </div>
          `;
          
          content = await getPDFBlob(htmlContent);
          mimeType = "application/pdf";
          fileName += ".pdf";
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      if (content instanceof Blob) {
        const url = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        downloadFile(content, fileName, mimeType);
      }

      toast({
        title: "Export successful",
        description: `Weather data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      toast({
        title: "Export failed",
        description: `Failed to export as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="flex items-center gap-1"
        >
          <FileDown className="h-4 w-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Formats</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("json")}>
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xml")}>
          XML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("md")}>
          Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WeatherExportMenu;
