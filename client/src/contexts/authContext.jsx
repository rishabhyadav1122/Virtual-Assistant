import { createContext, useContext, useState, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token,setToken] = useState(localStorage.getItem("token"))
  

  // const navigate = useNavigate()
  const storeTokenInLS = (serverToken) =>{
    setToken(serverToken)
    return localStorage.setItem("token",serverToken)
}

let isLoggedIn = !!token
console.log("isLoggedIn" , isLoggedIn)

// tackling logout functionality


  // Fetch user authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("https://virtual-assistant-nu.vercel.app/api/auth/userdata", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          return data.user
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("https://virtual-assistant-nu.vercel.app/api/auth/userdata", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return data.user
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Register User
  const register = async (userData) => {
    const res = await fetch("https://virtual-assistant-nu.vercel.app/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return res.json();
  };

  // Verify Email
  const verifyEmail = async (token) => {
    const res = await fetch(
      `https://virtual-assistant-nu.vercel.app/api/auth/verifyEmail?token=${token}`
    );
    return res.json();
  };

  // Login User
  const login = async (credentials) => {
    const res = await fetch("https://virtual-assistant-nu.vercel.app/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      Swal.fire({
        title: "Welcome!",
        text: "Login Successful",
        icon: "success",
        background: "#1a202c",
        color: "#fff",
        confirmButtonColor: "#3085d6",
      })
      
    }else {
      Swal.fire({
        title: "Login Failed",
        text: "Failed to Login",
        icon: "error",
        background: "#1a202c",
        color: "#fff",
        confirmButtonColor: "#d33",
      })}
    return data;
  };

  // Logout User
  const logoutUser = async () => {
    // First confirmation dialog
    // const navigate = useNavigate()

    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "You want to logout?",
      icon: "warning",
      background: "#1a202c",
        color: "#fff",
        confirmButtonColor: "#3085d6",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel"
    });
  
    // Only proceed if user confirmed
    if (confirmation.isConfirmed) {
      try {
        // Clear token from state and localStorage
        setToken("");
        localStorage.removeItem("token");
        
        // Success notification
        await Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 2000,  // Auto close after 2 seconds
          showConfirmButton: false,
          background: "#1a202c",
        color: "#fff",
          });
        
        // Optional: Redirect to login page
        // navigate('/login');
      } catch (error) {
        // Error handling
        await Swal.fire({
          title: "Error!",
          text: error,
          icon: "error",
          background: "#1a202c",
        color: "#fff",
        confirmButtonColor: "#d33",
        });
      }
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    const res = await fetch("https://virtual-assistant-nu.vercel.app/api/auth/forgotPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.json();
  };

  // Reset Password
  const resetPassword = async (resetToken, newPassword) => {
    const res = await fetch(
      `https://virtual-assistant-nu.vercel.app/api/auth/resetPassword/${resetToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      }
    );
    return res.json();
  };

  // Google Authentication
  const googleAuth = () => {
    window.location.href = "https://virtual-assistant-nu.vercel.app/api/auth/google";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        checkAuthStatus,
        loading,
        register,
        verifyEmail,
        login,
        logoutUser,
        forgotPassword,
        resetPassword,
        googleAuth,
        storeTokenInLS,
        isLoggedIn
        
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () =>{
  const authContextValue = useContext(AuthContext)
  if(!authContextValue){
      throw new Error("useAuth used outside of the provider")

  }
  return authContextValue
}


