'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validatePassword, validateEmail } from '@/lib/validation/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
    general: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message || 'Invalid password';
        isValid = false;
      }
    }

    // Validate name
    if (!formData.name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({ email: '', password: '', name: '', general: '' });

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setErrors(prev => ({ ...prev, general: data.message }));
      } else {
        // Redirect to login page on successful registration
        router.push('/login?registered=true');
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Registration failed. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };
return (
  <div className="min-h-screen flex">
    {/* Left panel - Dark with orange accent */}
    <div className="w-1/2 bg-[#0f0f11] text-white flex items-center justify-center">
      <div className="text-left px-10">
        <h1 className="text-5xl font-bold text-orange-500 leading-tight">
          Community<br />Service<br />App
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Making Ontario Better,<br />One Report at a Time.
        </p>
      </div>
    </div>

    {/* Right panel - Light form */}
    <div className="w-1/2 bg-[#fdfbf6] flex items-center justify-center">
      <div className="w-full max-w-md px-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          Create your account
        </h2>

        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-b border-gray-400 bg-transparent focus:outline-none focus:border-orange-500 placeholder-gray-500`}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}

          <input
            type="email"
            name="email"
            placeholder="E-Mail Address"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-b border-gray-400 bg-transparent focus:outline-none focus:border-orange-500 placeholder-gray-500`}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-b border-gray-400 bg-transparent focus:outline-none focus:border-orange-500 placeholder-gray-500`}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full px-4 py-3 border-b border-gray-400 bg-transparent focus:outline-none focus:border-orange-500 placeholder-gray-500"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white py-3 rounded-full shadow-md hover:bg-orange-600 transition duration-300 font-semibold"
          >
            {isSubmitting ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

}