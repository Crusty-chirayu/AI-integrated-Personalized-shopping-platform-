export type Product = {
  id: string;
  title: string;
  slug: string;

  price: number;
  salePrice?: number;

  category: string;

  // Primary image
  image: string;

  specifications?: Record<string, string>;


images?: string[];
  badge?: string;

  rating: number;

  description: string;

  stock: number;
};

export const featuredCategories = [
  {
    title: "Everyday Carry",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    description: "Refined tools for daily rituals.",
  },
  {
    title: "Studio Essentials",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    description: "Quiet objects for focused living.",
  },
  {
    title: "Seasonal Edit",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    description: "Modern pieces for warmer days.",
  },
];

export const heroSlides = [
  {
    heading: "The new standard in elevated essentials.",
    subheading: "Designed in small batches for modern rituals.",
    cta: "Shop the Collection",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80",
  },
  {
    heading: "Quiet luxury, made tangible.",
    subheading: "Discover sculptural pieces that feel like home.",
    cta: "Explore Bestsellers",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1800&q=80",
  },
  {
    heading: "Curated for the everyday ritual.",
    subheading: "Minimal, precise, and built to last.",
    cta: "View New Arrivals",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80",
  },
];

export const products: Product[] = [
  {
    id: "1",
    title: "Contour Tote",
    slug: "contour-tote",
    price: 148,
    salePrice: 128,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    badge: "New",
    rating: 4.8,
    description: "Sculpted carryall with a refined matte finish.",
    stock: 12,
  },
  {
    id: "2",
    title: "Aero Chair",
    slug: "aero-chair",
    price: 320,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    badge: "Bestseller",
    rating: 4.9,
    description: "Balanced comfort with a sculptural silhouette.",
    stock: 7,
  },
  {
    id: "3",
    title: "Linen Layer",
    slug: "linen-layer",
    price: 96,
    category: "Textiles",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    description: "Soft, breathable layers for every season.",
    stock: 20,
  },
  {
    id: "4",
    title: "Sculpted Lamp",
    slug: "sculpted-lamp",
    price: 182,
    category: "Lighting",
    image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    description: "Low-glare lighting with a smoked glass shade.",
    stock: 9,
  },
];

export const testimonials = [
  {
    quote: "Every detail feels intentional and calm.",
    author: "Mina, Bangalore",
  },
  {
    quote: "The quality is exceptional and the packaging is beautiful.",
    author: "Krishna, Bihar",
  },
  {
    quote: "A store that truly understands quiet luxury.",
    author: "Nadia, Jaipur",
  },
];
