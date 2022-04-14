import {
  CheckIcon,
  InboxIcon,
  InboxInIcon,
  PlusIcon,
  SearchIcon,
} from "@heroicons/react/solid";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import AssetCard from "../components/AssetCard";
import Spinner from "../components/Spinner";
import { supabase } from "../utils/supabase";
import { Asset } from "../utils/types";

export default function HomePage() {
  const [assets, setAssets] = useState<Asset[]>();
  useEffect(() => {
    supabase
      .from<Asset>("assets")
      .select("*")
      .then((r) => {
        const { data, error } = r;
        if (error) {
          console.error(error);
        } else {
          setAssets(data);
        }
      });
  }, []);
  return (
    <div className="grid grid-cols-2 gap-4 px-12 py-8 dark:text-white">
      <h1 className="font-black text-3xl">Your Inventory</h1>
      <div className="flex w-full justify-end space-x-4">
        <button>
          <Link href="/checkin">
            <a className="flex items-center align-middle bg-blue-500 transition-colors duration-150 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <InboxInIcon className="w-5 h-5" />
              <span className="ml-2">Check In</span>
            </a>
          </Link>
        </button>
        <button>
          <Link href="/checkout">
            <a className="flex items-center align-middle bg-blue-500 transition-colors duration-150 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <CheckIcon className="w-5 h-5" />
              <span className="ml-2">Check Out</span>
            </a>
          </Link>
        </button>
        <button>
          <Link href="/search">
            <a className="flex items-center align-middle bg-blue-500 transition-colors duration-150 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <SearchIcon className="w-5 h-5" />
              <span className="ml-2">Search</span>
            </a>
          </Link>
        </button>
        <button>
          <Link href="/new">
            <a className="flex items-center align-middle bg-blue-500 transition-colors duration-150 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <PlusIcon className="w-5 h-5" />
              <span className="ml-2">Add</span>
            </a>
          </Link>
        </button>
      </div>
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 col-span-full grid-cols-1 w-full">
        {assets ? (
          assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)
        ) : (
          <div className="w-full col-span-full h-[70vh] flex justify-center items-center align-middle">
            <div className="w-10 h-10">
              <Spinner />
            </div>
          </div>
        )}
      </div>
      <ReactTooltip place="bottom" effect="solid" id="cardIcons" />
    </div>
  );
}
