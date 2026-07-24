import { getSupabaseAdmin } from "@/lib/supabase-server";
  import { IntentResult } from "./intent";

  
const SEARCH_ALIASES: Record<string, string[]> = {
  // Phones & tablets
  iphone: ["iphone", "iphones", "apple phone", "ios phone"],
  phone: ["phone", "phones", "smartphone", "smartphones", "mobile", "mobiles", "cellphone", "cell phone"],
  tablet: ["tablet", "tablets", "ipad", "ipads"],

  // Computers & accessories
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

  // Audio & wearables
  headphone: ["headphone", "headphones", "over ear headphones"],
  earbud: ["earbud", "earbuds", "earphone", "earphones", "in ear headphones"],
  speaker: ["speaker", "speakers", "bluetooth speaker", "soundbar", "soundbars"],
  watch: ["watch", "watches", "smartwatch", "smartwatches", "wristwatch"],
  camera: ["camera", "cameras", "dslr", "mirrorless camera", "action camera", "webcam"],
  drone: ["drone", "drones"],

  // TV & entertainment
  television: ["tv", "tvs", "television", "televisions", "smart tv"],
  console: ["console", "consoles", "gaming console", "playstation", "ps5", "xbox", "nintendo", "switch"],
  projector: ["projector", "projectors"],

  // Home appliances
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

  // Furniture & home decor
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

  // Fashion - tops
  tshirt: ["tshirt", "tshirts", "t-shirt", "t-shirts", "tee", "tees", "shirt", "shirts", "polo", "polos", "top", "tops", "blouse", "blouses"],
  hoodie: ["hoodie", "hoodies", "sweatshirt", "sweatshirts", "sweater", "sweaters"],
  jacket: ["jacket", "jackets", "coat", "coats", "blazer", "blazers", "vest", "vests", "windcheater"],

  // Fashion - bottoms
  pant: ["pant", "pants", "trouser", "trousers", "chinos", "chino", "jeans", "jean", "joggers", "jogger", "cargo", "cargos", "track pants", "shorts", "short"],
  skirt: ["skirt", "skirts", "leggings", "legging"],

  // Fashion - full outfits / traditional
  dress: ["dress", "dresses", "gown", "gowns", "jumpsuit", "jumpsuits", "romper"],
  ethnic: ["saree", "sarees", "sari", "lehenga", "lehengas", "kurta", "kurtas", "kurti", "kurtis", "sherwani", "salwar", "suit set"],

  // Fashion - innerwear / sleepwear
  innerwear: ["innerwear", "underwear", "bra", "bras", "boxers", "boxer", "briefs", "vest inner"],
  nightwear: ["nightwear", "pajama", "pajamas", "pyjama", "pyjamas", "sleepwear", "nightsuit"],

  // Footwear
  shoe: ["shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "footwear", "trainers", "running shoes"],
  sandal: ["sandal", "sandals", "slipper", "slippers", "flip flop", "flip-flops", "flats", "chappal"],
  heel: ["heel", "heels", "loafer", "loafers"],

  // Accessories
  bag: ["bag", "bags", "backpack", "backpacks", "handbag", "handbags", "purse", "purses", "sling bag", "tote bag", "luggage", "trolley bag", "suitcase"],
  wallet: ["wallet", "wallets"],
  belt: ["belt", "belts"],
  cap: ["cap", "caps", "hat", "hats"],
  sunglasses: ["sunglasses", "shades", "eyewear", "glasses", "spectacles"],
  jewelry: ["jewelry", "jewellery", "necklace", "necklaces", "bracelet", "bracelets", "earring", "earrings", "ring", "rings", "chain", "anklet"],
  scarf: ["scarf", "scarves", "stole", "shawl", "muffler", "gloves", "tie", "ties"],

  // Beauty & personal care
  skincare: ["cream", "moisturizer", "moisturiser", "lotion", "sunscreen", "face wash", "serum", "toner"],
  haircare: ["shampoo", "conditioner", "hair oil", "hair gel", "hair spray"],
  makeup: ["makeup", "make up", "lipstick", "foundation", "mascara", "kajal", "eyeliner", "compact"],
  fragrance: ["perfume", "perfumes", "deodorant", "deo", "body spray", "cologne"],
  personalcare: ["soap", "bodywash", "body wash", "razor", "trimmer", "toothpaste", "toothbrush", "handwash"],

  // Groceries & food
  staples: ["rice", "flour", "atta", "oil", "cooking oil", "sugar", "salt", "pulses", "dal"],
  snacks: ["snack", "snacks", "biscuit", "biscuits", "chips", "namkeen", "chocolate", "chocolates"],
  beverages: ["coffee", "tea", "juice", "juices", "soft drink", "soda", "water bottle"],
  cereal: ["cereal", "cereals", "oats", "muesli"],
  spices: ["spice", "spices", "masala"],

  // Toys, books & stationery
  toy: ["toy", "toys", "puzzle", "puzzles", "lego", "action figure", "board game", "board games", "doll", "dolls"],
  book: ["book", "books", "novel", "novels", "comic", "comics", "textbook"],
  stationery: ["stationery", "notebook", "notebooks", "pen", "pens", "pencil", "pencils", "diary", "file folder", "calculator"],

  // Sports & fitness
  fitness: ["dumbbell", "dumbbells", "treadmill", "yoga mat", "gym equipment", "gym", "protein", "resistance band"],
  cycling: ["bicycle", "bicycles", "cycle", "cycles", "helmet", "helmets"],
  sportsgear: ["football", "cricket bat", "badminton", "racket", "tennis ball", "sports shoes"],

  // Baby & kids
  baby: ["diaper", "diapers", "baby food", "stroller", "strollers", "baby carrier", "crib", "cribs", "baby wipes"],

  // Pet supplies
  pet: ["dog food", "cat food", "pet toy", "pet toys", "leash", "pet bed", "pet supplies"],

  // Automotive
  auto: ["car accessory", "car accessories", "bike accessory", "helmet", "tyre", "tyres", "tire", "tires", "car cover", "car cover", "seat cover"],

  // Office & misc
  office: ["printer ink", "ink cartridge", "file folder", "office chair", "stapler", "whiteboard"],
};

  export async function searchProducts(
    intent: IntentResult
  ) {

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

    // Budget filter
    if (intent.budget) {
      query = query.lte(
        "sale_price",
        intent.budget
      );
    }

    const { data, error } = await query;





    console.log(
  "RAW PRODUCT SEARCH:",
  JSON.stringify(data, null, 2)
);




    if (error) {
      console.error(error);
      return [];
    }

    if (!data) return [];

    // Smart filtering in JavaScript
    const search =
      intent.searchText?.toLowerCase() ?? "";

  const stopWords = [
    "i",
    "want",
    "need",
    "buy",
    "show",
    "me",
    "an",
    "a",
    "the",
    "for",
    "to",
    "looking",
    "search",
    "find",
  ];

const rawWords = search
  .split(/\s+/)
  .map((w) => w.toLowerCase())
  .filter((w) => w && !stopWords.includes(w));

const words = rawWords.flatMap((word) => {
  const entry = Object.entries(SEARCH_ALIASES).find(
    ([, aliases]) => aliases.includes(word)
  );

  return entry ? entry[1] : [word];
});






const filtered = data.filter((product: any) => {
  const title = (product.title ?? "").toLowerCase();
  const description = (product.description ?? "").toLowerCase();
  const category = (product.categories?.name ?? "").toLowerCase();
  const specs = JSON.stringify(
    product.specifications ?? {}
  ).toLowerCase();

  let score = 0;

  for (const word of words) {
    if (title.includes(word)) score += 5;
    if (category.includes(word)) score += 3;
    if (specs.includes(word)) score += 3;
    if (description.includes(word)) score += 1;
  }

  return score >= 5;
});

const hasExactMatch = filtered.some((product: any) => {
  const title = (product.title ?? "").toLowerCase();
  const specs = JSON.stringify(
    product.specifications ?? {}
  ).toLowerCase();

  return rawWords.every(
    (word) =>
      title.includes(word) ||
      specs.includes(word)
  );
});

const finalProducts = hasExactMatch ? filtered : [];

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