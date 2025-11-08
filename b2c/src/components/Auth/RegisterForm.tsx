"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { authService } from "@/src/services/auth.service";
import { ApiError } from "@/src/services/api.service";
import { Input } from "@/src/components/common/Input";
import { Button } from "@/src/components/common/Button";

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
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
      await authService.register(formData);

      // Автоматически входим после регистрации
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/auth/login");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || "Registration failed");
      } else if (err instanceof Error) {
        setError(err.message || "Registration failed");
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex my-16 items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="sm:w-[400px] w-full text-center border border-gray-300/60 rounded-2xl px-8 py-8 bg-white"
      >
        <h1 className="text-gray-900 text-3xl mb-4 font-medium">Sign Up</h1>
        <p className="text-gray-500 text-sm mb-6">Create a new account</p>

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
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
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

        <Input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
          className="mb-4"
        />

        <Input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
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
          Sign Up
        </Button>

        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3">
          <span>Already have an account? </span>
          <a href="/auth/login" className="text-[#8B1C3B]">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;

