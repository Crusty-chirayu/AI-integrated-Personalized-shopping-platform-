export type IntentType =
  | "product_search"
  | "comparison"
  | "recommendation"
  | "shopping_advice"
  | "customer_support"
  | "general_chat";

export interface IntentResult {

  type: IntentType;

  brand?: string;

  category?: string;

  budget?: number;

  products?: string[];

  // NEW
  searchText?: string;

  raw: string;

}

const brands = [
  // Electronics - Phones & Computers
  "apple", "samsung", "oneplus", "xiaomi", "redmi", "realme", "oppo",
  "vivo", "nokia", "motorola", "google", "asus", "poco",
  "hp", "lenovo", "dell", "acer", "msi", "microsoft",

  // Electronics - Audio & Wearables
  "boat", "sony", "jbl", "bose", "sennheiser", "skullcandy", "noise",
  "boult", "garmin", "fitbit", "fossil", "titan", "casio", "amazfit",

  // Electronics - Components & Accessories
  "intel", "amd", "nvidia", "corsair", "logitech", "kingston",
  "seagate", "western digital", "wd", "anker", "belkin", "tp-link",

  // Electronics - Cameras & Gaming
  "canon", "nikon", "gopro", "dji", "playstation", "xbox", "nintendo",
  "razer", "hyperx",

  // Fashion & Footwear
  "nike", "adidas", "puma", "reebok", "under armour", "levis",
  "levi's", "h&m", "zara", "uniqlo", "gap", "tommy hilfiger",
  "calvin klein", "gucci", "prada", "louis vuitton", "converse",
  "vans", "new balance", "skechers", "crocs", "woodland", "bata",
  "fila", "jockey", "van heusen", "allen solly", "peter england",

  // Home & Kitchen Appliances
  "lg", "whirlpool", "bosch", "philips", "havells", "prestige",
  "bajaj", "usha", "morphy richards", "kent", "eureka forbes",
  "ifb", "godrej", "haier", "voltas", "blue star", "daikin",

  // Beauty & Personal Care
  "nivea", "dove", "loreal", "l'oreal", "maybelline", "lakme",
  "mamaearth", "himalaya", "garnier", "colgate", "gillette",
  "the body shop", "nykaa", "mac", "olay",

  // Groceries & Food
  "nestle", "cadbury", "amul", "britannia", "kellogg's", "tata",
  "parle", "haldiram's", "mtr", "patanjali",

  // Toys & Kids
  "lego", "hasbro", "mattel", "fisher-price", "hot wheels", "barbie",

  // Sports & Fitness
  "decathlon", "yonex", "sg", "cosco", "wilson", "spalding",

  // Furniture & Home Decor
  "ikea", "urban ladder", "pepperfry", "nilkamal", "godrej interio",
];

const categories = [
  // Electronics
  "phone", "iphone", "smartphone", "laptop", "macbook", "tablet", "ipad",
  "headphone", "headphones", "earbuds", "earphone", "earphones",
  "watch", "smartwatch", "camera", "dslr", "drone",
  "keyboard", "mouse", "monitor", "printer", "scanner",
  "ram", "ssd", "hdd", "gpu", "cpu", "processor", "motherboard",
  "router", "modem", "charger", "cable", "powerbank", "power bank",
  "speaker", "speakers", "soundbar", "projector", "tv", "television",
  "console", "playstation", "xbox", "nintendo", "gamepad", "controller",

  // Fashion - Tops
  "shirt", "tshirt", "t-shirt", "polo", "top", "blouse", "kurta", "kurti",
  "sweater", "sweatshirt", "hoodie", "jacket", "coat", "blazer", "vest",

  // Fashion - Bottoms
  "pant", "pants", "jeans", "trouser", "trousers", "chinos", "joggers",
  "shorts", "skirt", "leggings", "track pants",

  // Fashion - Full outfits / traditional
  "dress", "gown", "saree", "sari", "lehenga", "suit", "sherwani",
  "salwar", "kurta pajama",

  // Fashion - Innerwear / sleepwear
  "innerwear", "underwear", "bra", "boxers", "briefs", "nightwear",
  "pajama", "pajamas", "sleepwear",

  // Footwear
  "shoe", "shoes", "sneaker", "sneakers", "boots", "sandals", "slippers",
  "flip flop", "flip-flops", "heels", "loafers", "flats", "crocs",

  // Accessories
  "bag", "backpack", "handbag", "purse", "wallet", "belt", "cap", "hat",
  "sunglasses", "glasses", "scarf", "tie", "gloves", "jewelry", "jewellery",
  "necklace", "bracelet", "earring", "earrings", "ring",

  // Home & Kitchen
  "mixer", "grinder", "blender", "toaster", "kettle", "microwave",
  "cooker", "pan", "pot", "cookware", "cutlery", "utensils",
  "refrigerator", "fridge", "washing machine", "air conditioner", "ac",
  "fan", "heater", "iron", "vacuum", "purifier",

  // Furniture & Decor
  "sofa", "chair", "table", "bed", "mattress", "wardrobe", "cupboard",
  "shelf", "bookshelf", "desk", "lamp", "curtain", "curtains", "rug",
  "carpet", "mirror", "cushion", "pillow", "blanket",

  // Beauty & Personal Care
  "shampoo", "conditioner", "soap", "bodywash", "lotion", "cream",
  "moisturizer", "sunscreen", "perfume", "deodorant", "makeup",
  "lipstick", "foundation", "mascara", "razor", "trimmer", "toothpaste",
  "toothbrush",

  // Groceries & Food
  "rice", "flour", "oil", "spice", "spices", "snack", "snacks",
  "biscuit", "biscuits", "chocolate", "coffee", "tea", "juice",
  "water bottle", "cereal",

  // Toys, Books & Stationery
  "toy", "toys", "puzzle", "lego", "book", "books", "notebook", "pen",
  "pencil", "stationery", "backpack school", "board game",

  // Sports & Fitness
  "dumbbell", "dumbbells", "treadmill", "yoga mat", "bicycle", "cycle",
  "football", "cricket bat", "badminton", "gym", "protein",

  // Baby & Kids
  "diaper", "diapers", "baby food", "stroller", "baby carrier", "crib",

  // Pet Supplies
  "dog food", "cat food", "pet toy", "leash", "pet bed",

  // Automotive
  "car accessory", "bike accessory", "helmet", "tyre", "tire", "car cover",

  // Office & Misc
  "chair office", "printer ink", "file folder", "calculator",
];

