"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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
      <div className={cn("flex w-full flex-col gap-6", className)} {...props}>
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
    <div className={cn("flex w-full flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Apple
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              {notice && (
                <FieldDescription role="status" className="text-center">
                  {notice}
                </FieldDescription>
              )}
              {errors.root && <FieldError className="text-center">{errors.root.message}</FieldError>}
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field data-invalid={Boolean(errors.password)}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in…" : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Two-factor authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="code">Authentication code</FieldLabel>
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                placeholder="123456"
                className="text-center text-lg tracking-[0.5em] tabular-nums"
                value={code}
                aria-invalid={Boolean(error)}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Field>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Verifying…" : "Verify"}
              </Button>
              <Button type="button" variant="ghost" onClick={switchAccount}>
                Use a different account
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
