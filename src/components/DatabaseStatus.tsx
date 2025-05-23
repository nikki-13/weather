import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw } from "lucide-react";
import { setupDatabase, getDatabaseStats } from "@/services/databaseService";
import { useToast } from "@/components/ui/use-toast";

interface DatabaseRecord {
  table: string;
  count: number;
}

const DatabaseStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [tableStats, setTableStats] = useState<DatabaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const refreshDatabaseStatus = async () => {
    setIsLoading(true);
    try {
      // Initialize the database
      const success = await setupDatabase();
      setIsConnected(success);

      // Get database stats
      const stats = await getDatabaseStats();
      setTableStats(stats);

      if (success) {
        toast({
          title: "Database connected",
          description: "Successfully connected to the SQLite database",
        });
      } else {
        toast({
          title: "Database connection failed",
          description: "Could not connect to the SQLite database. Using fallback storage.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error refreshing database status:", error);
      setIsConnected(false);
      toast({
        title: "Database error",
        description: "An error occurred while checking database status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check database status on component mount
  useEffect(() => {
    refreshDatabaseStatus();
  }, []);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
          <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
            {isConnected === null
              ? "Checking..."
              : isConnected
              ? "Connected"
              : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Storage: <span className="font-medium">SQLite</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Data is persisted in a local SQLite database file.
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={refreshDatabaseStatus}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {tableStats.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Database Tables:</h4>
              <div className="grid grid-cols-3 gap-2">
                {tableStats.map((stat) => (
                  <div
                    key={stat.table}
                    className="p-2 bg-muted rounded-md text-center"
                  >
                    <div className="text-xs text-muted-foreground">{stat.table}</div>
                    <div className="font-medium">{stat.count} records</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseStatus;
