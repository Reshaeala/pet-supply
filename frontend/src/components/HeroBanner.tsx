import React from "react";
import defaultImage from "../assets/petbanner.jpg";

type Props = {
  image?: string;
  onClick?: () => void;
  subtitle?: string;
};
export default function HeroBanner({ image = defaultImage, onClick }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden bg-blue-100">
      <div className="relative  w-full">
        {image ? (
          <img src={image} className="w-full h-full object-cover" alt="hero" />
        ) : (
          <div className="w-full h-full grid place-items-center text-blue-700 text-xl font-semibold">
            Welcome to your pet shop
          </div>
        )}
      </div>
    </div>
  );
}
