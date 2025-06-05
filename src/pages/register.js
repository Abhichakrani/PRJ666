import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "password") {
      setPasswordRules({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[@$!%*?&#^()_+=]/.test(value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=])[A-Za-z\d@$!%*?&#^()_+=]{8,}$/;

    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must be at least 8 characters and include one uppercase letter, one number, and one special character."
      );
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed!");
        return;
      }

      router.push("/login");
    } catch {
      setError("An unexpected error occurred!");
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
        <form onSubmit={handleSubmit} className="w-full max-w-sm px-4">
          <h2 className="text-2xl font-semibold text-black mb-10 text-center">Create your account</h2>

          <div className="mb-6">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-400 focus:outline-none focus:border-black py-2 placeholder:text-gray-600"
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="email"
              name="email"
              placeholder="E-Mail Address"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-400 focus:outline-none focus:border-black py-2 placeholder:text-gray-600"
              required
            />
          </div>

<div className="mb-6">
  <input
    type="password"
    name="password"
    placeholder="Password"
    value={form.password}
    onChange={handleChange}
    onFocus={() => setShowRules(true)}
    onBlur={() => form.password === "" && setShowRules(false)}
    className="w-full bg-transparent border-b border-gray-400 focus:outline-none focus:border-black py-2 placeholder:text-gray-600"
    required
  />

  {showRules && (
    <ul className="mt-2 ml-2 text-sm">
      <li className={passwordRules.length ? "text-green-600" : "text-red-500"}>
        {passwordRules.length ? "✔" : "✘"} At least 8 characters
      </li>
      <li className={passwordRules.uppercase ? "text-green-600" : "text-red-500"}>
        {passwordRules.uppercase ? "✔" : "✘"} One uppercase letter
      </li>
      <li className={passwordRules.number ? "text-green-600" : "text-red-500"}>
        {passwordRules.number ? "✔" : "✘"} One number
      </li>
      <li className={passwordRules.special ? "text-green-600" : "text-red-500"}>
        {passwordRules.special ? "✔" : "✘"} One special character
      </li>
    </ul>
  )}
</div>

          <div className="mb-8">
            <input
              type="password"
              name="confirm"
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-400 focus:outline-none focus:border-black py-2 placeholder:text-gray-600"
              required
            />
          </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

<button
  type="submit"
  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full font-semibold transition"
>
  Sign Up
</button>

{/* Creative Login Link */}
<p className="mt-6 text-center text-sm text-gray-600">
  Already part of the movement?{" "}
  <span
    onClick={() => router.push("/login")}
    className="text-orange-500 font-semibold cursor-pointer hover:underline"
  >
    Log in here
  </span>{" "}
  and keep making Ontario better!
</p>
          
        </form>
      </div>
    </div>
  );
}
