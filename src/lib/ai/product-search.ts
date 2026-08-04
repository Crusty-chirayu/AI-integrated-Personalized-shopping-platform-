import { getSupabaseAdmin } from "../supabase-server.ts";
import type { IntentResult } from "./intent.ts";

const SEARCH_ALIASES: Record<string, string[]> = {
  iphone: ["iphone", "iphones", "apple phone", "ios phone"],
  phone: ["phone", "phones", "smartphone", "smartphones", "mobile", "mobiles", "cellphone", "cell phone"],
  tablet: ["tablet", "tablets", "ipad", "ipads"],
  laptop: ["laptop", "laptops", "notebook", "notebooks", "macbook", "macbooks", "ultrabook"],
  desktop: ["desktop", "desktops", "pc", "pcs", "computer", "computers"],
  monitor: ["monitor", "monitors", "display", "displays"],
  keyboard: ["keyboard", "keyboards"],
  mouse: ["mouse", "mice", "trackpad"],
  printer: ["printer", "printers", "scanner", "scanners"],
  router: ["router", "routers", "modem", "modems", "wifi router"],
  storage: ["ssd", "hdd", "hard drive", "hard disk", "pendrive", "pen drive", "usb drive", "memory card", "flash drive"],
  processor: ["cpu", "processor", "processors", "gpu", "graphics card", "motherboard", "ram", "memory"],
  charger: ["charger", "chargers", "cable", "cables", "power bank", "powerbank", "adapter"],
  headphone: ["headphone", "headphones", "over ear headphones"],
  earbud: ["earbud", "earbuds", "earphone", "earphones", "in ear headphones"],
  speaker: ["speaker", "speakers", "bluetooth speaker", "soundbar", "soundbars"],
  watch: ["watch", "watches", "smartwatch", "smartwatches", "wristwatch"],
  camera: ["camera", "cameras", "dslr", "mirrorless camera", "action camera", "webcam"],
  drone: ["drone", "drones"],
  television: ["tv", "tvs", "television", "televisions", "smart tv"],
  console: ["console", "consoles", "gaming console", "playstation", "ps5", "xbox", "nintendo", "switch"],
  projector: ["projector", "projectors"],
  refrigerator: ["fridge", "refrigerator", "refrigerators", "mini fridge"],
  washingmachine: ["washing machine", "washing machines", "washer"],
  ac: ["ac", "air conditioner", "air conditioners", "cooler", "air cooler"],
  fan: ["fan", "fans", "ceiling fan", "table fan"],
  heater: ["heater", "heaters", "room heater", "water heater", "geyser"],
  microwave: ["microwave", "microwaves", "oven", "ovens", "otg"],
  mixer: ["mixer", "mixer grinder", "grinder", "blender", "blenders", "juicer", "juicers"],
  kettle: ["kettle", "kettles", "electric kettle", "toaster", "toasters", "sandwich maker"],
  vacuum: ["vacuum", "vacuum cleaner", "vacuum cleaners", "robot vacuum"],
  purifier: ["water purifier", "air purifier", "purifier", "purifiers", "ro"],
  iron: ["iron", "irons", "steam iron", "clothes iron"],
  sofa: ["sofa", "sofas", "couch", "couches", "recliner"],
  bed: ["bed", "beds", "mattress", "mattresses"],
  chair: ["chair", "chairs", "office chair", "gaming chair", "stool", "stools"],
  table: ["table", "tables", "desk", "desks", "study table", "dining table"],
  wardrobe: ["wardrobe", "wardrobes", "cupboard", "cupboards", "almirah", "closet"],
  shelf: ["shelf", "shelves", "bookshelf", "bookshelves", "rack", "racks"],
  lamp: ["lamp", "lamps", "light", "lights", "led light", "lighting"],
  curtain: ["curtain", "curtains", "blinds"],
  rug: ["rug", "rugs", "carpet", "carpets", "mat", "mats", "doormat"],
  cushion: ["cushion", "cushions", "pillow", "pillows", "blanket", "blankets", "bedsheet", "bedsheets"],
  mirror: ["mirror", "mirrors"],
  tshirt: ["tshirt", "tshirts", "t-shirt", "t-shirts", "tee", "tees", "shirt", "shirts", "polo", "polos", "top", "tops", "blouse", "blouses"],
  hoodie: ["hoodie", "hoodies", "sweatshirt", "sweatshirts", "sweater", "sweaters"],
  jacket: ["jacket", "jackets", "coat", "coats", "blazer", "blazers", "vest", "vests", "windcheater"],
  pant: ["pant", "pants", "trouser", "trousers", "chinos", "chino", "jeans", "jean", "joggers", "jogger", "cargo", "cargos", "track pants", "shorts", "short"],
  skirt: ["skirt", "skirts", "leggings", "legging"],
  dress: ["dress", "dresses", "gown", "gowns", "jumpsuit", "jumpsuits", "romper"],
  ethnic: ["saree", "sarees", "sari", "lehenga", "lehengas", "kurta", "kurtas", "kurti", "kurtis", "sherwani", "salwar", "suit set"],
  innerwear: ["innerwear", "underwear", "bra", "bras", "boxers", "boxer", "briefs", "vest inner"],
  nightwear: ["nightwear", "pajama", "pajamas", "pyjama", "pyjamas", "sleepwear", "nightsuit"],
  shoe: ["shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "footwear", "trainers", "running shoes"],
  sandal: ["sandal", "sandals", "slipper", "slippers", "flip flop", "flip-flops", "flats", "chappal"],
  heel: ["heel", "heels", "loafer", "loafers"],
  bag: ["bag", "bags", "backpack", "backpacks", "handbag", "handbags", "purse", "purses", "sling bag", "tote bag", "luggage", "trolley bag", "suitcase"],
  wallet: ["wallet", "wallets"],
  belt: ["belt", "belts"],
  cap: ["cap", "caps", "hat", "hats"],
  sunglasses: ["sunglasses", "shades", "eyewear", "glasses", "spectacles"],
  jewelry: ["jewelry", "jewellery", "necklace", "necklaces", "bracelet", "bracelets", "earring", "earrings", "ring", "rings", "chain", "anklet"],
  scarf: ["scarf", "scarves", "stole", "shawl", "muffler", "gloves", "tie", "ties"],
  skincare: ["cream", "moisturizer", "moisturiser", "lotion", "sunscreen", "face wash", "serum", "toner"],
  haircare: ["shampoo", "conditioner", "hair oil", "hair gel", "hair spray"],
  makeup: ["makeup", "make up", "lipstick", "foundation", "mascara", "kajal", "eyeliner", "compact"],
  fragrance: ["perfume", "perfumes", "deodorant", "deo", "body spray", "cologne"],
  personalcare: ["soap", "bodywash", "body wash", "razor", "trimmer", "toothpaste", "toothbrush", "handwash"],
  staples: ["rice", "flour", "atta", "oil", "cooking oil", "sugar", "salt", "pulses", "dal"],
  snacks: ["snack", "snacks", "biscuit", "biscuits", "chips", "namkeen", "chocolate", "chocolates"],
  beverages: ["coffee", "tea", "juice", "juices", "soft drink", "soda", "water bottle"],
  cereal: ["cereal", "cereals", "oats", "muesli"],
  spices: ["spice", "spices", "masala"],
  toy: ["toy", "toys", "puzzle", "puzzles", "lego", "action figure", "board game", "board games", "doll", "dolls"],
  book: ["book", "books", "novel", "novels", "comic", "comics", "textbook"],
  stationery: ["stationery", "notebook", "notebooks", "pen", "pens", "pencil", "pencils", "diary", "file folder", "calculator"],
  fitness: ["dumbbell", "dumbbells", "treadmill", "yoga mat", "gym equipment", "gym", "protein", "resistance band"],
  cycling: ["bicycle", "bicycles", "cycle", "cycles", "helmet", "helmets"],
  sportsgear: ["football", "cricket bat", "badminton", "racket", "tennis ball", "sports shoes"],
  baby: ["diaper", "diapers", "baby food", "stroller", "strollers", "baby carrier", "crib", "cribs", "baby wipes"],
  pet: ["dog food", "cat food", "pet toy", "pet toys", "leash", "pet bed", "pet supplies"],
  auto: ["car accessory", "car accessories", "bike accessory", "helmet", "tyre", "tyres", "tire", "tires", "car cover", "seat cover"],
  office: ["printer ink", "ink cartridge", "file folder", "office chair", "stapler", "whiteboard"],
};

const STOP_WORDS = new Set([
  "i", "im", "i'm", "want", "wanna", "need", "buy", "show", "me", "give", "suggest", "recommend", "looking", "lookingfor", "search", "find", "please", "can", "could", "would", "like", "an", "a", "the", "for", "to", "of", "with", "under", "around", "my", "our", "best", "good", "cheap", "cheaper", "budget", "price"
]);

function normalizeText(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getQueryTokens(intent: IntentResult): string[] {
  const queryParts = [intent.searchText, intent.category, intent.brand].filter(Boolean) as string[];
  const raw = normalizeText(queryParts.join(" "));
  const tokens = raw
    .split(" ")
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token));

  const expanded = tokens.flatMap((token) => {
    const aliasEntry = Object.entries(SEARCH_ALIASES).find(([, aliases]) => aliases.includes(token));
    return aliasEntry ? aliasEntry[1] : [token];
  });

  return Array.from(new Set(expanded.filter(Boolean)));
}

