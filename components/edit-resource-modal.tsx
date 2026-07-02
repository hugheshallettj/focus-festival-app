"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, AlertCircle } from "lucide-react";
import { editResource } from "@/app/actions/edit-resource";

interface EditResourceModalProps {
  resource: {
    id: string;
    capacity: number;
    description: string | null;
    return_time?: string;
  };
  resourceType: "TENT" | "CAR";
}

export function EditResourceModal({ resource, resourceType }: EditResourceModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.append("resource_id", resource.id);
    formData.append("resource_type", resourceType);
    
    const res = await editResource(formData);
    setLoading(false);
    
    if (res?.error) {
      setError(res.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Edit className="h-4 w-4" /> Edit Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription>
            Update the details of your {resourceType.toLowerCase()} listing.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        <form action={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="capacity">Total Capacity</Label>
            <Input 
              id="capacity" 
              name="capacity" 
              type="number" 
              min="1" 
              defaultValue={resource.capacity} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description & Rules</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={resource.description || ""} 
              placeholder="e.g. No eating in the car, or bringing extra camping gear..."
            />
          </div>
          {resourceType === 'CAR' && (
            <div className="space-y-2">
              <Label htmlFor="return_time">Return Time</Label>
              <Input 
                id="return_time" 
                name="return_time" 
                type="datetime-local" 
                defaultValue={resource.return_time ? new Date(resource.return_time).toISOString().slice(0, 16) : ""}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
