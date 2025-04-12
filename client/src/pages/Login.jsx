import { useState } from "react";
import { useAuth } from "../contexts/authContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Loader } from "../components/Loader";
import { FcGoogle } from "react-icons/fc";

export const Login = () => {

  const urlParams = new URLSearchParams(location.search)
  const token = urlParams.get('auth_token')
  if(token) {
    localStorage.setItem('token', token)
    location.href = '/'
  }

  const { login, googleAuth , storeTokenInLS } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
     const response = await login({ email, password });
     
    console.log(response)
     if(response.token !=null)
     {
      
      storeTokenInLS(response.token)
       navigate("/");

     }else {Swal.fire({
             title: "Login Failed",
             text: response.message,
             icon: "error",
             background: "#1a202c",
             color: "#fff",
             confirmButtonColor: "#d33",
           })}
    } catch (error) {
      Swal.fire("Error", error.message || "Login failed!", "error");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await googleAuth();

      // Swal.fire("Success!", "Logged in with Google!", "success");
      navigate("/");
    } catch (error) {
      Swal.fire("Error", error.message || "Google login failed!", "error");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-white text-3xl font-bold text-center">Welcome Back!</h2>
        <p className="text-gray-400 text-center mt-1">Log in to your account</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-gray-300 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full  p-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-gray-300 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full  p-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-bold transition duration-200"
            disabled={loading}
          >
            {loading ? <Loader /> : "Login"}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative text-center">
            <span className="bg-gray-800 px-3 text-gray-400">OR</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-black py-3 rounded font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition duration-200"
          disabled={loading}
        >
          <FcGoogle size={22} /> Sign in with Google
        </button>

        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-purple-400 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <div className="text-center mt-2">
          <span className="text-gray-400">Don't have an account? </span>
          <Link to="/register" className="text-purple-400 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};