function getProductText(product: any) {
  const category = normalizeText(product.categories?.name ?? product.category ?? product.cat ?? "");
  const title = normalizeText(product.title ?? "");
  const description = normalizeText(product.description ?? "");
  const brand = normalizeText(product.brand ?? product.manufacturer ?? "");
  const sku = normalizeText(product.sku ?? product.SKU ?? "");
  const badge = normalizeText(product.badge ?? "");
  const tags = normalizeText(Array.isArray(product.tags) ? product.tags.join(" ") : product.tags ?? "");
  const reason = normalizeText(product.reason ?? "");
  const specs = normalizeText(typeof product.specifications === "string" ? product.specifications : JSON.stringify(product.specifications ?? {}));
  const metaTitle = normalizeText(product.meta_title ?? "");
  const metaDescription = normalizeText(product.meta_description ?? "");
  const keywords = normalizeText(Array.isArray(product.keywords) ? product.keywords.join(" ") : product.keywords ?? "");

  return { category, title, description, brand, sku, badge, tags, reason, specs, metaTitle, metaDescription, keywords };
}

export function filterProductsForIntent(products: any[], intent: IntentResult) {
  const tokens = getQueryTokens(intent);
  const requestedCategory = normalizeText(intent.category ?? "");
  const requestedBrand = normalizeText(intent.brand ?? "");

  if (!tokens.length && !requestedCategory && !requestedBrand) {
    return [];
  }

  return products
    .map((product) => {
      const text = getProductText(product);
      let score = 0;
      let strongMatch = false;

      for (const token of tokens) {
        if (!token) continue;
        if (text.title.includes(token)) score += 25;
        if (text.brand.includes(token)) score += 20;
        if (text.category.includes(token)) score += 18;
        if (text.specs.includes(token)) score += 12;
        if (text.description.includes(token)) score += 8;
        if (text.tags.includes(token)) score += 6;
        if (text.keywords.includes(token)) score += 5;
        if (text.reason.includes(token)) score += 4;
        if (text.metaTitle.includes(token)) score += 4;
        if (text.metaDescription.includes(token)) score += 3;
        if (text.sku.includes(token)) score += 6;
        if (text.badge.includes(token)) score += 5;

        if (text.title.includes(token) || text.description.includes(token) || text.category.includes(token) || text.brand.includes(token)) {
          strongMatch = true;
        }
      }

      if (requestedCategory) {
        if (text.category.includes(requestedCategory)) score += 12;
        else if (text.title.includes(requestedCategory) || text.description.includes(requestedCategory) || text.tags.includes(requestedCategory) || text.keywords.includes(requestedCategory)) score += 6;
        else score -= 80;
      }

      if (requestedBrand) {
        if (text.brand.includes(requestedBrand)) score += 15;
        else if (requestedCategory && text.category.includes(requestedCategory)) score += 8;
        else score -= 120;
      }

      if (!requestedCategory && !requestedBrand && tokens.length && !strongMatch) {
        score -= 20;
      }

      return {
        ...product,
        relevanceScore: score,
      };
    })
    .filter((product) => product.relevanceScore > 16)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 6);
}

export async function searchProducts(intent: IntentResult) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    console.error("Supabase Admin client not configured.");
    return [];
  }

  let query = supabase
    .from("products")
    .select(`
      *,
      categories(name),
      product_images(image_url)
    `)
    .eq("status", "active");

  if (intent.budget) {
    query = query.lte("sale_price", intent.budget);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  if (!data) return [];

  const finalProducts = filterProductsForIntent(data, intent);

  const productsWithImages = await Promise.all(
    finalProducts.map(async (product: any) => {
      const { data: images } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", product.id)
        .order("sort_order");

      return {
        ...product,
        product_images: images ?? [],
      };
    })
  );

  return productsWithImages;
}
