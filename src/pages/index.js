import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    "/pothole.jpg",
    "/garbage.jpg",
    "/streetlight.jpg",
    "/dumping.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-black text-[#fdfaf5] font-sans transition-all duration-500 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center px-6 sm:px-10 py-6 bg-black text-white">
        <h1 className="text-2xl sm:text-3xl font-bold text-orange-500 tracking-wide">
          {t("app_name")}
        </h1>
        <div className="mt-4 sm:mt-0 space-x-4 flex items-center">
          <LanguageToggle />
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 border border-white rounded-full hover:bg-white hover:text-black transition"
          >
            {t("login")}
          </button>
          <button
            onClick={() => router.push("/register")}
            className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
          >
            {t("register")}
          </button>
        </div>
      </header>

      {/* Intro Section */}
      <section className="text-center px-6 sm:px-10 mt-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-500 mb-2 leading-snug tracking-snug cursor-pointer transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-orange-400 hover:via-yellow-300 hover:to-orange-500">
          {t("app_name")}
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#fdfaf5]">
          {t("tagline")}
        </h2>
        <p className="text-md sm:text-lg text-gray-300 leading-relaxed">
          {t("description")}
        </p>
      </section>

      {/* Image Slideshow with Blur */}
      <div className="mt-12 relative flex justify-center items-center bg-black">
        <div className="absolute inset-0 overflow-hidden opacity-30 blur-sm scale-105 z-0">
          <Image
            src={slides[slideIndex]}
            alt="Blurred Background"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="relative z-10 w-[90%] max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-[#222]">
          <div className="relative w-full h-[300px] sm:h-[400px]">
            <Image
              src={slides[slideIndex]}
              alt="Community Issue"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <section className="mt-16 px-6 sm:px-10 py-8 bg-[#111] text-[#fdfaf5] text-center">
        <h3 className="text-3xl font-bold text-orange-500 mb-6 tracking-wide">{t("about_us")}</h3>
        <div className="max-w-4xl mx-auto text-gray-300 leading-relaxed space-y-4 text-md sm:text-lg">
          <p>{t("about_text_1")}</p>
          <p>{t("about_text_2")}</p>
          <p>{t("about_text_3")}</p>
        </div>
      </section>

      {/* Benefits Comparison Section */}
      <section className="mt-16 px-6 sm:px-10 text-center">
        <h3 className="text-3xl font-bold mb-2 text-orange-500 transition duration-300">
          {t("benefits_title")}
        </h3>
        <p className="text-lg text-gray-300 mb-8">{t("benefits_subtitle")}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Traditional Process */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <h4 className="text-2xl font-bold text-red-400 mb-6">{t("traditional_process")}</h4>
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span className="text-gray-300 text-sm">{t("traditional_step_1")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span className="text-gray-300 text-sm">{t("traditional_step_2")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span className="text-gray-300 text-sm">{t("traditional_step_3")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span className="text-gray-300 text-sm">{t("traditional_step_4")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span className="text-gray-300 text-sm">{t("traditional_step_5")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span className="text-gray-300 text-sm">{t("traditional_step_6")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span className="text-gray-300 text-sm">{t("traditional_step_7")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400 text-xl">❌</span>
                <span className="text-gray-300 text-sm">{t("traditional_step_8")}</span>
              </div>
            </div>
          </div>

          {/* Digital Solution */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
            <h4 className="text-2xl font-bold text-green-400 mb-6">{t("digital_solution")}</h4>
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-gray-300 text-sm">{t("digital_step_1")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-gray-300 text-sm">{t("digital_step_2")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-gray-300 text-sm">{t("digital_step_3")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-gray-300 text-sm">{t("digital_step_4")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-gray-300 text-sm">{t("digital_step_5")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-gray-300 text-sm">{t("digital_step_6")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-gray-300 text-sm">{t("digital_step_7")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-gray-300 text-sm">{t("digital_step_8")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto ">
          <div className="bg-[#1a1a1a] p-4 rounded-xl">
            <h5 className="text-xl font-bold text-orange-400 mb-2">{t("time_saved")}</h5>
            <p className="text-gray-300 text-xs">{t("time_saved_desc")}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl">
            <h5 className="text-xl font-bold text-orange-400 mb-2">{t("transparency")}</h5>
            <p className="text-gray-300 text-xs">{t("transparency_desc")}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl">
            <h5 className="text-xl font-bold text-orange-400 mb-2">{t("efficiency")}</h5>
            <p className="text-gray-300 text-xs">{t("efficiency_desc")}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl">
            <h5 className="text-xl font-bold text-orange-400 mb-2">{t("accessibility")}</h5>
            <p className="text-gray-300 text-xs">{t("accessibility_desc")}</p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="mt-16 px-6 sm:px-10 py-8 bg-[#111] text-center">
        <h3 className="text-3xl font-bold text-orange-500 mb-8 tracking-wide">
          {t("features_title")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="bg-[#1a1a1a] p-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">{t("feature_1_title")}</h4>
            <p className="text-gray-300 text-xs">{t("feature_1_desc")}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">📊</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">{t("feature_2_title")}</h4>
            <p className="text-gray-300 text-xs">{t("feature_2_desc")}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">🔔</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">{t("feature_3_title")}</h4>
            <p className="text-gray-300 text-xs">{t("feature_3_desc")}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">🌐</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">{t("feature_4_title")}</h4>
            <p className="text-gray-300 text-xs">{t("feature_4_desc")}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">📸</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">{t("feature_5_title")}</h4>
            <p className="text-gray-300 text-xs">{t("feature_5_desc")}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">📍</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">{t("feature_6_title")}</h4>
            <p className="text-gray-300 text-xs">{t("feature_6_desc")}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">🚨</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">{t("feature_7_title")}</h4>
            <p className="text-gray-300 text-xs">{t("feature_7_desc")}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">📈</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">{t("feature_8_title")}</h4>
            <p className="text-gray-300 text-xs">{t("feature_8_desc")}</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="mt-16 px-6 sm:px-10 text-center">
        <h3 className="text-3xl font-bold mb-6 text-orange-500 transition duration-300 underline underline-offset-8">
          {t("how_it_works")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 max-w-6xl mx-auto">
          <div className="transition-transform duration-300 hover:scale-105 bg-[#1a1a1a] p-4 rounded-xl shadow-md">
            <h4 className="text-lg font-bold mb-2 text-white">
              1. <Link href="/register" className="text-orange-400 underline hover:text-orange-300">{t("register")}</Link> {" or "}
              <Link href="/login" className="text-orange-400 underline hover:text-orange-300">{t("login")}</Link>
            </h4>
            <p className="text-gray-300 text-sm">{t("step_1_desc")}</p>
          </div>
          <div className="transition-transform duration-300 hover:scale-105 bg-[#1a1a1a] p-4 rounded-xl shadow-md">
            <h4 className="text-lg font-bold mb-2 text-white">2. {t("step_2")}</h4>
            <p className="text-gray-300 text-sm">{t("step_2_desc")}</p>
          </div>
          <div className="transition-transform duration-300 hover:scale-105 bg-[#1a1a1a] p-4 rounded-xl shadow-md">
            <h4 className="text-lg font-bold mb-2 text-white">3. {t("step_3")}</h4>
            <p className="text-gray-300 text-sm">{t("step_3_desc")}</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mt-20 px-6 sm:px-10 py-12 bg-[#111] text-white">
        <h3 className="text-3xl font-bold text-center text-orange-500 mb-10 tracking-wide">
          Meet the Team
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 justify-items-center">
          {[
            { name: "Sanskar Pardesi", gender: "male" },
            { name: "Vrunda Patel", gender: "female" },
            { name: "Abhi Chakrani", gender: "male" },
            { name: "Nadi Lin", gender: "female" },
            { name: "Yash Patel", gender: "male" },
          ].map((member, idx) => (
            <div
              key={idx}
              className="bg-[#1c1c1c] rounded-xl p-6 w-full max-w-xs text-center shadow-md hover:shadow-orange-400 transition"
            >
              <div
                className={`mx-auto mb-4 w-20 h-20 ${
                  member.gender === "female" ? "bg-orange-400" : "bg-blue-500"
                } rounded-full flex items-center justify-center`}
              >
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-3.33 0-6 2.69-6 6v.5h12V20c0-3.31-2.67-6-6-6z" />
                </svg>
              </div>
              <p className="font-semibold text-lg">{member.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-4 text-gray-400 bg-black">
        {t("footer")}
      </footer>
    </div>
  );
}