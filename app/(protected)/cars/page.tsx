import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UserProfileModal } from "@/components/user-profile-modal";
import { ResourceMembersModal } from "@/components/resource-members-modal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Car } from "lucide-react";

export default async function CarsListingPage() {
  const supabase = await createClient();
  
  const { data: rawCars, error } = await supabase
    .schema('focus_festival')
    .from('cars_with_driver')
    .select('*')
    .order('departure_time', { ascending: true });

  const cars = rawCars?.map((c: any) => ({
    ...c,
    driver: {
      id: c.driver_id,
      first_name: c.driver_first_name,
      last_name: c.driver_last_name,
      avatar_url: c.driver_avatar_url,
      bio: c.driver_bio,
      church_name: c.driver_church_name,
      service_name: c.driver_service_name
    }
  }));

  const carIds = cars?.map((c: any) => c.id) || [];
  let approvedApps: any[] = [];
  if (carIds.length > 0) {
    const { data } = await supabase.schema('focus_festival').from('applications_with_applicant')
      .select('*')
      .in('resource_id', carIds)
      .eq('status', 'APPROVED');
      
    if (data) {
      approvedApps = data.map(a => ({
        id: a.id,
        resource_id: a.resource_id,
        applicant: {
          id: a.applicant_id,
          first_name: a.applicant_first_name,
          last_name: a.applicant_last_name,
          gender: a.applicant_gender,
          avatar_url: a.applicant_avatar_url,
          bio: a.applicant_bio,
          church_name: a.applicant_church_name,
          service_name: a.applicant_service_name
        }
      }));
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Available Lifts</h1>
          <p className="text-muted-foreground mt-2">Find a ride to the festival with other members.</p>
        </div>
        <Link href="/cars/new">
          <Button variant="outline">Offer a Ride</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          Failed to load cars: {error.message}
        </div>
      )}

      {!cars || cars.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed">
          <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No rides available</h3>
          <p className="text-muted-foreground">Check back later or offer your own ride!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {cars?.map((car: any) => {
            const carMembers = approvedApps.filter(a => a.resource_id === car.id);
            return (
            <Card key={car.id} className="flex flex-col hover:border-primary/50 transition-colors shadow-sm">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex justify-between items-start">
                  <span className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Ride Details
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Driver:</span>
                  <UserProfileModal user={car.driver} role="driver" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold text-right">{car.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Departure:</span>
                  <span className="font-semibold">{new Date(car.departure_time).toLocaleString()}</span>
                </div>
                {car.return_time && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Return:</span>
                    <span className="font-semibold">{new Date(car.return_time).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spaces Left:</span>
                  <span className="font-bold">{car.remaining_spaces} / {car.capacity}</span>
                </div>
                {carMembers.length > 0 && (
                  <div className="pt-3 border-t mt-3 flex justify-between items-center">
                    <span className="text-sm font-medium">Passengers:</span>
                    <ResourceMembersModal applications={carMembers} resourceName="car" />
                  </div>
                )}
                {car.description && (
                  <div className="pt-3 border-t mt-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 italic">"{car.description}"</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/50">
                <Link href={`/cars/${car.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
