"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { SigninRequest } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signin, signout, verifyTwoFactor } from "@/services/auth";
import { ApiError } from "@/lib/api";

const signinSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type Step = "credentials" | "code";

interface SigninFormProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Where to go once signed in (already checked to be a same-site path). */
  next: string;
  /** "code" when arriving with a password-only session (proxy.ts sends 2FA users here). */
  initialStep: Step;
  justRegistered?: boolean;
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Invalid email or password.";
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

// Shared look for the auth inputs and main button: taller than the app's
// default controls, as on most fintech sign-in screens.
const inputClass = "h-11 rounded-lg px-3 text-base md:text-sm";
const submitClass = "h-11 w-full rounded-lg bg-emerald-700 text-sm font-medium text-white hover:bg-emerald-800";

function Notice({ tone, children }: { tone: "info" | "error"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm",
        tone === "error"
          ? "border-destructive/20 bg-destructive/5 text-destructive"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
      )}
    >
      {children}
    </div>
  );
}

export function LoginForm({
  className,
  next,
  initialStep,
  justRegistered = false,
  ...props
}: SigninFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(
    justRegistered ? "Account created. Sign in to continue." : null,
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SigninRequest>({ resolver: zodResolver(signinSchema) });

  const onSubmit = async (values: SigninRequest) => {
    setNotice(null);
    try {
      const result = await signin(values);
      if (result.two_factor_required) {
        setStep("code");
        return;
      }
      router.replace(next);
    } catch (err) {
      const fields = err instanceof ApiError ? err.fieldErrors() : {};
      for (const [field, message] of Object.entries(fields)) {
        if (field === "email" || field === "password") {
          setError(field, { type: "server", message });
        }
      }
      if (Object.keys(fields).length === 0) {
        setError("root", { type: "server", message: messageFor(err) });
      }
    }
  };

  if (step === "code") {
    return (
      <div className={cn("w-full", className)} {...props}>
        <TwoFactorStep
          onVerified={() => router.replace(next)}
          onRestart={(message) => {
            setNotice(message);
            setStep("credentials");
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <header className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to VergePay</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Enter your details to continue.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          {notice && <Notice tone="info">{notice}</Notice>}
          {errors.root && <Notice tone="error">{errors.root.message}</Notice>}

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@business.com"
              className={inputClass}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className={cn(inputClass, "pr-11")}
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError errors={[errors.password]} />
          </Field>

          <Button type="submit" disabled={isSubmitting} className={cn(submitClass, "mt-1")}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        New to VergePay?{" "}
        <Link href="/signup" className="font-medium text-emerald-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

// The second step for accounts with 2FA on. The password step left a
// limited session; a valid code upgrades it to a full one.
function TwoFactorStep({
  onVerified,
  onRestart,
}: {
  onVerified: () => void;
  onRestart: (message: string | null) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await verifyTwoFactor(code);
      onVerified();
    } catch (err) {
      setSubmitting(false);
      setCode("");
      // The limited session is gone (expired, or signed out elsewhere).
      if (err instanceof ApiError && err.status === 401) {
        onRestart("Your sign-in timed out. Enter your password again.");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  const switchAccount = async () => {
    await signout().catch(() => {});
    onRestart(null);
  };

  return (
    <>
      <header className="mb-8 space-y-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Two-factor authentication</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
        </p>
      </header>

      <form onSubmit={submit} noValidate>
        <FieldGroup className="gap-5">
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="code">Authentication code</FieldLabel>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              placeholder="000000"
              className={cn(inputClass, "text-center text-lg tracking-[0.5em] tabular-nums md:text-lg")}
              value={code}
              aria-invalid={Boolean(error)}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>

          <Button type="submit" disabled={submitting} className={cn(submitClass, "mt-1")}>
            {submitting ? "Verifying…" : "Verify and continue"}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Not you?{" "}
        <button
          type="button"
          onClick={switchAccount}
          className="font-medium text-emerald-700 hover:underline"
        >
          Use a different account
        </button>
      </p>
    </>
  );
}
