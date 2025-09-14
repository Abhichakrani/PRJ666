import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";

export default function SettingsMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="text-2xl">⚙️</button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white text-black border rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Settings</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-red-600 border border-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
