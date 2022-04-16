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
    <div className="grid grid-cols-5 gap-4 px-12 py-8 dark:text-white">
      <h1 className="text-3xl font-black md:col-span-2 col-span-full">Your Inventory</h1>
      <div className="grid justify-end w-full grid-cols-2 gap-4 md:col-span-3 col-span-full md:grid-cols-4">
        <button>
          <Link href="/checkin">
            <a className="flex items-center w-full h-full px-4 py-2 font-bold text-white align-middle transition-colors duration-150 bg-blue-500 rounded hover:bg-blue-700">
              <InboxInIcon className="w-5 h-5" />
              <span className="ml-2">Check In</span>
            </a>
          </Link>
        </button>
        <button>
          <Link href="/checkout">
            <a className="flex items-center w-full h-full px-4 py-2 font-bold text-white align-middle transition-colors duration-150 bg-blue-500 rounded hover:bg-blue-700">
              <CheckIcon className="w-5 h-5" />
              <span className="ml-2">Check Out</span>
            </a>
          </Link>
        </button>
        <button>
          <Link href="/search">
            <a className="flex items-center w-full h-full px-4 py-2 font-bold text-white align-middle transition-colors duration-150 bg-blue-500 rounded hover:bg-blue-700">
              <SearchIcon className="w-5 h-5" />
              <span className="ml-2">Search</span>
            </a>
          </Link>
        </button>
        <button>
          <Link href="/new">
            <a className="flex items-center w-full h-full px-4 py-2 font-bold text-white align-middle transition-colors duration-150 bg-blue-500 rounded hover:bg-blue-700">
              <PlusIcon className="w-5 h-5" />
              <span className="ml-2">Add</span>
            </a>
          </Link>
        </button>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4 sm:grid-cols-2 col-span-full">
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
