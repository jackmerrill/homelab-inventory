import {
  AnnotationIcon,
  ArrowSmLeftIcon,
  CalculatorIcon,
  CalendarIcon,
  ClockIcon,
  CollectionIcon,
  QrcodeIcon,
  SaveIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import Link from "next/link";
import toast from "react-hot-toast";
import { Asset, AssetHasAsset } from "../utils/types";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { supabase } from "../utils/supabase";
import Spinner from "./Spinner";

export default function FullAssetPage({ asset }: { asset: Asset }) {
  useEffect(() => {
    QRCode.toCanvas(
      document.getElementById("qrcode") as HTMLCanvasElement,
      asset.id,
      {
        width: 256,
      }
    );
  }, [asset.id]);

  const [childAssets, setChildAssets] = useState<Partial<Asset>[]>([]);

  const [randomKey, setRandomKey] = useState(Math.random());

  const [allChildAssets, setAllChildAssets] = useState<AssetHasAsset[]>([]);

  const [initialData, setInitialData] =
    useState<{ value: string; label: string }[]>();

  useEffect(() => {
    supabase
      .from<AssetHasAsset>("asset_has_assets")
      .select("*, child(*), parent(*)")
      .eq("parent", asset.id)
      .then(({ data: asset_has_assets, error }) => {
        if (error) {
          console.error(error);
        } else {
          setAllChildAssets(asset_has_assets);

          supabase
            .from<Asset>("assets")
            .select("id, name")
            .order("updated_at", { ascending: false })
            .limit(10)
            .then(({ data: assets, error }) => {
              if (error) {
                console.error(error);
              } else {
                setInitialData(
                  assets
                    .map((asset) => ({
                      value: asset.id,
                      label: asset.name,
                    }))
                    .filter((a) => a.value !== asset.id)
                    .filter(
                      (a) =>
                        !asset_has_assets.some(
                          (ahas) => (ahas.child as Asset).id === a.value
                        )
                    )
                );
              }
            });
        }
      });
  }, []);

  const loadOptions = (inputValue: string) => {
    // use a debounce to prevent too many requests
    // perform a full text search through supabase
    // and return the first 10 results, sorted by updated_at
    return new Promise<{ value: string; label: string }[]>((resolve) => {
      setTimeout(() => {
        supabase
          .from<Asset>("assets")
          .select("id, name")
          .textSearch("name", inputValue)
          .order("updated_at", { ascending: false })
          .limit(10)
          .then(({ data: assets, error }) => {
            if (error) {
              console.error(error);
            } else {
              resolve(
                assets.map((asset) => ({
                  value: asset.id,
                  label: asset.name,
                }))
              );
            }
          });
      }, 500);
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4 px-12 py-8 dark:text-white">
      <Link href="/" passHref>
        <a className="flex items-center align-middle transition-colors duration-150 text-blue-400 hover:text-blue-500 col-span-full">
          <ArrowSmLeftIcon className="w-5 h-5" />
          <span className="ml-2">Back to Inventory</span>
        </a>
      </Link>
      <h1 className="font-black text-3xl">{asset.name}</h1>
      <div className="flex w-full justify-end space-x-4">
        <button
          onClick={() => {
            toast.promise(
              new Promise<void>(async (resolve, reject) => {
                childAssets.map((child) => {
                  console.log(child.id);
                  supabase
                    .from<AssetHasAsset>("asset_has_assets")
                    .insert({
                      parent: asset.id,
                      child: child.id,
                      updated_at: new Date().toISOString(),
                      created_at: new Date().toISOString(),
                    })
                    .then(({ data, error }) => {
                      if (error) {
                        reject(error);
                      } else {
                        resolve();

                        setChildAssets([]);

                        supabase
                          .from<Asset>(`assets`)
                          .select("in_use")
                          .eq("id", child.id)
                          .single()
                          .then(({ data: asset, error }) => {
                            if (error) {
                              console.error(error);
                            } else {
                              supabase
                                .from<Asset>(`assets`)
                                .update({
                                  in_use: asset.in_use + 1,
                                })
                                .eq("id", child.id)
                                .then(({ error }) => {
                                  if (error) {
                                    console.error(error);

                                    toast.error(
                                      "There was an error updating the child asset: " +
                                        child.name
                                    );

                                    reject(error);
                                  }
                                });
                            }
                          });

                        supabase
                          .from<AssetHasAsset>("asset_has_assets")
                          .select("*, child(*), parent(*)")
                          .eq("parent", asset.id)
                          .then(({ data: asset_has_assets, error }) => {
                            if (error) {
                              console.error(error);
                            } else {
                              setAllChildAssets(asset_has_assets);
                            }
                          });
                      }
                    });
                });
              }),
              {
                loading: "Saving...",
                success: "Saved!",
                error: "Error saving.",
              }
            );
          }}
          className="flex items-center align-middle bg-blue-500 transition-colors duration-150 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <SaveIcon className="w-5 h-5" />
          <span className="ml-2">Save</span>
        </button>
        <button
          onClick={() => {
            toast.promise(
              new Promise<void>((resolve, reject) => {
                fetch(`/api/print/${asset.id}`)
                  .then(() => {
                    resolve();
                  })
                  .catch(() => {
                    reject();
                  });
              }),
              {
                loading: "Printing...",
                success: "Printed!",
                error: "Error printing.",
              }
            );
          }}
          className="flex items-center align-middle bg-blue-500 transition-colors duration-150 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <QrcodeIcon className="w-5 h-5" />
          <span className="ml-2">Print</span>
        </button>
      </div>
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 col-span-1 grid-cols-1 w-full align-top">
        <ul className="grid grid-cols-4 gap-2 space-x-8 col-span-full justify-self-start">
          <li className="flex space-x-2 items-center align-middle h-min">
            <span className="flex items-center space-x-2 font-semibold align-middle">
              <ClockIcon className="w-6 h-6 dark:text-gray-200" />
            </span>
            <div className="grid grid-cols-1">
              <span>Created At</span>
              <span className="font-light text-sm">
                {new Date(asset.created_at).toLocaleDateString("en-US", {
                  timeZone: "UTC",
                })}
              </span>
            </div>
          </li>
          <li className="flex space-x-2 items-center align-middle h-min">
            <span className="flex items-center space-x-2 font-semibold align-middle">
              <AnnotationIcon className="w-6 h-6 dark:text-gray-200" />
            </span>
            <div className="grid grid-cols-1">
              <span>Type</span>
              <span className="font-light text-sm">
                {asset.type.toUpperCase()}
              </span>
            </div>
          </li>
          <li className="flex space-x-2 items-center align-middle h-min">
            <span className="flex items-center space-x-2 font-semibold align-middle">
              <CalculatorIcon className="w-6 h-6 dark:text-gray-200" />
            </span>
            <div className="grid grid-cols-1">
              <span>Quantity</span>
              <span className="font-light text-sm">
                {asset.quantity.toLocaleString()}
              </span>
            </div>
          </li>
          <li className="flex space-x-2 items-center align-middle h-min">
            <span className="flex items-center space-x-2 font-semibold align-middle">
              <CollectionIcon className="w-6 h-6 dark:text-gray-200" />
            </span>
            <div className="grid grid-cols-1">
              <span>In Use</span>
              <span className="font-light text-sm">
                {asset.in_use.toLocaleString()}
              </span>
            </div>
          </li>
        </ul>

        <div className="col-span-full space-y-4">
          <h1 className="font-bold text-2xl col-span-full">
            Assign child assets
          </h1>

          <AsyncSelect
            isMulti
            loadOptions={loadOptions}
            defaultOptions={initialData}
            className="text-black"
            key={randomKey}
            onChange={(value) => {
              setChildAssets(
                value.map((v) => ({ id: v.value, name: v.label }))
              );
            }}
          />
        </div>

        <div className="col-span-full space-y-4">
          <h1 className="font-bold text-2xl col-span-full">Child assets</h1>

          <div className="bg-white dark:border dark:border-gray-700 dark:bg-transparent shadow overflow-hidden sm:rounded-md">
            <ul
              role="list"
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              {allChildAssets.length ? (
                allChildAssets.map((child) => (
                  <li
                    key={(child.child as Asset).id}
                    className="grid grid-cols-4"
                  >
                    <Link
                      passHref
                      href={`/assets/${(child.child as Asset).id}`}
                    >
                      <a className="block col-span-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {(child.child as Asset).name}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {(child.child as Asset).type}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex"></div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <CalendarIcon
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                              <p>
                                Updated:{" "}
                                <time
                                  dateTime={(child.child as Asset).updated_at}
                                >
                                  {new Date(
                                    (child.child as Asset).updated_at
                                  ).toLocaleDateString("en-US", {
                                    timeZone: "UTC",
                                  })}
                                </time>
                              </p>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                    <div className="col-span-1 flex items-center justify-end px-4">
                      <button
                        onClick={() => {
                          toast.promise(
                            new Promise((resolve, reject) => {
                              supabase
                                .from<AssetHasAsset>("asset_has_assets")
                                .delete()
                                .eq("child", (child.child as Asset).id)
                                .eq("parent", asset.id)
                                .then(({ data, error }) => {
                                  if (error) {
                                    reject(error);
                                  } else {
                                    supabase
                                      .from<Asset>(`assets`)
                                      .select("in_use")
                                      .eq("id", (child.child as Asset).id)
                                      .single()
                                      .then(({ data: asset, error }) => {
                                        if (error) {
                                          console.error(error);
                                        } else {
                                          supabase
                                            .from<Asset>(`assets`)
                                            .update({
                                              in_use: asset.in_use - 1,
                                            })
                                            .eq("id", (child.child as Asset).id)
                                            .then(({ error }) => {
                                              if (error) {
                                                console.error(error);

                                                toast.error(
                                                  "There was an error updating the child asset: " +
                                                    (child.child as Asset).name
                                                );

                                                reject(error);
                                              }
                                            });
                                        }
                                      });

                                    setAllChildAssets(
                                      allChildAssets.filter(
                                        (c) =>
                                          (c.child as Asset).id !==
                                          (child.child as Asset).id
                                      )
                                    );

                                    setRandomKey(Math.random());

                                    resolve(data);
                                  }
                                });
                            }),
                            {
                              loading: "Deleting...",
                              success: "Deleted!",
                              error: "Failed to delete.",
                            }
                          );
                        }}
                        className="flex justify-self-end items-center justify-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline"
                      >
                        <TrashIcon className="w-5 h-5" />
                        <span className="ml-2">Delete</span>
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <div className="w-6 h-6 flex mx-auto my-4 justify-center items-center">
                  <Spinner />
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex col-span-1 justify-end">
        <canvas id="qrcode" className="w-full h-full" />
      </div>
    </div>
  );
}
