import { ArrowSmLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/solid";
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
        <a className="flex items-center text-blue-400 align-middle transition-colors duration-150 hover:text-blue-500 col-span-full">
          <ArrowSmLeftIcon className="w-5 h-5" />
          <span className="ml-2">Back to Inventory</span>
        </a>
      </Link>
      <h1 className="text-3xl font-black">New Asset</h1>
      <form
        className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700 col-span-full"
        onSubmit={handleSubmit}
      >
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div className="grid grid-cols-1 mt-6 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </label>
                <div className="flex mt-1 rounded-md shadow-sm">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    onChange={(e) =>
                      setAsset({ ...asset, name: e.target.value })
                    }
                    className="flex-1 block w-full min-w-0 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-black sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Type
                </label>
                <div className="flex mt-1 rounded-md shadow-sm">
                  <input
                    type="text"
                    name="type"
                    id="type"
                    onChange={(e) =>
                      setAsset({ ...asset, type: e.target.value })
                    }
                    className="flex-1 block w-full min-w-0 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-black sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Quantity
                </label>
                <div className="flex mt-1 rounded-md shadow-sm">
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
                    className="flex-1 block w-full min-w-0 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-black sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <h1 className="text-2xl font-bold col-span-full">Attributes</h1>

                {Object.keys(asset.attributes || {}).map((key, i) => {
                  return (
                    <div className="flex space-x-8" key={i}>
                      <div className="sm:col-span-4">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Key
                        </label>
                        <div className="flex mt-1 rounded-md shadow-sm">
                          <input
                            type="text"
                            name="key"
                            id="key"
                            defaultValue={key}
                            onChange={(e) => {
                              // remove the old key and add the new key
                              const newAttributes = {
                                ...asset.attributes,
                              };
                              delete newAttributes[key];
                              newAttributes[e.target.value] = asset.attributes
                                ? asset.attributes[key]
                                : "";
                              setAsset((asset) => ({
                                ...asset,
                                attributes: newAttributes,
                              }));
                            }}
                            className="flex-1 block w-full min-w-0 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-black sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Value
                        </label>
                        <div className="flex mt-1 rounded-md shadow-sm">
                          <input
                            type="text"
                            name="value"
                            id="value"
                            defaultValue={
                              asset.attributes ? asset.attributes[key] : ""
                            }
                            onChange={(e) => {
                              setAsset((asset) => ({
                                ...asset,
                                attributes: {
                                  ...asset.attributes,
                                  [key]: e.target.value,
                                },
                              }));
                            }}
                            className="flex-1 block w-full min-w-0 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-black sm:text-sm"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setAsset((asset) => ({
                            ...asset,
                            attributes: Object.keys(asset.attributes ?? {})
                              .filter((k) => k !== key)
                              .reduce((acc: any, k) => {
                                acc[k] = asset.attributes
                                  ? asset.attributes[k]
                                  : "";
                                return acc;
                              }, {}),
                          }));
                        }}
                        className="flex items-center px-4 py-2 font-bold text-white align-middle transition-colors duration-150 bg-blue-500 rounded hover:bg-blue-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    setAsset((asset) => ({
                      ...asset,
                      attributes: {
                        ...asset.attributes,
                        "": "",
                      },
                    }));
                  }}
                  type="button"
                  className="flex items-center px-4 py-2 font-bold text-white align-middle transition-colors duration-150 bg-blue-500 rounded hover:bg-blue-700"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="ml-2">Add Attribute</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
