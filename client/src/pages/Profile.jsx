import { useEffect, useState } from 'react';

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token'); // or your token storage method

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("https://virtual-assistant-nu.vercel.app/api/auth/userdata", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Not Authenticated</h2>
          <p className="text-gray-400">Please login to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Your Profile
          </h1>
          <p className="mt-3 text-xl text-gray-400">
            Manage your account information
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-2 border-gray-800"></div>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>

            <div className="space-y-6">
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-white mb-4">Account Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Full Name</p>
                    <p className="mt-1 text-sm text-white">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Email Address</p>
                    <p className="mt-1 text-sm text-white">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-white mb-4">Security</h3>
                <button className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-lg">
                  Change Password
                </button>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-700 bg-opacity-50 flex justify-end">
            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-md transition duration-200">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
