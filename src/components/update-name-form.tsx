"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const UpdateNameForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/update-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Name updated successfully! Welcome, ${data.firstName}!`);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const errorText = await response.text();
        toast.error(`Failed to update name: ${errorText}`);
      }
    } catch (error) {
      toast.error("Error updating name");
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-border/60 rounded-xl p-4 bg-muted/20">
      <div className="flex items-center gap-2 mb-3">
        <UserIcon className="w-4 h-4" />
        <h5 className="font-medium">Update Your Name</h5>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Your name wasn&apos;t set during signup. Please enter your name below.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="firstName" className="text-xs">
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-xs">
            Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter your last name (optional)"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isLoading}
            className="mt-1"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !firstName.trim()}
          size="sm"
          className="w-full"
        >
          {isLoading ? "Updating..." : "Update Name"}
        </Button>
      </form>
    </div>
  );
};

export default UpdateNameForm;
