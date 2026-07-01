import Link from "next/link";
import { ArrowRight, Tent, Car, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming standard shadcn/ui button exists

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            VineMe Community Exclusive
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary/80">
            Focus Festival Logistics
          </h1>
          
          <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Your trusted platform for coordinating tent spaces and car rides. Built exclusively for our church community to ensure everyone has a safe and secure way to experience the festival.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base font-semibold w-full sm:w-auto shadow-lg shadow-primary/20 transition-all hover:scale-105">
                Access Platform <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Requires your existing VineMe app credentials. Don't have them? Download VineMe first.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto text-left">
          <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Tent className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Find a Tent</h3>
            <p className="text-muted-foreground">
              Connect with generous hosts who have spare space in their large tents. Guaranteed safe and secure.
            </p>
          </div>
          
          <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Car className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Share a Ride</h3>
            <p className="text-muted-foreground">
              Don't struggle to get there. Find carpool options from members in your area and travel together.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">100% Secure</h3>
            <p className="text-muted-foreground">
              Powered by VineMe. Every host and applicant is a verified member of our community. Strict gender-matching rules apply.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
