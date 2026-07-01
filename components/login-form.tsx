"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) throw error;
      setStep("OTP");
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message || "Invalid code provided");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Log In to VineMe</CardTitle>
          <CardDescription>
            {step === "PHONE" 
              ? "Enter your mobile number to receive a one-time passcode."
              : `Enter the 6-digit code sent to ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "PHONE" ? (
            <form onSubmit={handleSendCode}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7123 456789"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Include country code (e.g., +44 for UK)</p>
                </div>
                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Sending Code..." : "Send Secure Code"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="otp">Security Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="text-center tracking-widest text-lg"
                  />
                </div>
                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify & Log In"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep("PHONE")}
                  className="w-full text-sm"
                >
                  Use a different number
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm font-medium mb-3">Don't have a VineMe account?</p>
            <p className="text-xs text-muted-foreground mb-4">
              Download the official app to join the community and create your profile.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <a 
                href="https://apps.apple.com/gb/app/vineme/id6476884970" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                App Store (iOS)
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=com.pilotlight.vineme" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Google Play
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
