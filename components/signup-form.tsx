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
import {
  AuthHeader,
  AuthNotice,
  PasswordChecklist,
  PasswordInput,
  PasswordRule,
  authInputClass,
  authLinkClass,
  authSubmitClass,
} from "@/components/auth/fields";
import { SignupRequest } from "@/types/auth";
import { signup } from "@/services/auth";
import { ApiError } from "@/lib/api";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// The API's password rules (vergePay_api signUp), shown live as a checklist.
const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 12 characters", test: (v) => v.length >= 12 },
  { label: "Upper and lowercase letters", test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) },
  { label: "A number", test: (v) => /[0-9]/.test(v) },
  { label: "A special character", test: (v) => /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]';`~]/.test(v) },
];

const signupSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username cannot exceed 30 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username may only contain letters, numbers and underscores.",
      ),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
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

export function SignupForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<SignupRequest>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });
  const password = useWatch({ control, name: "password" });

  const onSubmit = async (values: SignupRequest) => {
    try {
      await signup(values);
      router.push("/signin?registered=1");
    } catch (err) {
      // CONFLICT names one field ("email already exists"); VALIDATION_ERROR
      // lists messages per field. Anything else goes in the banner.
      const fields = err instanceof ApiError ? err.fieldErrors() : {};
      const known = Object.entries(fields).filter(([field]) => field in values);
      for (const [field, message] of known) {
        setError(field as keyof SignupRequest, { type: "server", message });
      }
      if (known.length === 0) {
        setError("root", {
          type: "server",
          message: err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
        });
      }
    }
  };

  // The checklist already explains an unmet rule; only other password
  // errors (too long, or from the server) need a message of their own.
  const passwordRuleError = errors.password?.type === "custom";

  return (
    <div className={cn("w-full", className)} {...props}>
      <AuthHeader
        title="Create your account"
        subtitle="Manage your personal and business money in one place."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          {errors.root && <AuthNotice tone="error">{errors.root.message}</AuthNotice>}

          <Field data-invalid={Boolean(errors.username)}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="e.g. ada_designs"
              className={authInputClass}
              aria-invalid={Boolean(errors.username)}
              {...register("username")}
            />
            <FieldError errors={[errors.username]} />
          </Field>

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
              autoComplete="new-password"
              placeholder="Create a password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="password-rules"
              {...register("password")}
            />
            <PasswordChecklist rules={PASSWORD_RULES} value={password} showErrors={isSubmitted} />
            {!passwordRuleError && <FieldError errors={[errors.password]} />}
          </Field>

          <Field data-invalid={Boolean(errors.confirmPassword)}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
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
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className={authLinkClass}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
