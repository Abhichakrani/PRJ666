import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed!");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user.role;
      if (role === "admin") {
        router.push("/admin-dashboard");
      } else if (role === "clerk") {
        router.push("/clerk/dashboard");
      } else {
        router.push("/resident/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Panel */}
      <div className="w-1/2 bg-black text-white flex flex-col justify-center items-start pl-20">
<h1
  onClick={() => router.push("/")}
  className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-orange-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-orange-400 hover:via-yellow-300 hover:to-orange-500 leading-tight tracking-tight cursor-pointer transition-all duration-300 text-center sm:text-left"
>
  Community<br className="hidden sm:block" />Service<br className="hidden sm:block" />App
</h1>
        <p className="mt-6 text-lg text-gray-300">Making Ontario Better,<br />One Report at a Time.</p>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 bg-[#fdfaf5] flex items-center justify-center">
        <form onSubmit={handleLogin} className="w-full max-w-sm px-4">
          <h2 className="text-2xl font-semibold text-black mb-10 text-center">Get started!</h2>

          <div className="mb-6">
            <input
              type="email"
              placeholder="E-Mail Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-gray-400 focus:outline-none focus:border-black py-2 placeholder:text-gray-600"
              required
            />
          </div>

          <div className="mb-8">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-gray-400 focus:outline-none focus:border-black py-2 placeholder:text-gray-600"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold shadow-md transition"
            >
              Sign Up
            </button>
            <button
              type="submit"
              className="border border-black text-black px-6 py-2 rounded-full font-semibold hover:bg-black hover:text-white transition"
            >
              Log In
            </button>
          </div>

<p
  onClick={() => router.push("/forgot-password")}
  className="text-sm text-orange-500 text-center hover:underline cursor-pointer"
>
  Forgot Password?
</p>
        </form>
      </div>
    </div>
  );
}
