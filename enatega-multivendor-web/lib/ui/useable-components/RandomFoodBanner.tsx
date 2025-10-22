import React from "react";

const foodImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  "https://images.unsplash.com/photo-1516685018646-5499d0a7d42f",
  "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0",
  "https://images.unsplash.com/photo-1502741338009-cac2772e18bc",
  "https://images.unsplash.com/photo-1523987355523-c7b5b0723c6a"
];

export default function RandomFoodBanner() {
  const randomImage = foodImages[Math.floor(Math.random() * foodImages.length)];
  return (
    <div className="w-100 mb-4">
      <img
        src={randomImage}
        alt="Delicious food"
        className="img-fluid rounded shadow-lg w-100"
        style={{ maxHeight: 320, objectFit: "cover" }}
      />
    </div>
  );
}
