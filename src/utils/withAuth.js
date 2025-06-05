import { useEffect } from "react";
import { useRouter } from "next/router";
import jwtDecode from "jwt-decode";

export default function withAuth(Component, allowedRoles = []) {
  return function ProtectedRoute(props) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const { exp, role } = decoded;

        // Check expiration
        const now = Date.now() / 1000;
        if (exp < now) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        // Check role access
        if (allowedRoles.length && !allowedRoles.includes(role)) {
          router.replace("/unauthorized");
        }
      } catch (err) {
        console.error("Invalid token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
      }
    }, [router]);

    return <Component {...props} />;
  };
}
