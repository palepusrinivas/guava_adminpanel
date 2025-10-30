"use client";
import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

function NavBar() {
  const [menuActive, setMenuActive] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const handleBookRide = () => {
    router.push("/bookRide");
    setMenuActive(false);
  };

  const handleLogin = () => {
    router.push("/login");
    setMenuActive(false);
  };

  return (
    <div className="bg-black py-4 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center mx-5">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RF</span>
                </div>
                <h1 className="text-slate-200 font-bold text-xl">
                  RIDE FAST
                </h1>
              </Link>
            </div>
            <div>
              <ul className="hidden md:flex md:items-center space-x-8">
                <li className="text-slate-200 hover:text-white transition-colors duration-300">
                  <Link href="/" className="hover:text-blue-400">
                    RideFast Electric
                  </Link>
                </li>
                <li className="text-slate-200 hover:text-white transition-colors duration-300">
                  <Link href="/" className="hover:text-blue-400">
                    RideFast Factory
                  </Link>
                </li>
                <li className="text-slate-200 hover:text-white transition-colors duration-300">
                  <Link href="/company" className="hover:text-blue-400">
                    Company
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="contained"
              className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleBookRide}
            >
              Book a RideFast Cab
            </Button>
            <Button
              variant="outlined"
              className="hidden sm:block border-white text-white hover:bg-white hover:text-black font-semibold px-6 py-2 rounded-lg transition-all duration-300"
              onClick={handleLogin}
            >
              Login
            </Button>
            <button
              className="sm:hidden text-white p-2 rounded-lg hover:bg-gray-800 transition-colors duration-300"
              onClick={toggleMenu}
            >
              {menuActive ? (
                <CloseIcon className="text-2xl" />
              ) : (
                <MenuIcon className="text-2xl" />
              )}
            </button>
          </div>
        </div>
        
        {menuActive && (
          <div className="sm:hidden bg-gray-900 flex flex-col justify-center items-center absolute w-full left-0 z-50 space-y-6 py-8 shadow-2xl border-t border-gray-700">
            <div className="w-full px-6">
              <ul className="text-slate-200 space-y-4">
                <li>
                  <Link 
                    href="/" 
                    className="block py-2 hover:text-blue-400 transition-colors duration-300"
                    onClick={() => setMenuActive(false)}
                  >
                    RideFast Electric
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/" 
                    className="block py-2 hover:text-blue-400 transition-colors duration-300"
                    onClick={() => setMenuActive(false)}
                  >
                    RideFast Factory
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/company" 
                    className="block py-2 hover:text-blue-400 transition-colors duration-300"
                    onClick={() => setMenuActive(false)}
                  >
                    Company
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col space-y-3 w-full px-6">
              <Button
                variant="contained"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                onClick={handleBookRide}
              >
                Book a RideFast Cab
              </Button>
              <Button
                variant="outlined"
                className="w-full border-white text-white hover:bg-white hover:text-black font-semibold py-3 rounded-lg"
                onClick={handleLogin}
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavBar;
