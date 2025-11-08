"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { authService } from "@/src/services/auth.service";
import { Input } from "@/src/components/common/Input";
import { Button } from "@/src/components/common/Button";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
  });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
      } else if (result?.ok) {
        // Also call Django login endpoint to set session cookie in browser
        try {
          await authService.login({
            username: formData.username,
            password: formData.password,
          });
        } catch (err) {
          console.error("Failed to sync Django session:", err);
          // Continue anyway - NextAuth session is still valid
        }
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex my-16 items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="sm:w-[400px] w-full text-center border border-gray-300/60 rounded-2xl px-8 py-8 bg-white"
      >
        <h1 className="text-gray-900 text-3xl mb-4 font-medium">Login</h1>
        <p className="text-gray-500 text-sm mb-6">Please sign in to continue</p>

        <Input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="mb-4"
        />

        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mb-4"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          className="w-full h-11"
        >
          Login
        </Button>

        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3">
          <span>Don't have an account? </span>
          <a href="/auth/register" className="text-[#8B1C3B]">
            Register
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;

