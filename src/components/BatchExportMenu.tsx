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
import JSZip from "jszip";

interface BatchExportMenuProps {
  records: WeatherHistoryRecord[];
  label?: string;
}

const BatchExportMenu: React.FC<BatchExportMenuProps> = ({
  records,
  label = "Export All",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Helper function to download file
  const downloadFile = (content: string | Blob, fileName: string, mimeType?: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Create HTML content for PDF
  const createPDFContent = (records: WeatherHistoryRecord[]): string => {
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1>Weather Records Export</h1>
        <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Records:</strong> ${records.length}</p>
    `;

    records.forEach((record, i) => {
      html += `
        <div style="margin-top: 30px; page-break-inside: avoid;">
          <h2>Record #${i + 1}: ${record.location}</h2>
          <p><strong>Period:</strong> ${formatDate(record.startDate)} to ${formatDate(record.endDate)}</p>
          <p><strong>Created:</strong> ${formatDate(record.createdAt)}</p>
      `;

      if (record.temperatures && record.temperatures.length > 0) {
        html += `
          <h3>Temperature Records</h3>
          <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
            <thead>
              <tr>
                <th>Date</th>
                <th>Temperature</th>
                <th>Feels Like</th>
                <th>Description</th>
                <th>Humidity</th>
                <th>Wind Speed</th>
              </tr>
            </thead>
            <tbody>
        `;

        record.temperatures.forEach(temp => {
          html += `
            <tr>
              <td>${formatDate(temp.date)}</td>
              <td>${temp.temp}°C</td>
              <td>${temp.feels_like || "-"}°C</td>
              <td>${temp.description || "-"}</td>
              <td>${temp.humidity || "-"}%</td>
              <td>${temp.wind_speed || "-"} m/s</td>
            </tr>
          `;
        });

        html += `
            </tbody>
          </table>
        `;
      }

      html += `</div>`;
    });

    html += `</div>`;
    return html;
  };

  // Helper function to flatten records for CSV export
  const flattenRecordsForCSV = (records: WeatherHistoryRecord[]) => {
    const flattened: any[] = [];
    
    records.forEach(record => {
      if (record.temperatures && record.temperatures.length > 0) {
        record.temperatures.forEach(temp => {
          flattened.push({
            id: record.id,
            location: record.location,
            date: temp.date,
            temp: temp.temp,
            feels_like: temp.feels_like || '',
            description: temp.description || '',
            humidity: temp.humidity || '',
            wind_speed: temp.wind_speed || '',
          });
        });
      } else {
        flattened.push({
          id: record.id,
          location: record.location,
          startDate: record.startDate,
          endDate: record.endDate,
          createdAt: record.createdAt,
        });
      }
    });
    
    return flattened;
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (error) {
      return dateStr;
    }
  };

  const handleExport = async (format: "json" | "csv" | "xml" | "md" | "pdf" | "zip") => {
    if (records.length === 0) {
      toast({
        title: "No records to export",
        description: "There are no weather records to export",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      let content: string | Blob;
      let mimeType: string;
      let fileName: string = `weather-records-${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case "json":
          content = exportToJSON(records);
          mimeType = "application/json";
          fileName += ".json";
          break;

        case "csv":
          content = exportToCSV(flattenRecordsForCSV(records));
          mimeType = "text/csv";
          fileName += ".csv";
          break;

        case "xml":
          content = exportToXML({ records });
          mimeType = "application/xml";
          fileName += ".xml";
          break;

        case "md":
          content = records.map(record => 
            exportToMarkdown(record)
          ).join("\n\n---\n\n");
          mimeType = "text/markdown";
          fileName += ".md";
          break;

        case "pdf":
          const htmlContent = createPDFContent(records);
          content = await getPDFBlob(htmlContent);
          mimeType = "application/pdf";
          fileName += ".pdf";
          break;
          
        case "zip":
          const zip = new JSZip();
          
          // Add individual JSON files
          records.forEach((record, i) => {
            zip.file(`record-${i+1}-${record.location}.json`, exportToJSON(record));
          });
          
          // Add CSV file with all records
          zip.file("all-records.csv", exportToCSV(flattenRecordsForCSV(records)));
          
          // Generate the ZIP file
          content = await zip.generateAsync({ type: "blob" });
          mimeType = "application/zip";
          fileName += ".zip";
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      downloadFile(content, fileName, mimeType);

      toast({
        title: "Export successful",
        description: `${records.length} weather records exported as ${format.toUpperCase()}`,
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
          variant="default"
          size="sm"
          disabled={isExporting || records.length === 0}
          className="flex items-center gap-1"
        >
          <FileDown className="h-4 w-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export All Records</DropdownMenuLabel>
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("zip")}>
          All Formats (ZIP)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BatchExportMenu;
