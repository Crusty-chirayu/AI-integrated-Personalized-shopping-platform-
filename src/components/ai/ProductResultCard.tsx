import Image from "next/image";
import Link from "next/link";

type Props = {
  product: any;
};

export default function ProductResultCard({
  product,
}: Props) {

  const image =
    product.product_images?.[0]?.image_url ??
    "/placeholder.png";

  return (

    <Link
      href={`/products/${product.slug}`}
      className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:shadow-lg"
    >

      <Image
        src={image}
        alt={product.title}
        width={400}
        height={400}
        className="aspect-square rounded-xl object-cover"
      />

      <h3 className="mt-4 font-semibold">

        {product.title}

      </h3>

      <p className="mt-2 text-sm text-zinc-500">

        {product.categories?.name}

      </p>

      <div className="mt-4 flex items-center justify-between">

        <span className="text-xl font-bold">

          ₹{product.sale_price}

        </span>

        <span className="rounded-full bg-black px-4 py-2 text-sm text-white">

          View

        </span>

      </div>

    </Link>

  );

}