"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCircle2 } from "lucide-react";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  avatar_url?: string;
}

export function UserProfileModal({ user, role }: { user: UserProfile, role: string }) {
  if (!user) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity text-primary font-medium">
          <div className="h-6 w-6 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={`${user.first_name}'s avatar`} className="h-full w-full object-cover" />
            ) : (
              <UserCircle2 className="h-4 w-4" />
            )}
          </div>
          <span>{user.first_name} {user.last_name}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Information</DialogTitle>
          <DialogDescription>
            Learn more about the {role} for this listing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="h-24 w-24 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary border-4 border-background shadow-sm">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={`${user.first_name}'s avatar`} className="h-full w-full object-cover" />
            ) : (
              <UserCircle2 className="h-16 w-16" />
            )}
          </div>
          <div className="text-center space-y-1">
            <h3 className="font-bold text-xl">{user.first_name} {user.last_name}</h3>
            <p className="text-muted-foreground capitalize">{user.gender}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
