import { ArrowSmLeftIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { supabase } from "../utils/supabase";
import { Asset } from "../utils/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef.current]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        const { data, error } = await supabase
          .from<Asset>("assets")
          .select("in_use, quantity")
          .eq("id", id)
          .single();

        if (inputRef.current) {
          inputRef.current.value = "";
        }

        if (error) {
          return reject(error);
        }

        if (!data) {
          return reject(new Error("Asset not found."));
        }

        if (data.in_use === data.quantity) {
          return reject(new Error("All assets are already checked out."));
        }

        supabase
          .from<Asset>("assets")
          .update({
            in_use: data.in_use + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .single()
          .then((r) => {
            const { error, data } = r;
            if (error) {
              return reject(error);
            } else {
              return resolve();
            }
          });
      }),
      {
        loading: "Checking out asset...",
        success: "Asset checked out!",
        error: (e) => `Error checking out asset: ${e.message}`,
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
      <h1 className="font-black text-3xl">Checkout Asset</h1>
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
                  ID
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="id"
                    id="id"
                    ref={inputRef}
                    onChange={(e) => setId(e.target.value.toLowerCase())}
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
              Checkout
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