export function detectIntent(message: string): IntentResult {

const text = message
  .toLowerCase()
  .replace(/[^\w\s]/g, " ")
  .replace(/\biphones\b/g, "iphone")
  .replace(/\bphones\b/g, "phone")
  .replace(/\bsmartphones\b/g, "smartphone")
  .replace(/\bpants\b/g, "pant")
  .replace(/\btrousers\b/g, "trouser")
  .replace(/\bjeans\b/g, "jeans")
  .replace(/\bchinos\b/g, "chinos")
  .replace(/\bshoes\b/g, "shoe")
  .replace(/\bsneakers\b/g, "sneaker")
  .replace(/\s+/g, " ")
  .trim();

  const budgetMatch =
    text.match(/under\s*₹?\s*(\d+)/i) ||
    text.match(/below\s*₹?\s*(\d+)/i) ||
    text.match(/less than\s*₹?\s*(\d+)/i);

  const budget = budgetMatch
    ? Number(budgetMatch[1])
    : undefined;

  const brand = brands.find((b) =>
    text.includes(b)
  );

const category = categories.find((c) => {
  return (
    text.includes(c) ||
    text.split(" ").includes(c)
  );
});

  if (
    text.includes("compare") ||
    text.includes("vs")
  ) {

    return {
      type: "comparison",
      products: message
        .split(/vs|compare|and/i)
        .map((x) => x.trim())
        .filter(Boolean),
searchText: message,
      raw: message,
    };

  }

  if (
    text.includes("recommend") ||
    text.includes("suggest") ||
    text.includes("best") ||
    text.includes("top") ||
    text.includes("cheapest") ||
    text.includes("budget") ||
    text.includes("under") ||
    text.includes("below") ||
    text.includes("price") ||
    text.includes("available")
  ) {
    return {
      type: "recommendation",
      brand,
      category,
      budget,
      searchText: message,
      raw: message,
    };
  }

  const shoppingTriggers = [
    "want",
    "need",
    "show",
    "find",
    "search",
    "looking",
    "buy",
    "get",
    "purchase",
    "deal",
    "offer",
    "offer",
    "under",
    "budget",
    "discount",
    "price",
    "cheap",
    "good",
    "best",
    "top",
  ];

  const hasShoppingTrigger = shoppingTriggers.some((word) =>
    text.includes(word)
  );

  const productTerms = [
    ...brands,
    ...categories,
    "phone",
    "mobile",
    "tablet",
    "tv",
    "television",
    "laptop",
    "shoes",
    "watch",
    "headphones",
    "earbuds",
    "speaker",
    "camera",
    "gaming",
    "furniture",
    "sofa",
    "jacket",
    "bag",
    "backpack",
    "desk",
    "mattress",
    "dining",
    "chair",
    "home",
    "kitchen",
    "grocery",
    "sports",
    "fitness",
    "fashion",
  ];

  const hasProductTerm = productTerms.some((term) =>
    text.includes(term)
  );

  if (
    hasShoppingTrigger &&
    (brand || category || budget || hasProductTerm)
  ) {
    return {
      type: "product_search",
      brand,
      category,
      budget,
      searchText: message,
      raw: message,
    };
  }

  if (brand || category || budget || hasProductTerm) {
    return {
      type: "product_search",
      brand,
      category,
      budget,
      searchText: message,
      raw: message,
    };
  }

  if (
    text.includes("order") ||
    text.includes("wishlist") ||
    text.includes("cart") ||
    text.includes("refund") ||
    text.includes("delivery")
  ) {

    return {
      type: "customer_support",
      searchText: message,
      raw: message,
    };

  }



  return {
    type: "general_chat",
    searchText: message,
    raw: message,
  };

}