import {
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon,
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
import { getPagination, supabase } from "../utils/supabase";
import { Asset } from "../utils/types";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function HomePage() {
  const [assets, setAssets] = useState<Asset[]>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(23);

  const [pages, setPages] = useState(0);

  useEffect(() => {
    const { from, to } = getPagination(page, perPage);
    supabase
      .from<Asset>("assets")
      .select("*")
      .range(from, to)
      .then((r) => {
        const { data, error } = r;
        if (error) {
          console.error(error);
        } else {
          setAssets(data);
        }
      });

    supabase
      .from<Asset>("assets")
      .select("*", { count: "exact", head: true })
      .then((r) => {
        const { error, count } = r;
        if (error) {
          console.error(error);
        } else {
          if (!count) {
            setPages(0);
          } else {
            setPages(Math.ceil(count / perPage));
          }
        }
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setAssets(undefined);
    const { from, to } = getPagination(page, perPage);
    supabase
      .from<Asset>("assets")
      .select("*")
      .range(from, to)
      .then((r) => {
        const { data, error } = r;
        if (error) {
          console.error(error);
        } else {
          setAssets(data);
          setLoading(false);
        }
      });
  }, [page, perPage]);

  return (
    <div className="grid grid-cols-5 gap-4 px-12 py-8 dark:text-white">
      <h1 className="text-3xl font-black md:col-span-2 col-span-full">
        Your Inventory
      </h1>
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
      <nav className="flex items-center justify-between px-4 border-t border-gray-200 col-span-full sm:px-0">
        <div className="flex flex-1 w-0 -mt-px">
          <button
            onClick={() => {
              if (page > 1) {
                setPage(page - 1);
              }
            }}
            className="inline-flex items-center pt-4 pr-1 text-sm font-medium text-white border-t-2 border-transparent hover:text-gray-300 hover:border-gray-300"
          >
            <ArrowNarrowLeftIcon
              className="w-5 h-5 mr-3 text-gray-400"
              aria-hidden="true"
            />
            Previous
          </button>
        </div>
        <div className="hidden md:-mt-px md:flex">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={classNames(
                page === i + 1
                  ? "border-indigo-500 text-indigo-600 font-bold"
                  : "border-transparent text-gray-200 hover:text-gray-300 hover:border-gray-300",
                "inline-flex items-center px-4 pt-4 text-sm font-medium border-t-2"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex justify-end flex-1 w-0 -mt-px">
          <button
            onClick={() => {
              if (page < pages) {
                setPage(page + 1);
              }
            }}
            className="inline-flex items-center pt-4 pr-1 text-sm font-medium text-white border-t-2 border-transparent hover:text-gray-300 hover:border-gray-300"
          >
            Next
            <ArrowNarrowRightIcon
              className="w-5 h-5 ml-3 text-gray-400"
              aria-hidden="true"
            />
          </button>
        </div>
      </nav>
      <ReactTooltip place="bottom" effect="solid" id="cardIcons" />
    </div>
  );
}
