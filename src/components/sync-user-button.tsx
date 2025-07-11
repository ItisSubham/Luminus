"use client";

import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SyncUserButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Profile synced successfully! Name: ${data.firstName} ${data.lastName}`
        );
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error("Failed to sync profile");
      }
    } catch (error) {
      toast.error("Error syncing profile");
      console.error("Sync error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      size="sm"
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCwIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Syncing..." : "Sync Profile"}
    </Button>
  );
};

export default SyncUserButton;
