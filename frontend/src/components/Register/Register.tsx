"use client";

import React from "react";
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";

const Register: React.FC = () => {
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
            const res = await fetch("http://localhost:8000/auth/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || "Registration failed");
            } else {
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
                    router.push("/login");
                }
            }
        } catch {
            setError("Network error");
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

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full mb-4 p-3 border border-gray-200 rounded-full outline-none"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full mb-4 p-3 border border-gray-200 rounded-full outline-none"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full mb-4 p-3 border border-gray-200 rounded-full outline-none"
                />

                <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full mb-4 p-3 border border-gray-200 rounded-full outline-none"
                />

                <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full mb-4 p-3 border border-gray-200 rounded-full outline-none"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-full text-white bg-[#8B1C3B] hover:bg-[#6E152F] active:scale-95 transition-all"
                >
                    {loading ? "Signing up..." : "Sign Up"}
                </button>

                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3">
                    <span>Already have an account? </span>
                    <a href="/login" className="text-[#8B1C3B]">Login</a>
                </p>
            </form>
        </div>
    );
};

export default Register;