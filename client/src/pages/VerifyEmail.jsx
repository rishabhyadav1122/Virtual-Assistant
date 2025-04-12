import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/authContext"; // Adjust the import path as needed

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");
  const { verifyEmail , storeTokenInLS } = useAuth();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) return; // Show normal "Check your Email" if token is not present.

    const verify = async () => {
      try {
        const data = await verifyEmail(token);
        if(data.success)
        {
          Swal.fire({
            title: "Success",
            text: "Email is verified",
            icon: "success",
            background: "#1a202c",
            color: "#fff",
            confirmButtonColor: "#3085d6",
          }).then(() => {
            navigate("/login");
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error,
          icon: "error",
          background: "#1a202c",
          color: "#fff",
          confirmButtonColor: "#d33",
        }).then(() => {
          navigate("/register");
        });
      }
    };

    verify();
  }, [navigate, verifyEmail, token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-white text-3xl font-bold mb-4">
          {verified ? "Email Verified!" : "Thanks for Registering!"}
        </h2>
        <p className="text-gray-400">
          {verified
            ? "You can now log in."
            : `A verification email has been sent to ${email}. Please check your inbox.`}
        </p>
      </div>
    </div>
  );
};
