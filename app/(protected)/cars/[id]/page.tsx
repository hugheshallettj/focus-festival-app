import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Car, Clock, MapPin, User } from "lucide-react";
import { UserProfileModal } from "@/components/user-profile-modal";
import { applyForResource } from "@/app/actions/applications";

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/auth/login");

  // Fetch car details
  const { data: rawCar, error: carError } = await supabase
    .schema('focus_festival')
    .from('cars_with_driver')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  const car = rawCar ? {
    ...rawCar,
    driver: {
      id: rawCar.driver_id,
      first_name: rawCar.driver_first_name,
      last_name: rawCar.driver_last_name,
      gender: rawCar.driver_gender
    }
  } : null;

  if (carError || !car) return notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <Car className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lift Details</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> Driven by {car.driver?.first_name || 'Anonymous'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journey Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/> Departure Location</span>
            <span className="text-lg font-medium">{car.location}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="font-medium flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground"/> Departure Time</span>
            <span className="text-lg">{new Date(car.departure_time).toLocaleString()}</span>
          </div>
          {car.return_time && (
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground"/> Return Time</span>
              <span className="text-lg">{new Date(car.return_time).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/> Location</span>
            <span className="text-lg text-right">{car.location}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="font-medium text-muted-foreground">Driver</span>
            <UserProfileModal user={car.driver} role="driver" />
          </div>
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="font-medium">Remaining Spaces</span>
            <span className="text-lg font-bold text-primary">{car.remaining_spaces} / {car.capacity}</span>
          </div>
          {car.description && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <span className="font-medium block mb-2 text-sm text-muted-foreground">Journey Description</span>
              <p className="text-sm">{car.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {car.remaining_spaces === 0 ? (
        <div className="p-6 bg-muted text-center rounded-lg border border-dashed">
          <p className="font-semibold">This car is currently full.</p>
        </div>
      ) : car.driver_id === user.id ? (
        <div className="p-6 bg-primary/10 text-primary text-center rounded-lg">
          <p className="font-semibold">You are the driver of this car.</p>
        </div>
      ) : (
        <form action={async (formData: FormData) => { "use server"; await applyForResource(formData); }}>
          <input type="hidden" name="resource_id" value={car.id} />
          <input type="hidden" name="resource_type" value="CAR" />
          <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]">
            Apply for Seat
          </Button>
        </form>
      )}
    </div>
  );
}
