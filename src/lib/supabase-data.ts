import { getSupabaseAdmin } from "@/lib/supabase-server";
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
  specifications?: Record<string, string> | null;
  category_id: string | null;
categories?:
  | {
      name: string | null;
      slug: string | null;
    }
  | {
      name: string | null;
      slug: string | null;
    }[]
  | null;
  product_images?: {
    image_url: string | null;
  }[] | null;
};

function toProduct(row: ProductRow): Product {
  const priceValue = Number(row.price || 0);
  const salePriceValue = row.sale_price
    ? Number(row.sale_price)
    : undefined;

  const stockValue = Number(row.stock_quantity ?? 10);

const categoryName =
  Array.isArray(row.categories)
    ? row.categories[0]?.name ?? "General"
    : row.categories?.name ?? "General";

const images =
  row.product_images
    ?.map((img) => img.image_url)
    .filter((img): img is string => Boolean(img)) ?? [];

const imageUrl =
  images[0] || fallbackProducts[0].image;

return {
  id: row.id,
  title: row.title,
  slug: row.slug,

  price: priceValue,
  salePrice: salePriceValue,

  category: categoryName,

image: imageUrl,
images,

specifications: row.specifications ?? {},

badge: row.tags?.[0],

  rating: 4.8,

  description:
    row.description ||
    "A refined, design-led product from CartIQ.",

  stock: stockValue,
};
}

export async function getProducts(): Promise<Product[]> {
const client = getSupabaseAdmin();
  if (!client) {
    return fallbackProducts;
  }

  

  const { data: products, error } = await client
    .from("products")
.select(`
  id,
  title,
  slug,
  description,
  price,
  sale_price,
  stock_quantity,
  status,
 tags,
specifications,
category_id,
  categories(name,slug),
  product_images(
    id,
    image_url,
    sort_order,
    alt_text
  )
`)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error || !products) {
    return fallbackProducts;
  }
  console.log("TOTAL PRODUCTS:", products.length);
console.log(products);

return (products as ProductRow[]).map((product) =>
  toProduct(product)
);
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const client = getSupabaseAdmin();

  if (!client) {
    return (
      fallbackProducts.find(
        (item) => item.slug === slug
      ) ?? null
    );
  }

  const { data: product, error } = await client
    .from("products")
    .select(`
      id,
      title,
      slug,
      description,
      price,
      sale_price,
      stock_quantity,
      status,
tags,
specifications,
category_id,
      categories(name,slug)
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !product) {
    return (
      fallbackProducts.find(
        (item) => item.slug === slug
      ) ?? null
    );
  }

  const { data: images } = await client
    .from("product_images")
    .select("image_url, sort_order")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true });

  return toProduct({
    ...(product as ProductRow),
    product_images: images ?? [],
  });

  
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
