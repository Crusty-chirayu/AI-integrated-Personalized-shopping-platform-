export function getComparisonVerdict(
  left: any,
  right: any
) {

  if (left.rating > right.rating) {

    return {

      winner: left,

      verdict:
        `${left.title} offers better overall value based on ratings and specifications.`,

    };

  }

  return {

    winner: right,

    verdict:
      `${right.title} offers better overall value based on ratings and specifications.`,

  };

}