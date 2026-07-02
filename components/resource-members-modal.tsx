"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCircle2, Users } from "lucide-react";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  avatar_url?: string;
  bio?: string;
  church_name?: string;
  service_name?: string;
}

interface Application {
  id: string;
  applicant: UserProfile;
}

export function ResourceMembersModal({ applications, resourceName }: { applications: Application[], resourceName: string }) {
  if (!applications || applications.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <div className="flex -space-x-2 mr-2">
            {applications.slice(0, 3).map((app, i) => (
              <div key={app.id} className="h-7 w-7 rounded-full bg-primary/20 border-2 border-background overflow-hidden flex items-center justify-center relative z-[3-i]">
                {app.applicant.avatar_url ? (
                  <img src={app.applicant.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle2 className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
            {applications.length > 3 && (
              <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center relative z-0 text-[10px] font-bold">
                +{applications.length - 3}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-primary flex items-center gap-1">
            <Users className="h-4 w-4" /> {applications.length} {applications.length === 1 ? 'member' : 'members'}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Members</DialogTitle>
          <DialogDescription>
            People accepted into this {resourceName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {applications.map((app) => (
            <div key={app.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 border">
              <div className="h-12 w-12 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                {app.applicant.avatar_url ? (
                  <img src={app.applicant.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle2 className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{app.applicant.first_name} {app.applicant.last_name}</p>
                <p className="text-xs text-muted-foreground capitalize mb-1">{app.applicant.gender}</p>
                {app.applicant.church_name && (
                  <p className="text-xs text-primary font-medium truncate">{app.applicant.church_name}</p>
                )}
                {app.applicant.bio && (
                  <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">"{app.applicant.bio}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
