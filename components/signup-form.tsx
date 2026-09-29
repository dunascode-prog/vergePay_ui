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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SignupRequest } from "@/types/auth";
import { signup } from "@/services/auth";
import { ApiError } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
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

    email: z.string().trim().toLowerCase().email("Invalid email address."),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .max(128)
      .regex(/[A-Z]/, "Password must contain an uppercase letter.")
      .regex(/[a-z]/, "Password must contain a lowercase letter.")
      .regex(/[0-9]/, "Password must contain a number.")
      .regex(
        /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]';`~]/,
        "Password must contain a special character.",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface SignupFormProps extends React.HTMLAttributes<HTMLDivElement> {
  loading: boolean;
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
}
export function SignupForm({
  className,
  loading,
  setLoader,
  ...props
}: SignupFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupRequest>({
    resolver: zodResolver(signupSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordc, setShowPasswordc] = useState(false);

  const onSubmit = async (values: SignupRequest) => {
    setLoader(true);
    try {
      await signup(values);
      router.push("/signin?registered=1");
    } catch (err) {
      // CONFLICT names one field ("email already exists"); VALIDATION_ERROR
      // lists messages per field. Anything else goes above the button.
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
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Choose a username"
                  {...register("username")}
                />
                {errors.username && (
                  <FieldDescription>{errors.username.message}</FieldDescription>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <FieldDescription>{errors.email.message}</FieldDescription>
                )}
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={`${showPassword ? "text" : "password"}`}
                        className="pr-10"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <FieldDescription>
                        {errors.password.message}
                      </FieldDescription>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={`${showPasswordc ? "text" : "password"}`}
                        className="pr-10"
                        {...register("confirmPassword", {
                          required: "confirm password is required",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordc((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPasswordc ? (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <FieldDescription>
                        {errors.confirmPassword.message}
                      </FieldDescription>
                    )}
                  </Field>
                </Field>
              </Field>
              <Field>
                {errors.root && (
                  <FieldDescription role="alert" className="text-center text-destructive">
                    {errors.root.message}
                  </FieldDescription>
                )}
                <Button type="submit" disabled={loading}>Create Account</Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/signin">Sign in</Link>
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
