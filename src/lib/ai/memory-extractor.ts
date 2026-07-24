export function extractPreference(
  message: string
) {
  const lower = message.toLowerCase();

  let favorite_brand: string | undefined;
  let preferred_budget: number | undefined;

  const brands = [
    "apple",
    "samsung",
    "boat",
    "sony",
    "lenovo",
    "hp",
    "asus",
    "dell",
    "nothing",
  ];

  for (const brand of brands) {
    if (lower.includes(brand)) {
      favorite_brand = brand;
      break;
    }
  }

  const budgetMatch =
    message.match(/\d[\d,]*/);

  if (budgetMatch) {
    preferred_budget = Number(
      budgetMatch[0].replace(/,/g, "")
    );
  }

  return {
    favorite_brand,
    preferred_budget,
  };
}