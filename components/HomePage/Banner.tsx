"use client";
import React, { useState } from "react";
import styles from "./Banner.module.css";
import CircleIcon from "@mui/icons-material/Circle";
import ArrowRightIcon from "@mui/icons-material/ArrowRightAlt";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

function Banner() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Daily");

  const handleBookRide = () => {
    router.push("/bookRide");
  };

  return (
    <div className="h-[90vh] -translate-y-10 relative">
      <div className={styles.croppedImage}></div>
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div
        className={`${styles.bannerMiniContainer} max-w-[70vw] mx-auto mt-9 relative z-10`}
      >
        <p className="text-white text-4xl sm:text-5xl font-semibold w-[25rem] mb-5 drop-shadow-lg">
          Moving people, and the world
        </p>
        <p className="text-white text-lg mb-8 w-[25rem] opacity-90">
          Book a ride in seconds, arrive in minutes. Experience the future of urban mobility.
        </p>
        
        <div className="py-3 bg-white w-[25rem] flex space-x-2 justify-around rounded-lg shadow-lg">
          {["Daily", "Rental", "OutStations"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-4 py-2 rounded-md transition-all duration-300 ${
                activeTab === tab 
                  ? "bg-blue-600 text-white font-semibold" 
                  : "hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="bg-slate-100 pt-5 w-[25rem] md:w-auto rounded-lg shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-around space-y-2 md:space-y-0">
            <div className="flex bg-white items-center border border-slate-300 py-3 px-8 sm:px-14 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CircleIcon className="text-green-600 pr-3 text-[24px]" />
              <p className="text-gray-700 font-medium">Current Location</p>
            </div>
            <div className="flex bg-white items-center border border-slate-300 py-3 px-7 sm:px-14 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CircleIcon className="text-red-500 pr-3 text-[24px]" />
              <p className="text-gray-700 font-medium">Enter Destination</p>
            </div>
            <Button
              onClick={handleBookRide}
              className="cursor-pointer flex items-center py-4 sm:px-14 border border-slate-900 justify-around bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="text-white font-semibold">
                Search
                <span className="text-green-300"> Gauva Mobility Services </span>
              </span>
              <ArrowRightIcon className="text-green-300 ml-2" />
            </Button>
          </div>
          <div className="mt-5 bg-white rounded-lg overflow-hidden">
            <Image
              src="https://s3-ap-southeast-1.amazonaws.com/ola-prod-website/banner-green-desktop.png"
              alt="RideFast Banner"
              className="w-full"
              sizes="100vw"
              height={0}
              width={0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
