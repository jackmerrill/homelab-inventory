import { ArrowSmLeftIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import AssetCard from "../components/AssetCard";
import { supabase } from "../utils/supabase";
import { Asset } from "../utils/types";

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState<Asset[]>();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef.current]);

  useEffect(() => {
    if (!search) {
      setAssets([]);
    }
    if (search) {
      supabase
        .rpc("search_assets", {
          keyword: search,
        })
        .then(({ data, error }) => {
          if (error) {
            console.error(error);
          } else {
            setAssets(data);
          }
        });
    }
  }, [search]);

  return (
    <div className="grid grid-cols-2 gap-4 px-12 py-8 dark:text-white">
      <Link href="/" passHref>
        <a className="flex items-center text-blue-400 align-middle transition-colors duration-150 hover:text-blue-500 col-span-full">
          <ArrowSmLeftIcon className="w-5 h-5" />
          <span className="ml-2">Back to Inventory</span>
        </a>
      </Link>
      <h1 className="text-3xl font-black">Search for Asset</h1>
      <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700 col-span-full">
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div className="grid grid-cols-1 mt-6 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="col-span-full">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  ID
                </label>
                <div className="flex mt-1 rounded-md shadow-sm">
                  <input
                    type="text"
                    name="id"
                    id="id"
                    ref={inputRef}
                    onChange={(e) => setSearch(e.target.value.toLowerCase())}
                    className="flex-1 block w-full min-w-0 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-black sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {assets ? (
        <div className="grid w-full grid-cols-4 gap-4 col-span-full">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center col-span-full">
          <div className="text-center">
            <div className="text-xl font-bold">No Results</div>
            <div className="text-gray-600">
              Try searching for something else or{" "}
              <Link href="/">
                <a className="text-blue-500">return to the inventory</a>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
