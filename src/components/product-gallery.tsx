"use client";
import { useState } from "react";

type ProductGalleryProps = {
  images?: string[];
};

export default function ProductGallery({
  images = [],
}: ProductGalleryProps) {
  const gallery =
    images.length > 0 ? images : ["/placeholder.png"];

  const [selectedImage, setSelectedImage] = useState(
    gallery[0]
  );

    return (
  <div className="grid gap-5 lg:grid-cols-[80px_1fr]">

    {/* Thumbnails */}

    <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">

      {gallery.map((image, index) => (

        <button
          key={index}
          type="button"
          onClick={() => setSelectedImage(image)}
          className={`overflow-hidden rounded-2xl border-2 transition-all duration-300

            ${
              selectedImage === image
                ? "border-black shadow-lg"
                : "border-transparent hover:border-zinc-300"
            }`}
        >

          <img
            src={image}
            alt={`Thumbnail ${index + 1}`}
            className="h-16 w-16   object-cover"
          />

        </button>

      ))}

    </div>

    {/* Main Image */}

<div className="order-1 h-full overflow-hidden rounded-[30px] border border-black/5 bg-white p-3 shadow-sm lg:order-2">

  <img
    src={selectedImage}
    alt="Product"
    className="h-full min-h-[620px] w-full rounded-[24px] object-cover transition-all duration-300"
  />

</div>

  </div>
);
  
}