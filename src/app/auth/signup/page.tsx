"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { Icons } from "@/components";

const SignUpPage = () => {
  const router = useRouter();

  const { isLoaded, signUp, setActive } = useSignUp();

  // Debug Clerk configuration
  console.log("CLERK: isLoaded:", isLoaded);
  console.log("CLERK: signUp object:", !!signUp);
  console.log(
    "CLERK: Publishable key exists:",
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );
  console.log(
    "CLERK: Publishable key value:",
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  // Additional Clerk debugging
  React.useEffect(() => {
    console.log("CLERK: Component mounted");
    console.log("CLERK: isLoaded changed to:", isLoaded);
    console.log("CLERK: signUp object changed to:", signUp);
    if (signUp) {
      console.log("CLERK: signUp object keys:", Object.keys(signUp));
      console.log(
        "CLERK: signUp.create function exists:",
        typeof signUp.create === "function"
      );
    }
  }, [isLoaded, signUp]);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("SIGNUP: Form submitted");
    console.log("SIGNUP: isLoaded:", isLoaded);
    console.log("SIGNUP: signUp exists:", !!signUp);

    if (!isLoaded) {
      console.log("SIGNUP: Clerk not loaded yet");
      toast.error("Loading... Please wait a moment and try again.");
      return;
    }

    if (!signUp) {
      console.log("SIGNUP: signUp object is null/undefined");
      toast.error(
        "Authentication service not available. Please refresh the page."
      );
      return;
    }

    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      console.log("SIGNUP: Starting signup process");
      console.log("SIGNUP: Name:", name);
      console.log("SIGNUP: Email:", email);
      console.log("SIGNUP: Password length:", password.length);
      console.log("SIGNUP: signUp object:", signUp);
      console.log("SIGNUP: isLoaded:", isLoaded);

      // Only pass email and password to signUp.create
      console.log("SIGNUP: Creating signup with email and password only");
      const signUpResult = await signUp.create({
        emailAddress: email,
        password,
      });
      console.log("SIGNUP: Create result:", signUpResult);

      // Clerk no longer allows setting firstName or lastName at signup. Skipping name update.

      console.log(
        "SIGNUP: User created successfully, preparing email verification"
      );

      const prepareResult = await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      console.log("SIGNUP: Prepare email verification result:", prepareResult);

      console.log(
        "SIGNUP: Email verification prepared, setting verified state"
      );
      setIsVerified(true);
    } catch (error: any) {
      console.log("SIGNUP ERROR:", JSON.stringify(error, null, 2));
      console.error("SIGNUP: Full error object:", error);
      console.log("SIGNUP: Error message:", error.message);
      console.log("SIGNUP: Error status:", error.status);
      console.log("SIGNUP: Error code:", error.code);
      console.log("SIGNUP: Error errors array:", error.errors);

      // More detailed error logging
      if (error.errors && error.errors.length > 0) {
        error.errors.forEach((err: any, index: number) => {
          console.log(`SIGNUP: Error ${index}:`, {
            code: err.code,
            message: err.message,
            longMessage: err.longMessage,
            meta: err.meta,
          });
        });
      }

      // Check if error.errors exists and has elements
      if (error.errors && error.errors.length > 0) {
        console.log("SIGNUP: First error code:", error.errors[0].code);
        console.log("SIGNUP: First error message:", error.errors[0].message);

        switch (error.errors[0]?.code) {
          case "form_identifier_exists":
            toast.error("This email is already registered. Please sign in.");
            break;
          case "form_password_pwned":
            toast.error(
              "The password is too common. Please choose a stronger password."
            );
            break;
          case "form_param_format_invalid":
            toast.error(
              "Invalid email address. Please enter a valid email address."
            );
            break;
          case "form_password_length_too_short":
            toast.error(
              "Password is too short. Please choose a longer password."
            );
            break;
          case "form_password_validation":
            toast.error(
              "Password doesn't meet requirements. Please choose a stronger password."
            );
            break;
          case "form_param_nil":
            toast.error("Please fill in all required fields.");
            break;
          default:
            console.log("SIGNUP: Unknown error code:", error.errors[0].code);
            const errorMessage =
              error.errors[0].message ||
              error.errors[0].longMessage ||
              "An error occurred. Please try again";
            toast.error(`Signup failed: ${errorMessage}`);
            break;
        }
      } else if (error.message) {
        console.log("SIGNUP: Using error.message");
        toast.error(`Signup failed: ${error.message}`);
      } else {
        console.log("SIGNUP: No specific error message found");
        toast.error(
          "Signup failed: An unknown error occurred. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    if (!code) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsVerifying(true);

    try {
      console.log("VERIFICATION: Starting email verification");
      console.log("VERIFICATION: Code:", code);

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log("VERIFICATION: Complete signup response:", completeSignUp);

      if (completeSignUp.status === "complete") {
        console.log("VERIFICATION: Setting active session");
        await setActive({ session: completeSignUp.createdSessionId });
        console.log("VERIFICATION: Redirecting to auth callback");
        router.push("/auth/auth-callback");
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error: any) {
      console.error("VERIFICATION ERROR:", JSON.stringify(error, null, 2));
      console.log("VERIFICATION: Error message:", error.message);
      console.log("VERIFICATION: Error status:", error.status);
      console.log("VERIFICATION: Error code:", error.code);
      console.log("VERIFICATION: Error errors array:", error.errors);

      if (error.errors && error.errors.length > 0) {
        console.log("VERIFICATION: First error code:", error.errors[0].code);
        console.log(
          "VERIFICATION: First error message:",
          error.errors[0].message
        );
        toast.error(
          `Verification failed: ${
            error.errors[0].message || "Please try again"
          }`
        );
      } else {
        toast.error(
          `An error occurred: ${error.message || "Please try again"}`
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return isVerified ? (
    <div className="flex flex-col items-center justify-center h-screen gap-y-6">
      <div className="flex flex-col text-center gap-1">
        <Link href="/">
          <Icons.logo className="w-12 h-12 mx-auto" />
        </Link>
        <h1 className="text-2xl font-bold font-heading mt-2">
          Please check your email
        </h1>
        <p className="text-muted-foreground">
          We&apos;ve sent a verification code to {email}
        </p>
      </div>

      <form onSubmit={handleVerify} className="w-full max-w-xs">
        <div className="space-y-2 flex flex-col items-center justify-center">
          <Label htmlFor="name">Verfication Code</Label>
          <InputOTP
            maxLength={6}
            value={code}
            disabled={isVerifying}
            onChange={(e) => setCode(e)}
            className="pt-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="mt-6">
          <Button
            size="default"
            type="submit"
            disabled={isVerifying}
            className="w-full"
          >
            {isVerifying ? (
              <LoaderIcon className="w-4 h-4 animate-spin" />
            ) : (
              "Verify Code"
            )}
          </Button>
        </div>
      </form>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen gap-y-6">
      <div className="flex flex-col text-center gap-1">
        <Link href="/">
          <Icons.logo className="w-12 h-12 mx-auto" />
        </Link>
        <h1 className="text-2xl font-bold font-heading mt-2">Sign Up</h1>
        <p className="text-muted-foreground">
          Create an account to start using Luminus
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <div className="space-y-1">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            disabled={isLoading}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mt-4 space-y-1">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            disabled={isLoading}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mt-4 space-y-1">
          <Label htmlFor="password">Password</Label>
          <div className="relative w-full">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={isLoading}
              className="absolute top-1 right-1 hover:translate-y-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <Button
            type="submit"
            size="default"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <LoaderIcon className="w-4 h-4 animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>

      <div className="flex mt-2">
        <p className="text-sm text-muted-foreground text-center w-full">
          Been here before?{" "}
          <Link href="/auth/signin" className="text-foreground font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
