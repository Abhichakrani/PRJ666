import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";


export default function withAuth(Component, allowedRoles = []) {
  return function ProtectedRoute(props) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      if (!router.isReady) return; // Wait for router to be ready

      const token = localStorage.getItem("token");

      if (!token) {
        console.log("Token missing — redirecting...");
        router.replace("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const { exp, role } = decoded;

        const now = Date.now() / 1000;
        if (exp < now) {
          console.log("Token expired");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        if (allowedRoles.length && !allowedRoles.includes(role)) {
          router.replace("/unauthorized");
          return;
        }

        setAuthorized(true);
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
      }
    }, [router.isReady]);

    if (!authorized) return null; // Don't render anything until auth is verified

    return <Component {...props} />;
  };
}
