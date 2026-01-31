"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { ClickLogo, ClickLogoIcon } from "@/components/foundations/logo/click-logo";
import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        remember: z.boolean(),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <section className="grid min-h-screen grid-cols-1 bg-primary lg:grid-cols-2">
      <div className="flex flex-col bg-primary">
        <div className="flex flex-1 justify-center px-4 py-12 md:items-center md:px-8 md:py-32">
          <div className="flex w-full flex-col gap-8 sm:max-w-[360px]">
            <div className="flex flex-col gap-6 md:gap-20">
              <ClickLogo className="max-md:hidden" />
              <ClickLogoIcon className="size-10 md:hidden" />
              <div className="flex flex-col gap-2 md:gap-3">
                <h1 className="text-display-xs font-semibold text-primary md:text-display-md">
                  Log in
                </h1>
                <p className="text-md text-tertiary">
                  Welcome back! Please enter your details.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-5">
                <form.Field name="email">
                  {(field) => (
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter your email"
                      size="md"
                      isRequired
                      hideRequiredIndicator
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      isInvalid={field.state.meta.errors.length > 0}
                      hint={
                        field.state.meta.errors.length > 0
                          ? String(field.state.meta.errors[0])
                          : undefined
                      }
                    />
                  )}
                </form.Field>

                <form.Field name="password">
                  {(field) => (
                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      size="md"
                      isRequired
                      hideRequiredIndicator
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      isInvalid={field.state.meta.errors.length > 0}
                      hint={
                        field.state.meta.errors.length > 0
                          ? String(field.state.meta.errors[0])
                          : undefined
                      }
                    />
                  )}
                </form.Field>
              </div>

              <div className="flex items-center">
                <form.Field name="remember">
                  {(field) => (
                    <Checkbox
                      label="Remember for 30 days"
                      name="remember"
                      isSelected={field.state.value}
                      onChange={(isSelected: boolean) =>
                        field.handleChange(isSelected)
                      }
                    />
                  )}
                </form.Field>

                <Button color="link-color" size="md" className="ml-auto">
                  Forgot password
                </Button>
              </div>

              <form.Subscribe>
                {(state) => (
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="w-full"
                    isDisabled={!state.canSubmit}
                    isLoading={state.isSubmitting}
                  >
                    Sign in
                  </Button>
                )}
              </form.Subscribe>
            </form>

            <div className="flex justify-center gap-1 text-center">
              <span className="text-sm text-tertiary">
                Don&apos;t have an account?
              </span>
              <Button color="link-color" size="md" onClick={onSwitchToSignUp}>
                Sign up
              </Button>
            </div>
          </div>
        </div>

        <footer className="hidden p-8 pt-11 lg:block">
          <p className="text-sm text-tertiary">© Click Cannabis 2025</p>
        </footer>
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.1),transparent_50%)]" />
      </div>
    </section>
  );
}
