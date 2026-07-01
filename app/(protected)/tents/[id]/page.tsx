import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldAlert, Tent, User, Calendar } from "lucide-react";
import { UserProfileModal } from "@/components/user-profile-modal";
import { applyForResource } from "@/app/actions/applications";

export default async function TentDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/auth/login");

  // Fetch tent details
  const { data: rawTent, error: tentError } = await supabase
    .schema('focus_festival')
    .from('tents_with_host')
    .select('*')
    .eq('id', params.id)
    .single();

  const tent = rawTent ? {
    ...rawTent,
    host: {
      id: rawTent.host_id,
      first_name: rawTent.host_first_name,
      last_name: rawTent.host_last_name,
      gender: rawTent.host_gender
    }
  } : null;

  if (tentError || !tent) return notFound();

  // Fetch applicant's profile for Rule A checking
  const { data: profile } = await supabase
    .from('users')
    .select('gender')
    .eq('id', user.id)
    .single();

  const applicantGender = profile?.gender;
  
  // Check Rule A: Strict Gender-Matching Logic
  const isGenderMismatch = tent.same_sex_only && tent.gender_required && applicantGender !== tent.gender_required;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <Tent className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tent Details</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> Hosted by {tent.host?.first_name || 'Anonymous'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Space Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="font-medium text-muted-foreground">Host</span>
            <UserProfileModal user={tent.host} role="host" />
          </div>
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="font-medium">Remaining Spaces</span>
            <span className="text-lg font-bold text-primary">{tent.remaining_spaces} / {tent.capacity}</span>
          </div>
          {tent.description && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <span className="font-medium block mb-2 text-sm text-muted-foreground">Description & Rules</span>
              <p className="text-sm">{tent.description}</p>
            </div>
          )}
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="font-medium">Listed On</span>
            <span className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(tent.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {isGenderMismatch ? (
        <div className="bg-destructive/10 border-l-4 border-destructive p-6 rounded-r-lg flex items-start gap-4">
          <ShieldAlert className="h-6 w-6 text-destructive shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-destructive text-lg">Safety Restriction Applied</h3>
            <p className="text-destructive/80 mt-1 leading-relaxed">
              This host has restricted applications to {tent.gender_required} members only. Your profile indicates you are {applicantGender}, so you cannot apply for this space.
            </p>
          </div>
        </div>
      ) : tent.remaining_spaces === 0 ? (
        <div className="p-6 bg-muted text-center rounded-lg border border-dashed">
          <p className="font-semibold">This tent is currently full.</p>
        </div>
      ) : tent.host_id === user.id ? (
        <div className="p-6 bg-primary/10 text-primary text-center rounded-lg">
          <p className="font-semibold">You are the host of this tent.</p>
        </div>
      ) : (
        <form action={applyForResource}>
          <input type="hidden" name="resource_id" value={tent.id} />
          <input type="hidden" name="resource_type" value="TENT" />
          <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]">
            Apply for Space
          </Button>
        </form>
      )}
    </div>
  );
}
