import { CartIQLanding } from "@/components/cartiq-landing";
import {
  getFeaturedCategories,
  getHeroSlides,
  getProducts,
  getTestimonials,
} from "@/lib/supabase-data";

export default async function HomePage() {
  const [products, featuredCategories, heroSlides, testimonials] =
    await Promise.all([
      getProducts(),
      getFeaturedCategories(),
      getHeroSlides(),
      getTestimonials(),
    ]);

  return (
    <CartIQLanding
      products={products}
      featuredCategories={featuredCategories}
      heroSlides={heroSlides}
      testimonials={testimonials}
    />
  );
}