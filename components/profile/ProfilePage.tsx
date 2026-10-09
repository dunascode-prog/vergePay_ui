"use client";

import { useState } from "react";
import { BadgeCheck, CalendarDays, Clock, Mail, ShieldCheck, ShieldOff } from "lucide-react";
import { useAppData } from "@/components/app-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDay } from "@/lib/invoicing";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/auth";
import { EmailChangeDialog } from "./EmailChangeDialog";
import { PersonalDetailsForm } from "./PersonalDetailsForm";
import { ProfilePhoto } from "./ProfilePhotoDialog";
import { TwoFactorDialog } from "./TwoFactorDialog";
import { pageClass } from "@/lib/layout";

export function displayName(user: UserProfile) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
}

function initials(user: UserProfile) {
  const parts = displayName(user).split(/[\s_]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

const KYC: Record<UserProfile["kyc_status"], { label: string; tone: string; note: string }> = {
  verified: {
    label: "Identity verified",
    tone: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    note: "Your name and date of birth match your BVN.",
  },
  pending: {
    label: "Verification in review",
    tone: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    note: "We're checking your details. This usually takes a few minutes.",
  },
  unverified: {
    label: "Not verified yet",
    tone: "bg-muted text-muted-foreground",
    note: "You'll verify your identity the first time you move money.",
  },
  rejected: {
    label: "Verification failed",
    tone: "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200",
    note: "Your details didn't match. Check them and try again when you next move money.",
  },
};

/** /dashboard/profile: personal details, the email address and two-factor sign-in. */
export function ProfilePage() {
  const { user } = useAppData();
  const [emailDialog, setEmailDialog] = useState<"new" | "resume" | null>(null);
  if (!user) return <ProfileSkeleton />;
  const kyc = KYC[user.kyc_status] ?? KYC.unverified;

  return (
    <div className={cn(pageClass("wide", { stack: false }), "grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-start")}>
      {/* who you are, at a glance */}
      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3 lg:flex-col lg:items-start">
            <ProfilePhoto photoUrl={user.photo_url} initials={initials(user)} />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{displayName(user)}</p>
              <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <Fact icon={Mail} label="Email" value={user.email} />
            <Fact icon={CalendarDays} label="Member since" value={formatDay(user.created_at)} />
          </dl>

          <div className="space-y-2">
            <p className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", kyc.tone)}>
              <BadgeCheck className="size-3.5" aria-hidden /> {kyc.label}
            </p>
            <p className="text-xs text-muted-foreground">{kyc.note}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-5 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Used on your invoices, receipts and identity check.</CardDescription>
          </CardHeader>
          <CardContent>
            <PersonalDetailsForm key={user.updated_at} user={user} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email address</CardTitle>
            <CardDescription>Where you sign in, and where receipts and codes go.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Mail className="size-4" aria-hidden />
                </span>
                <p className="truncate text-sm font-medium">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEmailDialog("new")}>
                Change email
              </Button>
            </div>

            {user.pending_email && (
              <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                <p className="flex min-w-0 items-center gap-2">
                  <Clock className="size-4 shrink-0" aria-hidden />
                  <span className="min-w-0">
                    Waiting for the code we sent to <span className="font-medium break-all">{user.pending_email}</span>
                  </span>
                </p>
                <Button size="sm" className="bg-emerald-700 text-white hover:bg-emerald-800" onClick={() => setEmailDialog("resume")}>
                  Enter code
                </Button>
              </div>
            )}
            <EmailChangeDialog
              open={emailDialog !== null}
              resume={emailDialog === "resume"}
              onOpenChange={(o) => !o && setEmailDialog(null)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sign-in security</CardTitle>
            <CardDescription>Protect your account and your money.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 sm:flex-nowrap">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    user.two_factor_enabled
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {user.two_factor_enabled ? <ShieldCheck className="size-4" aria-hidden /> : <ShieldOff className="size-4" aria-hidden />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Two-factor authentication{" "}
                    <span className={cn("ml-1 rounded-full px-2 py-0.5 text-xs font-medium", user.two_factor_enabled ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "bg-muted text-muted-foreground")}>
                      {user.two_factor_enabled ? "On" : "Off"}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {user.two_factor_enabled
                      ? "Signing in, adding cards and other sensitive changes ask for a code from your authenticator app."
                      : "Add a code from an authenticator app to signing in. Some actions, like adding a card, need it."}
                  </p>
                </div>
              </div>
              <TwoFactorDialog
                mode={user.two_factor_enabled ? "off" : "on"}
                trigger={
                  user.two_factor_enabled ? (
                    <Button variant="outline" size="sm">Turn off</Button>
                  ) : (
                    <Button size="sm" className="bg-emerald-700 text-white hover:bg-emerald-800">Turn on</Button>
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate font-medium">{value}</dd>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className={cn(pageClass("wide", { stack: false }), "grid gap-5 sm:gap-6 lg:grid-cols-[300px_1fr]")} aria-busy="true">
      <Skeleton className="h-64 rounded-xl" />
      <div className="flex flex-col gap-5 sm:gap-6">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
    </div>
  );
}
