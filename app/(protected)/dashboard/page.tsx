import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Check, X, Clock, Tent, Car, PlusCircle, Search, MapPin } from "lucide-react";
import { processApplication } from "@/app/actions/host";
import { ResourceMembersModal } from "@/components/resource-members-modal";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/auth/login");

  // Fetch applications I received (for my tents)
  const { data: myTents } = await supabase
    .schema('focus_festival')
    .from('tents')
    .select('id, capacity, remaining_spaces')
    .eq('host_id', user.id);
  
  const myTentIds = myTents?.map(t => t.id) || [];

  // Fetch applications I received (for my cars)
  const { data: myCars } = await supabase
    .schema('focus_festival')
    .from('cars')
    .select('id, capacity, remaining_spaces')
    .eq('driver_id', user.id);

  const myCarIds = myCars?.map(c => c.id) || [];

  let pendingAppsForMe: any[] = [];
  
  if (myTentIds.length > 0 || myCarIds.length > 0) {
    const { data: rawApps } = await supabase
      .schema('focus_festival')
      .from('applications_with_applicant')
      .select('*')
      .in('resource_id', [...myTentIds, ...myCarIds])
      .eq('status', 'PENDING');
    
    if (rawApps) {
      pendingAppsForMe = rawApps.map((a: any) => ({
        ...a,
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

  // Fetch applications I made
  const { data: myApplications } = await supabase
    .schema('focus_festival')
    .from('applications')
    .select('*')
    .eq('applicant_id', user.id);

  let myAppliedTents: any[] = [];
  let myAppliedCars: any[] = [];
  let myAcceptedMembers: any[] = [];

  if (myApplications && myApplications.length > 0) {
    const tentIds = myApplications.filter(a => a.resource_type === 'TENT').map(a => a.resource_id);
    const carIds = myApplications.filter(a => a.resource_type === 'CAR').map(a => a.resource_id);
    
    if (tentIds.length > 0) {
      const { data } = await supabase.schema('focus_festival').from('tents_with_host').select('*').in('id', tentIds);
      myAppliedTents = data || [];
    }
    if (carIds.length > 0) {
      const { data } = await supabase.schema('focus_festival').from('cars_with_driver').select('*').in('id', carIds);
      myAppliedCars = data || [];
    }
    
    const acceptedResourceIds = myApplications.filter(a => a.status === 'APPROVED').map(a => a.resource_id);
    if (acceptedResourceIds.length > 0) {
      const { data } = await supabase.schema('focus_festival').from('applications_with_applicant')
        .select('*')
        .in('resource_id', acceptedResourceIds)
        .eq('status', 'APPROVED');
      
      myAcceptedMembers = data?.map(a => ({
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
      })) || [];
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your festival logistics.</p>
      </div>

      {/* Quick Actions Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">What do you need?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/tents">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group">
              <CardHeader className="pb-3 flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">I need a spot in a tent</CardTitle>
                  <CardDescription>Browse available tent spaces hosted by other members.</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/tents/new">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group">
              <CardHeader className="pb-3 flex flex-row items-center gap-4">
                <div className="bg-green-500/10 p-3 rounded-xl group-hover:bg-green-500/20 transition-colors">
                  <PlusCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">I have a spot in my tent</CardTitle>
                  <CardDescription>Offer a space in your tent to other festival-goers.</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/cars">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group">
              <CardHeader className="pb-3 flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">I need a space in a car</CardTitle>
                  <CardDescription>Find a lift to the festival with other members.</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/cars/new">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full group">
              <CardHeader className="pb-3 flex flex-row items-center gap-4">
                <div className="bg-green-500/10 p-3 rounded-xl group-hover:bg-green-500/20 transition-colors">
                  <PlusCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">I have a spot in my car</CardTitle>
                  <CardDescription>Offer a lift to the festival for other members.</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Host Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">Pending Requests for You</h2>
        {pendingAppsForMe.length === 0 ? (
          <div className="p-8 bg-card rounded-2xl border border-dashed text-center">
            <p className="text-muted-foreground">You don't have any pending requests to review.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingAppsForMe.map(app => (
              <Card key={app.id}>
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {app.resource_type === 'TENT' ? <Tent className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                      {app.applicant?.first_name || 'Anonymous'} wants a space
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-500 px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock className="h-3 w-3" /> PENDING
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex justify-end gap-3">
                  <form action={async (formData: FormData) => { "use server"; await processApplication(formData); }}>
                    <input type="hidden" name="application_id" value={app.id} />
                    <input type="hidden" name="action" value="REJECT" />
                    <input type="hidden" name="resource_type" value={app.resource_type} />
                    <Button variant="destructive" type="submit">
                      <X className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </form>
                  <form action={async (formData: FormData) => { "use server"; await processApplication(formData); }}>
                    <input type="hidden" name="application_id" value={app.id} />
                    <input type="hidden" name="action" value="APPROVE" />
                    <input type="hidden" name="resource_type" value={app.resource_type} />
                    <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" type="submit">
                      <Check className="h-4 w-4 mr-2" /> Approve
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Applicant Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">Your Applications</h2>
        {!myApplications || myApplications.length === 0 ? (
          <div className="p-8 bg-card rounded-2xl border border-dashed text-center">
            <p className="text-muted-foreground">You haven't applied for any tents or cars yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {myApplications.map(app => {
              const resource = app.resource_type === 'TENT' 
                ? myAppliedTents.find(t => t.id === app.resource_id)
                : myAppliedCars.find(c => c.id === app.resource_id);
              
              const resourceMembers = myAcceptedMembers.filter(m => m.resource_id === app.resource_id);

              return (
                <Card key={app.id} className="opacity-90 overflow-hidden">
                  <div className={`h-2 w-full ${
                      app.status === 'APPROVED' ? 'bg-green-500' :
                      app.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="flex items-center gap-2 font-bold text-lg mb-1">
                          {app.resource_type === 'TENT' ? <Tent className="h-5 w-5 text-primary" /> : <Car className="h-5 w-5 text-primary" />}
                          {app.resource_type === 'TENT' ? 'Tent Space' : 'Car Seat'}
                        </span>
                        {resource && app.resource_type === 'CAR' && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {resource.location}
                          </p>
                        )}
                        {resource && app.resource_type === 'TENT' && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            Hosted by {resource.host_first_name}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        app.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                        app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    
                    {app.status === 'APPROVED' && resourceMembers.length > 0 && (
                      <div className="mt-6 pt-4 border-t">
                        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Accepted Members</p>
                        <ResourceMembersModal applications={resourceMembers} resourceName={app.resource_type === 'TENT' ? 'tent' : 'car'} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
