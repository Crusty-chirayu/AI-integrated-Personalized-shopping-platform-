export function buildRecommendations(products: any[]) {

  if (!products.length) return [];

  return products.map((product, index) => {

    let badge = "";
    let reason = "";
    let confidence = 90;

    switch (index) {

      case 0:
        badge = "🏆 Best Overall";
        confidence = 98;
        reason =
          "Excellent balance of price, performance and ratings.";
        break;

      case 1:
        badge = "⭐ Best Value";
        confidence = 95;
        reason =
          "Great value for the money.";
        break;

      case 2:
        badge = "💎 Premium Pick";
        confidence = 94;
        reason =
          "Ideal for users wanting premium features.";
        break;

      case 3:
        badge = "🔥 Hidden Gem";
        confidence = 91;
        reason =
          "Underrated product with strong specifications.";
        break;

      default:
        badge = "👍 Recommended";
        confidence = 90;
        reason =
          "Recommended based on your search.";
    }

    return {

      ...product,

      badge,

      confidence,

      reason,

    };

  });

}