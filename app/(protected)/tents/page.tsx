import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UserProfileModal } from "@/components/user-profile-modal";
import { ResourceMembersModal } from "@/components/resource-members-modal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tent, Users, ShieldAlert } from "lucide-react";

export default async function TentsListingPage() {
  const supabase = await createClient();
  
  // Need to fetch from focus_festival.tents
  // Note: we might need to cast the supabase client or use raw SQL if types are not generated,
  // but standard postgrest can access different schemas by setting the schema.
  // We can use `.schema('focus_festival')` if supported, or rely on views.
  
  // Since we haven't generated types, we will just use the schema method.
  const { data: rawTents, error } = await supabase
    .schema('focus_festival')
    .from('tents_with_host')
    .select('*')
    .gt('remaining_spaces', 0)
    .order('created_at', { ascending: false });

  const tents = rawTents?.map((t: any) => ({
    ...t,
    host: {
      id: t.host_id,
      first_name: t.host_first_name,
      last_name: t.host_last_name,
      avatar_url: t.host_avatar_url,
      bio: t.host_bio,
      church_name: t.host_church_name,
      service_name: t.host_service_name
    }
  }));

  const tentIds = tents?.map((t: any) => t.id) || [];
  let approvedApps: any[] = [];
  if (tentIds.length > 0) {
    const { data } = await supabase.schema('focus_festival').from('applications_with_applicant')
      .select('*')
      .in('resource_id', tentIds)
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
          <h1 className="text-4xl font-extrabold tracking-tight">Available Tents</h1>
          <p className="text-muted-foreground mt-2">Find a safe place to sleep during the festival.</p>
        </div>
        <Link href="/tents/new">
          <Button variant="outline">List a Tent</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          Failed to load tents: {error.message}
        </div>
      )}

      {!tents || tents.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed">
          <Tent className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No tents available</h3>
          <p className="text-muted-foreground">Check back later or list your own tent!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {tents?.map((tent: any) => {
            const tentMembers = approvedApps.filter(a => a.resource_id === tent.id);
            return (
            <Card key={tent.id} className="flex flex-col hover:border-primary/50 transition-colors shadow-sm">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex justify-between items-start">
                  <span className="flex items-center gap-2">
                    <Tent className="h-5 w-5 text-primary" />
                    Host: {tent.host?.first_name || 'Anonymous'}
                  </span>
                  {tent.same_sex_only && (
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      {tent.gender_required} Only
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Host:</span>
                  <UserProfileModal user={tent.host} role="host" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spaces Left:</span>
                  <span className="font-bold">{tent.remaining_spaces} / {tent.capacity}</span>
                </div>
                {tentMembers.length > 0 && (
                  <div className="pt-3 border-t mt-3 flex justify-between items-center">
                    <span className="text-sm font-medium">Campmates:</span>
                    <ResourceMembersModal applications={tentMembers} resourceName="tent" />
                  </div>
                )}
                {tent.description && (
                  <div className="pt-3 border-t mt-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 italic">"{tent.description}"</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/50">
                <Link href={`/tents/${tent.id}`} className="w-full">
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
