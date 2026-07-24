"use client";

import { getComparisonVerdict } from "@/lib/ai/comparison-verdict";


type Props = {
  left: any;
  right: any;
};

export default function ComparisonCard({
  left,
  right,
}: Props) {

  const leftPrice =
    left.sale_price ?? left.price;

  const rightPrice =
    right.sale_price ?? right.price;


const result =
  getComparisonVerdict(left, right);

  return (

    <div className="overflow-hidden rounded-2xl border bg-white shadow">

      <div className="bg-black px-6 py-4 text-white">

        <h2 className="text-xl font-semibold">

          AI Product Comparison

        </h2>

      </div>

      <table className="w-full">

        <tbody>

          <tr className="border-b">

            <td className="p-4 font-semibold">

              Product

            </td>

            <td>{left.title}</td>

            <td>{right.title}</td>

          </tr>

          <tr className="border-b">

            <td className="p-4 font-semibold">

              Price

            </td>

            <td>₹{leftPrice}</td>

            <td>₹{rightPrice}</td>

          </tr>

          <tr className="border-b">

            <td className="p-4 font-semibold">

              Rating

            </td>

            <td>⭐ {left.rating}</td>

            <td>⭐ {right.rating}</td>

          </tr>

          <tr className="border-b">

            <td className="p-4 font-semibold">

              Brand

            </td>

            <td>{left.brand}</td>

            <td>{right.brand}</td>

          </tr>

        </tbody>

      </table>

      <div className="space-y-3 bg-zinc-50 p-5">

        <h3 className="font-semibold">

          🏆 AI Winner

        </h3>

        <p>

{result.winner.title}
        </p>

        <h3 className="font-semibold">

          💡 AI Verdict

        </h3>

        <p>

{result.verdict}

        </p>

      </div>

    </div>

  );

}