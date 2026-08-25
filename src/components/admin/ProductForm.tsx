"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save } from "lucide-react";

import {
  createProduct,
  updateProduct,
} from "@/lib/services/product.service";import { getCategories, type Category } from "@/lib/services/category.service";

type ProductFormProps = {
  product?: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    categoryId: string;
    price: number;
    salePrice?: number | null;
    sku: string;
    stockQuantity: number;
    status: string;
    trackInventory: boolean;
    allowBackorders: boolean;
    specifications?: Record<string, string>;
  };
};

export default function ProductForm({
  product,
}: ProductFormProps) {  const router = useRouter();

const [title, setTitle] = useState(product?.title ?? "");
const [description, setDescription] = useState(product?.description ?? "");
const [category, setCategory] = useState(product?.categoryId ?? "");

const [price, setPrice] = useState(
  product ? String(product.price) : ""
);

const [salePrice, setSalePrice] = useState(
  product?.salePrice ? String(product.salePrice) : ""
);

const [sku, setSku] = useState(product?.sku ?? "");

const [stock, setStock] = useState(
  product ? String(product.stockQuantity) : ""
);

const [status, setStatus] = useState(
  product?.status ?? "active"
);

const [trackInventory, setTrackInventory] = useState(
  product?.trackInventory ?? true
);

const [allowBackorders, setAllowBackorders] = useState(
  product?.allowBackorders ?? false
);

const [categories, setCategories] =
  useState<Category[]>([]);

const [loading, setLoading] = useState(false);
const [uploading, setUploading] = useState(false);
const [error, setError] = useState("");

const [previews, setPreviews] = useState<string[]>(
  product?.imageUrl ? [product.imageUrl] : []
);

const [imageUrls, setImageUrls] = useState<string[]>(
  product?.imageUrl ? [product.imageUrl] : []
);

const [specifications, setSpecifications] = useState<
  { key: string; value: string }[]
>(
  product?.specifications
    ? Object.entries(product.specifications).map(
        ([key, value]) => ({
          key,
          value,
        })
      )
    : [
        {
          key: "",
          value: "",
        },
      ]
);

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories();
      setCategories(data);
    }

    loadCategories();
  }, []);

 async function handleImageUpload(files: FileList)
  {
      try {
      setUploading(true);

const uploadedUrls: string[] = [];
const previewUrls: string[] = [];

for (const file of Array.from(files)) {
  previewUrls.push(URL.createObjectURL(file));

  const formData = new FormData();
  formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed.");
      }

uploadedUrls.push(result.imageUrl);
}

setPreviews((prev) => [...prev, ...previewUrls]);
setImageUrls((prev) => [...prev, ...uploadedUrls]);

} catch (err) { 
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to upload image."
      );
    } finally {
      setUploading(false);
    }
  }
  function removeImage(index: number) {
  setPreviews((prev) =>
    prev.filter((_, i) => i !== index)
  );

  setImageUrls((prev) =>
    prev.filter((_, i) => i !== index)
  );
} 

async function handleSave() {
  try {
    setLoading(true);
    setError("");

    if (!title.trim()) {
      throw new Error("Product name is required.");
    }

    if (!category) {
      throw new Error("Please select a category.");
    }

    if (!price) {
      throw new Error("Price is required.");
    }

    const specificationsObject = specifications
  .filter(
    (spec) =>
      spec.key.trim() !== "" &&
      spec.value.trim() !== ""
  )
  .reduce<Record<string, string>>(
    (acc, spec) => {
      acc[spec.key.trim()] = spec.value.trim();
      return acc;
    },
    {}
  );

    const payload = {
      title,
      description,

      specifications: specificationsObject,
      
imageUrls,
imageUrl: imageUrls[0] ?? "",      categoryId: category,
      price: Number(price),
      salePrice: salePrice
        ? Number(salePrice)
        : undefined,
      sku,
      stockQuantity: Number(stock),
      status,
      trackInventory,
      allowBackorders,
    };

    if (product) {
      await updateProduct(product.id, payload);

      alert("✅ Product updated successfully!");
    } else {
      await createProduct(payload);

      alert("✅ Product created successfully!");
    }

    router.push("/admin/products");
    router.refresh();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
}

  return (
        <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-sm">
      <div className="grid gap-6">

        {/* Product Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Product Name
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Description
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Category + Price */}
        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border p-3"
            >
              <option value="">Select Category</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Price (₹)
            </label>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

        </div>

        {/* Sale Price */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Sale Price (₹)
          </label>

          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* SKU + Stock */}

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium">
              SKU
            </label>

            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Stock Quantity
            </label>

            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

        </div>

        {/* Status */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border p-3"
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Inventory */}

        <div className="space-y-3">

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={trackInventory}
              onChange={(e) => setTrackInventory(e.target.checked)}
            />
            Track Inventory
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allowBackorders}
              onChange={(e) => setAllowBackorders(e.target.checked)}
            />
            Allow Backorders
          </label>

        </div>

        {/* Specifications */}

<div className="space-y-4">

  <label className="block text-sm font-medium">
    Specifications
  </label>

  {specifications.map((spec, index) => (

    <div
      key={index}
      className="flex gap-3"
    >

      <input
        type="text"
        placeholder="Specification"
        value={spec.key}
        onChange={(e) => {
          const updated = [...specifications];
          updated[index].key = e.target.value;
          setSpecifications(updated);
        }}
        className="flex-1 rounded-xl border p-3"
      />

      <input
        type="text"
        placeholder="Value"
        value={spec.value}
        onChange={(e) => {
          const updated = [...specifications];
          updated[index].value = e.target.value;
          setSpecifications(updated);
        }}
        className="flex-1 rounded-xl border p-3"
      />

      <button
        type="button"
        onClick={() =>
          setSpecifications((prev) =>
            prev.filter((_, i) => i !== index)
          )
        }
        className="rounded-xl bg-red-600 px-4 text-white hover:bg-red-700"
      >
        ✕
      </button>

    </div>

  ))}

  <button
    type="button"
    onClick={() =>
      setSpecifications((prev) => [
        ...prev,
        {
          key: "",
          value: "",
        },
      ])
    }
    className="rounded-xl bg-zinc-900 px-5 py-3 text-white hover:bg-zinc-800"
  >
    + Add Specification
  </button>

</div>

        {/* Product Image */}

        <div className="space-y-4">

          <label className="block text-sm font-medium">
            Product Image
          </label>

         <input
  type="file"
  multiple
  accept="image/*"
  onChange={(e) => {
    if (e.target.files) {
      handleImageUpload(e.target.files);
    }
  }}
/>

          {uploading && (
            <p className="text-sm text-blue-600">
              Uploading image...
            </p>
          )}

{previews.length > 0 && (
  <div className="grid grid-cols-4 gap-4">
    {previews.map((preview, index) => (
      <div key={index} className="relative">

        <Image
          src={preview}
          alt={`Preview ${index + 1}`}
          width={320}
          height={160}
          unoptimized
          className="h-40 w-full rounded-xl border object-cover"
        />

        <button
          type="button"
          onClick={() => removeImage(index)}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          ✕
        </button>

      </div>
    ))}
  </div>
)}

        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        

        <button
          onClick={handleSave}
          disabled={loading || uploading}
          className="flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-8 py-4 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />

          {loading
            ? "Saving..."
            : uploading
            ? "Uploading..."
            : product
? "Update Product"
: "Save Product"}
        </button>

      </div>
    </div>
  );
}