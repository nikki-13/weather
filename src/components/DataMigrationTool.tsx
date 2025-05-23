import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { migrateDataToSQLite } from "@/services/migrationUtility";
import { useToast } from "@/components/ui/use-toast";
import { DatabaseIcon, AlertCircle, CheckCircle2 } from "lucide-react";

interface MigrationResult {
  success: boolean;
  message: string;
  details: {
    total: number;
    success: number;
    failures: number;
    errors: string[];
  };
}

const DataMigrationTool: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [showFullErrors, setShowFullErrors] = useState(false);
  const { toast } = useToast();

  const handleMigration = async () => {
    if (isMigrating) return;
    
    setIsMigrating(true);
    setResult(null);
    
    try {
      const migrationResult = await migrateDataToSQLite();
      setResult(migrationResult);
      
      toast({
        title: migrationResult.success ? "Migration successful" : "Migration failed",
        description: migrationResult.message,
        variant: migrationResult.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error during migration:", error);
      setResult({
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
        details: { total: 0, success: 0, failures: 0, errors: [String(error)] }
      });
      
      toast({
        title: "Migration failed",
        description: "An unexpected error occurred during migration",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DatabaseIcon className="h-5 w-5" />
          Data Migration Tool
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use this tool to migrate your existing weather history data from localStorage to the SQLite database.
          This ensures your data is safely stored and persisted.
        </p>
        
        {result && (
          <div className="space-y-4 my-4">
            <Alert variant={result.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {result.success ? "Migration completed" : "Migration failed"}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2">{result.message}</AlertDescription>
            </Alert>
            
            {result.details.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Progress:</span>
                  <span>
                    {result.details.success} of {result.details.total} records migrated
                  </span>
                </div>
                <Progress 
                  value={(result.details.success / result.details.total) * 100} 
                  className="h-2"
                />
              </div>
            )}
            
            {result.details.failures > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-destructive font-medium">
                    Failed: {result.details.failures} records
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowFullErrors(!showFullErrors)}
                  >
                    {showFullErrors ? "Hide details" : "Show details"}
                  </Button>
                </div>
                
                {showFullErrors && (
                  <div className="max-h-40 overflow-y-auto bg-muted p-2 rounded-md text-xs">
                    {result.details.errors.map((err, i) => (
                      <div key={i} className="py-1 border-b border-border last:border-0">
                        {err}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleMigration} 
          disabled={isMigrating}
        >
          {isMigrating ? "Migrating..." : "Migrate Data"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataMigrationTool;
