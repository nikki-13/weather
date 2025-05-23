import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { WeatherHistoryRecord } from "@/types/weather";
import { deleteWeatherRecord_db } from "@/services/weatherHistoryDb_sql";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/weatherUtils";
import WeatherHistoryEdit from "./WeatherHistoryEdit";
import WeatherExportMenu from "./WeatherExportMenu";
import BatchExportMenu from "./BatchExportMenu";
import { AlertCircle, Edit2, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WeatherHistoryListProps {
  records: WeatherHistoryRecord[];
  onRecordChange: () => void;
}

const WeatherHistoryList = ({ records, onRecordChange }: WeatherHistoryListProps) => {
  const [selectedRecord, setSelectedRecord] = useState<WeatherHistoryRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteWeatherRecord_db(id);
      if (success) {
        toast({
          title: "Record deleted",
          description: "Weather record has been deleted successfully",
        });
        onRecordChange();
      } else {
        toast({
          title: "Delete failed",
          description: "Failed to delete the weather record",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the record",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (record: WeatherHistoryRecord) => {
    setSelectedRecord(record);
    setEditDialogOpen(true);
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather History</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">No records found</p>
              <p className="text-muted-foreground">
                Create a new weather record to see it here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Weather History</CardTitle>
        {records.length > 0 && <BatchExportMenu records={records} />}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record, index) => (
            <div key={record.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="text-lg font-medium">{record.location}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(record.startDate)} - {formatDate(record.endDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {formatDate(record.createdAt)}
                  </p>
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <WeatherExportMenu record={record} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(record)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Weather Record</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this weather record? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(record.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {selectedRecord && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Weather Record</DialogTitle>
            </DialogHeader>
            <WeatherHistoryEdit 
              record={selectedRecord} 
              onSave={() => {
                setEditDialogOpen(false);
                onRecordChange();
              }}
            />
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default WeatherHistoryList;
