import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

const ProtectedRoute = ({ role, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return <AppLayout pathname={location.pathname}>{children}</AppLayout>;
};

export default ProtectedRoute;
