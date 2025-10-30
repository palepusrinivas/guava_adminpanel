"use client";
import React, { useState } from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

function CardVideoSection() {
  const router = useRouter();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const handleBookRide = () => {
    router.push("/bookRide");
  };

  const handleLearnMore = () => {
    // Scroll to features section or navigate to about page
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="mt-10 sm:mt-32">
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-5xl font-bold my-10 text-gray-800">
          India's most ambitious car
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Experience the future of mobility with our cutting-edge electric vehicles, 
          designed for comfort, efficiency, and sustainability.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="contained"
            size="large"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleBookRide}
          >
            Book Your Ride
          </Button>
          <Button
            variant="outlined"
            size="large"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg transition-all duration-300"
            onClick={handleLearnMore}
          >
            Learn More
          </Button>
        </div>
      </div>
      
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        <video
          style={{ width: "100%", height: "auto", minHeight: "400px" }}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className="transition-opacity duration-500"
        >
          <source
            src="https://s3-ap-southeast-1.amazonaws.com/ola-prod-website/banner-video-mob.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Features Section */}
      <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Electric Power</h3>
          <p className="text-gray-600">100% electric vehicles for a sustainable future</p>
        </div>
        <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
          <p className="text-gray-600">Zero emissions for a cleaner environment</p>
        </div>
        <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚗</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Smart Technology</h3>
          <p className="text-gray-600">Advanced features for a seamless ride experience</p>
        </div>
      </div>
    </div>
  );
}

export default CardVideoSection;
