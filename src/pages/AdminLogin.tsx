
import { useNavigate } from "react-router-dom";
import { AdminLogin as AdminLoginComponent } from "@/components/AdminLogin";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useEffect } from "react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLoginSuccess = () => {
    navigate('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Memuat...</div>
      </div>
    );
  }

  return <AdminLoginComponent onLoginSuccess={handleLoginSuccess} />;
};

export default AdminLogin;
