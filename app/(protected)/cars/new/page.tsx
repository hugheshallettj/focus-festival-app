"use client";

import { createCar } from "@/app/actions/resources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";

export default function NewCarPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <Car className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offer a Lift</h1>
          <p className="text-muted-foreground">Help others get to Focus Festival.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journey Details</CardTitle>
          <CardDescription>Provide information about your journey to and from the festival.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCar} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location">Departure Location</Label>
              <Input id="location" name="location" required placeholder="e.g. London Kings Cross" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="departure_time">Departure Date & Time</Label>
                <Input id="departure_time" name="departure_time" type="datetime-local" required />
                <p className="text-xs text-muted-foreground">When are you leaving for the festival?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="return_time">Return Date & Time</Label>
                <Input id="return_time" name="return_time" type="datetime-local" required />
                <p className="text-xs text-muted-foreground">When are you heading back?</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Available Seats</Label>
              <Input id="capacity" name="capacity" type="number" min="1" max="8" required placeholder="e.g. 3" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" name="description" placeholder="Any details about the journey, luggage space, or car rules?" />
            </div>

            <Button type="submit" className="w-full h-12 text-lg">List Journey</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
