"use client";
import { useState, useEffect } from "react";
import { createTent } from "@/app/actions/resources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tent } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewTentPage() {
  const [isSameSexOnly, setIsSameSexOnly] = useState(false);
  const [userGender, setUserGender] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGender() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('gender').eq('id', user.id).single();
        if (data) {
          setUserGender(data.gender);
        }
      }
    }
    fetchGender();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <Tent className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offer a Tent Space</h1>
          <p className="text-muted-foreground">List available spots in your tent for the festival.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tent Details</CardTitle>
          <CardDescription>Tell us about the space you're offering.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTent as any} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="capacity">Available Spaces</Label>
              <Input id="capacity" name="capacity" type="number" min="1" max="10" required placeholder="e.g. 2" />
              <p className="text-xs text-muted-foreground">How many people can you fit in your tent (excluding yourself)?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" name="description" placeholder="Any rules, preferences, or details about the tent?" />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-dashed">
              <div className="space-y-0.5">
                <Label htmlFor="same_sex_only" className="text-base">Same-Sex Only</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict this tent to {userGender || 'your gender'} only.
                </p>
              </div>
              <Switch
                id="same_sex_only"
                name="same_sex_only"
                checked={isSameSexOnly}
                onCheckedChange={setIsSameSexOnly}
              />
            </div>

            {isSameSexOnly && (
              <input type="hidden" name="gender_required" value={userGender || ''} />
            )}

            <Button type="submit" className="w-full h-12 text-lg">List Tent</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}