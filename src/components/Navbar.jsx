import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);
  const [menu, setMenu] = useState(false);

  const toggleMenu = () => {
    setMenu(!menu);
  };

  return (
    <nav className="bg-gray-900 text-white mb-5">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between py-3">
        <Link className="text-xl font-bold text-white no-underline" to="/">
          Calendar App
        </Link>
        <button
          className="lg:hidden inline-flex items-center justify-center p-2 rounded text-gray-400 hover:text-white focus:outline-none"
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className={`${menu ? "block" : "hidden"} w-full lg:flex lg:items-center lg:w-auto`}>
          <ul className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 mt-4 lg:mt-0 flex-1">
            <li>
              <Link className="block py-2 px-2 text-gray-300 hover:text-white no-underline" to="/events">
                Events
              </Link>
            </li>
            <li>
              <Link className="block py-2 px-2 text-gray-300 hover:text-white no-underline" to="/calendar">
                Calendar
              </Link>
            </li>
            <li>
              <Link className="block py-2 px-2 text-gray-300 hover:text-white no-underline" to="/export">
                Export
              </Link>
            </li>
            <li>
              <Link className="block py-2 px-2 text-gray-300 hover:text-white no-underline" to="/all-events">
                All Events
              </Link>
            </li>
          </ul>
          <div className="flex items-center mt-4 lg:mt-0 lg:ml-auto">
            {user ? (
              <>
                <span className="mr-3 text-gray-300">Hello, {user.displayName}</span>
                <Button variant="destructive" size="sm" onClick={logOut}>
                  Log Out
                </Button>
              </>
            ) : (
              <Link className="text-gray-300 hover:text-white no-underline py-2 px-2" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
