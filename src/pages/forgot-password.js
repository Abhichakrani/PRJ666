import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setMessage("If your email is registered, check your inbox for reset instructions.");
      }
    } catch (err) {
      setError("Failed to send reset email. Try again later.");
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Panel */}
      <div className="w-1/2 bg-black text-white flex flex-col justify-center items-start pl-20">
        <h1 className="text-5xl font-extrabold text-orange-500 leading-tight">
          Forgot<br />Your<br />Password?
        </h1>
        <p className="mt-6 text-lg text-gray-300">Don&apos;t worry! We&apos;ll help you get back in.</p>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 bg-[#fdfaf5] flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm px-4">
          <h2 className="text-2xl font-semibold text-black mb-10 text-center">Reset your password</h2>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-6 bg-transparent border-b border-gray-400 focus:outline-none focus:border-black py-2 placeholder:text-gray-600"
          />

          {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-full font-semibold shadow-md transition"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
