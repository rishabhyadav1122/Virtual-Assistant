import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const Layout = ({children}) => {
  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen  flex flex-col">
      {/* Navbar remains on top */}
      <Navbar />
     
        {/* Page Content with left margin to avoid overlap on desktop */}
        <div className="flex-1  lg:ml-16">
        {children}
        </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};
