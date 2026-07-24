import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Products
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          Add Product
        </h1>

        <p className="mt-2 text-zinc-600">
          Create a new product for your store.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}