import { getSupabaseClient } from "@/lib/supabase";
import {
  products as fallbackProducts,
  featuredCategories as fallbackCategories,
  heroSlides as fallbackHeroSlides,
  testimonials as fallbackTestimonials,
  type Product,
} from "@/lib/storefront-data";

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number | string;
  sale_price: number | string | null;
  stock_quantity: number | null;
  status: string | null;
  tags: string[] | null;
  category_id: string | null;
  categories?: {
    name: string | null;
    slug: string | null;
  }[] | null;
  product_images?: { image_url: string | null }[] | null;
};

function toProduct(row: ProductRow): Product {
  const priceValue = Number(row.price || 0);
  const salePriceValue = row.sale_price ? Number(row.sale_price) : undefined;
  const stockValue = Number(row.stock_quantity ?? 10);
  const categoryName = row.categories?.[0]?.name || "General";
  const imageUrl = row.product_images?.[0]?.image_url;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: priceValue,
    salePrice: salePriceValue,
    category: categoryName,
    image: imageUrl || fallbackProducts[0].image,
    badge: row.tags?.[0],
    rating: 4.8,
    description: row.description || "A refined, design-led product from CartIQ.",
    stock: stockValue,
  };
}

export async function getProducts(): Promise<Product[]> {
  const client = getSupabaseClient();
  if (!client) {
    return fallbackProducts;
  }

  const { data, error } = await client
    .from("products")
    .select("id,title,slug,description,price,sale_price,stock_quantity,status,tags,category_id,categories(name,slug),product_images(image_url)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return fallbackProducts;
  }

  return (data as ProductRow[]).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = getSupabaseClient();
  if (!client) {
    return fallbackProducts.find((item) => item.slug === slug) ?? null;
  }

  const { data, error } = await client
    .from("products")
    .select("id,title,slug,description,price,sale_price,stock_quantity,status,tags,category_id,categories(name,slug),product_images(image_url)")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return fallbackProducts.find((item) => item.slug === slug) ?? null;
  }

  return toProduct(data as ProductRow);
}

export async function getFeaturedCategories() {
  return fallbackCategories;
}

export async function getHeroSlides() {
  return fallbackHeroSlides;
}

export async function getTestimonials() {
  return fallbackTestimonials;
}
