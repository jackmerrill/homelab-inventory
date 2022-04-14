import { ArrowSmLeftIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../utils/supabase";
import { Asset } from "../utils/types";

export default function NewAssetPage() {
  const [asset, setAsset] = useState<Asset>({} as Asset);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.promise(
      new Promise<void>((resolve, reject) => {
        supabase
          .from<Asset>("assets")
          .insert({
            ...asset,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            in_use: 0,
          })
          .single()
          .then((r) => {
            const { error, data } = r;
            if (error) {
              reject(error);
            } else {
              resolve();
              router.push(`/assets/${data.id}`);
            }
          });
      }),
      {
        loading: "Adding asset...",
        success: "Asset added!",
        error: "Error adding asset.",
      }
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4 px-12 py-8 dark:text-white">
      <Link href="/" passHref>
        <a className="flex items-center align-middle transition-colors duration-150 text-blue-400 hover:text-blue-500 col-span-full">
          <ArrowSmLeftIcon className="w-5 h-5" />
          <span className="ml-2">Back to Inventory</span>
        </a>
      </Link>
      <h1 className="font-black text-3xl">New Asset</h1>
      <form
        className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700 col-span-full"
        onSubmit={handleSubmit}
      >
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium dark:text-gray-300 text-gray-700"
                >
                  Name
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    onChange={(e) =>
                      setAsset({ ...asset, name: e.target.value })
                    }
                    className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-black block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium dark:text-gray-300 text-gray-700"
                >
                  Type
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="type"
                    id="type"
                    onChange={(e) =>
                      setAsset({ ...asset, type: e.target.value })
                    }
                    className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-black block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium dark:text-gray-300 text-gray-700"
                >
                  Quantity
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="0"
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (isNaN(value)) {
                        setAsset((asset) => ({
                          ...asset,
                          quantity: 0,
                        }));
                      } else {
                        setAsset((asset) => ({
                          ...asset,
                          quantity: value,
                        }));
                      }
                    }}
                    className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-black block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
