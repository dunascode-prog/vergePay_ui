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
import { ShieldCheck } from "lucide-react";
import {
  AuthHeader,
  AuthNotice,
  PasswordInput,
  authInputClass,
  authLinkClass,
  authSubmitClass,
} from "@/components/auth/fields";

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

export function LoginForm({
  className,
  next,
  initialStep,
  justRegistered = false,
  ...props
}: SigninFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
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
      <AuthHeader title="Sign in to VergePay" subtitle="Welcome back. Enter your details to continue." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          {notice && <AuthNotice tone="info">{notice}</AuthNotice>}
          {errors.root && <AuthNotice tone="error">{errors.root.message}</AuthNotice>}

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@business.com"
              className={authInputClass}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Button type="submit" disabled={isSubmitting} className={authSubmitClass}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        New to VergePay?{" "}
        <Link href="/signup" className={authLinkClass}>
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
      <AuthHeader
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Two-factor authentication"
        subtitle="Enter the 6-digit code from your authenticator app."
      />

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
              className={cn(authInputClass, "text-center text-lg tracking-[0.5em] tabular-nums md:text-lg")}
              value={code}
              aria-invalid={Boolean(error)}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>

          <Button type="submit" disabled={submitting} className={authSubmitClass}>
            {submitting ? "Verifying…" : "Verify and continue"}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Not you?{" "}
        <button
          type="button"
          onClick={switchAccount}
          className={authLinkClass}
        >
          Use a different account
        </button>
      </p>
    </>
  );
}
