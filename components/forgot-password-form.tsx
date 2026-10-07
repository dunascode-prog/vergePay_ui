"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  AuthHeader,
  AuthNotice,
  PASSWORD_RULES,
  PasswordChecklist,
  PasswordInput,
  authInputClass,
  authLinkClass,
  authSubmitClass,
} from "@/components/auth/fields";
import { requestPasswordReset, resetPassword } from "@/services/auth";
import { ApiError } from "@/lib/api";
import Link from "next/link";
import { KeyRound, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Forgot password, in two steps on one page:
//   1. the email address: the API emails a 6-digit code (15 minutes) if it
//      has an account, and answers the same either way;
//   2. the code and a new password: 5 tries per code. A reset signs the
//      account out everywhere, so it ends on the sign-in page.

const RESEND_SECONDS = 60; // the API sends at most one code a minute

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

const resetSchema = z
  .object({
    code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from the email."),
    password: z
      .string()
      .max(128, "Password cannot exceed 128 characters.")
      .refine((v) => PASSWORD_RULES.every((rule) => rule.test(v)), "Your password doesn't meet all the requirements yet."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return "Too many attempts. Wait a few minutes and try again.";
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

export function ForgotPasswordForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [email, setEmail] = useState<string | null>(null);
  // when the last code was asked for, to count down to the next one
  const [sentAt, setSentAt] = useState(0);

  return (
    <div className={cn("w-full", className)} {...props}>
      {email === null ? (
        <EmailStep
          onSent={(address) => {
            setEmail(address);
            setSentAt(Date.now());
          }}
        />
      ) : (
        <ResetStep
          email={email}
          sentAt={sentAt}
          onResent={() => setSentAt(Date.now())}
          onChangeEmail={() => setEmail(null)}
        />
      )}
    </div>
  );
}

function EmailStep({ onSent }: { onSent: (email: string) => void }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({ resolver: zodResolver(emailSchema) });

  const onSubmit = async ({ email }: { email: string }) => {
    try {
      await requestPasswordReset(email);
      onSent(email);
    } catch (err) {
      const field = err instanceof ApiError ? err.fieldErrors().email : undefined;
      setError(field ? "email" : "root", { type: "server", message: field ?? messageFor(err) });
    }
  };

  return (
    <>
      <AuthHeader
        icon={<KeyRound className="h-5 w-5" />}
        title="Reset your password"
        subtitle="Enter the email you use for VergePay and we'll send you a 6-digit code."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          {errors.root && <AuthNotice tone="error">{errors.root.message}</AuthNotice>}

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@business.com"
              className={authInputClass}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Button type="submit" disabled={isSubmitting} className={authSubmitClass}>
            {isSubmitting ? "Sending…" : "Send code"}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/signin" className={authLinkClass}>
          Back to sign in
        </Link>
      </p>
    </>
  );
}

function useSecondsUntil(sentAt: number, wait: number) {
  // a clock that ticks each second; the countdown is worked out from it
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return Math.max(0, Math.ceil((sentAt + wait * 1000 - Math.max(now, sentAt)) / 1000));
}

function ResetStep({
  email,
  sentAt,
  onResent,
  onChangeEmail,
}: {
  email: string;
  sentAt: number;
  onResent: () => void;
  onChangeEmail: () => void;
}) {
  const router = useRouter();
  const resendIn = useSecondsUntil(sentAt, RESEND_SECONDS);
  const [notice, setNotice] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: "", password: "", confirmPassword: "" },
  });
  const password = useWatch({ control, name: "password" });
  const codeField = register("code");

  const onSubmit = async (values: ResetValues) => {
    setNotice(null);
    try {
      await resetPassword({ email, ...values });
      router.replace("/signin?reset=1");
    } catch (err) {
      const fields = err instanceof ApiError ? err.fieldErrors() : {};
      let shown = false;
      for (const field of ["code", "password", "confirmPassword"] as const) {
        if (fields[field]) {
          setError(field, { type: "server", message: fields[field] });
          shown = true;
        }
      }
      if (!shown) setError("root", { type: "server", message: messageFor(err) });
    }
  };

  const resend = async () => {
    setResending(true);
    clearErrors();
    setNotice(null);
    try {
      await requestPasswordReset(email);
      setValue("code", "");
      onResent();
      setNotice("We've sent a new code. Any earlier code no longer works.");
    } catch (err) {
      setError("root", { type: "server", message: messageFor(err) });
    } finally {
      setResending(false);
    }
  };

  // The checklist already explains an unmet rule; only other password
  // errors (from the server, or too long) are shown as text.
  const passwordRuleError = errors.password?.type === "custom";

  return (
    <>
      <AuthHeader
        icon={<MailCheck className="h-5 w-5" />}
        title="Check your email"
        subtitle={`If ${email} has a VergePay account, we've sent it a 6-digit code. It expires in 15 minutes.`}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          {notice && <AuthNotice tone="info">{notice}</AuthNotice>}
          {errors.root && <AuthNotice tone="error">{errors.root.message}</AuthNotice>}

          <Field data-invalid={Boolean(errors.code)}>
            <FieldLabel htmlFor="code">Code from the email</FieldLabel>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              placeholder="000000"
              className={cn(authInputClass, "text-center text-lg tracking-[0.5em] tabular-nums md:text-lg")}
              aria-invalid={Boolean(errors.code)}
              {...codeField}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
                codeField.onChange(e);
              }}
            />
            <FieldError errors={[errors.code]} />
          </Field>

          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Create a new password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="password-rules"
              {...register("password")}
            />
            <PasswordChecklist rules={PASSWORD_RULES} value={password} showErrors={isSubmitted} />
            {!passwordRuleError && <FieldError errors={[errors.password]} />}
          </Field>

          <Field data-invalid={Boolean(errors.confirmPassword)}>
            <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Enter the password again"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>

          <Button type="submit" disabled={isSubmitting} className={authSubmitClass}>
            {isSubmitting ? "Resetting…" : "Reset password"}
          </Button>
          <p className="text-xs text-muted-foreground">
            This signs you out on every device. You&apos;ll sign in again with the new password.
          </p>
        </FieldGroup>
      </form>

      <div className="mt-8 space-y-2 text-sm text-muted-foreground">
        <p>
          Didn&apos;t get it? Check your spam folder, or{" "}
          {resendIn > 0 ? (
            <span className="tabular-nums">send another in {resendIn}s</span>
          ) : (
            <button type="button" onClick={resend} disabled={resending} className={authLinkClass}>
              {resending ? "sending…" : "send another code"}
            </button>
          )}
          .
        </p>
        <p>
          Wrong address?{" "}
          <button type="button" onClick={onChangeEmail} className={authLinkClass}>
            Use a different email
          </button>
        </p>
      </div>
    </>
  );
}
