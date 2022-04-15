import {
  AnnotationIcon,
  ArrowSmLeftIcon,
  CalculatorIcon,
  CalendarIcon,
  ClockIcon,
  CollectionIcon,
  PlusIcon,
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

  const [attributes, setAttributes] = useState<{
    [key: string]: string;
  }>(asset.attributes || {});

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
        <a className="flex items-center text-blue-400 align-middle transition-colors duration-150 hover:text-blue-500 col-span-full">
          <ArrowSmLeftIcon className="w-5 h-5" />
          <span className="ml-2">Back to Inventory</span>
        </a>
      </Link>
      <h1 className="text-3xl font-black">{asset.name}</h1>
      <div className="flex justify-end w-full space-x-4">
        <button
          onClick={() => {
            toast.promise(
              new Promise<void>(async (resolve, reject) => {
                supabase
                  .from<Asset>("assets")
                  .update({
                    attributes,
                  })
                  .eq("id", asset.id)
                  .then(({ error }) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve();
                    }
                  });

                childAssets.map((child) => {
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
          className="flex items-center px-4 py-2 font-bold text-white align-middle transition-colors duration-150 bg-blue-500 rounded hover:bg-blue-700"
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
          className="flex items-center px-4 py-2 font-bold text-white align-middle transition-colors duration-150 bg-blue-500 rounded hover:bg-blue-700"
        >
          <QrcodeIcon className="w-5 h-5" />
          <span className="ml-2">Print</span>
        </button>
      </div>
      <div className="grid w-full grid-cols-1 col-span-1 gap-4 align-top md:grid-cols-4 sm:grid-cols-2">
        <ul className="grid grid-cols-4 gap-2 space-x-8 col-span-full justify-self-start">
          <li className="flex items-center space-x-2 align-middle h-min">
            <span className="flex items-center space-x-2 font-semibold align-middle">
              <ClockIcon className="w-6 h-6 dark:text-gray-200" />
            </span>
            <div className="grid grid-cols-1">
              <span>Created At</span>
              <span className="text-sm font-light">
                {new Date(asset.created_at).toLocaleDateString("en-US", {
                  timeZone: "UTC",
                })}
              </span>
            </div>
          </li>
          <li className="flex items-center space-x-2 align-middle h-min">
            <span className="flex items-center space-x-2 font-semibold align-middle">
              <AnnotationIcon className="w-6 h-6 dark:text-gray-200" />
            </span>
            <div className="grid grid-cols-1">
              <span>Type</span>
              <span className="text-sm font-light">
                {asset.type.toUpperCase()}
              </span>
            </div>
          </li>
          <li className="flex items-center space-x-2 align-middle h-min">
            <span className="flex items-center space-x-2 font-semibold align-middle">
              <CalculatorIcon className="w-6 h-6 dark:text-gray-200" />
            </span>
            <div className="grid grid-cols-1">
              <span>Quantity</span>
              <span className="text-sm font-light">
                {asset.quantity.toLocaleString()}
              </span>
            </div>
          </li>
          <li className="flex items-center space-x-2 align-middle h-min">
            <span className="flex items-center space-x-2 font-semibold align-middle">
              <CollectionIcon className="w-6 h-6 dark:text-gray-200" />
            </span>
            <div className="grid grid-cols-1">
              <span>In Use</span>
              <span className="text-sm font-light">
                {asset.in_use.toLocaleString()}
              </span>
            </div>
          </li>
        </ul>

        <div className="space-y-4 col-span-full">
          <h1 className="text-2xl font-bold col-span-full">Attributes</h1>

          {Object.keys(attributes).map((key, i) => {
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
                          ...attributes,
                        };
                        delete newAttributes[key];
                        newAttributes[e.target.value] = attributes[key];
                        setAttributes(newAttributes);
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
                      defaultValue={attributes[key]}
                      onChange={(e) => {
                        setAttributes({
                          ...attributes,
                          [key]: e.target.value,
                        });
                      }}
                      className="flex-1 block w-full min-w-0 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:text-black sm:text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setAttributes(
                      Object.keys(attributes)
                        .filter((k) => k !== key)
                        .reduce((acc: any, k) => {
                          acc[k] = attributes[k];
                          return acc;
                        }, {})
                    );
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
              setAttributes({
                ...attributes,
                "": "",
              });
            }}
            className="flex items-center px-4 py-2 font-bold text-white align-middle transition-colors duration-150 bg-blue-500 rounded hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="ml-2">Add Attribute</span>
          </button>
        </div>

        <div className="space-y-4 col-span-full">
          <h1 className="text-2xl font-bold col-span-full">
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

        <div className="space-y-4 col-span-full">
          <h1 className="text-2xl font-bold col-span-full">Child assets</h1>

          <div className="overflow-hidden bg-white shadow dark:border dark:border-gray-700 dark:bg-transparent sm:rounded-md">
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
                            <div className="flex flex-shrink-0 ml-2">
                              <p className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                                {(child.child as Asset).type}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex"></div>
                            <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
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
                    <div className="flex items-center justify-end col-span-1 px-4">
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
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium leading-5 text-white bg-indigo-600 border border-transparent rounded-md justify-self-end hover:bg-indigo-500 focus:outline-none focus:shadow-outline"
                      >
                        <TrashIcon className="w-5 h-5" />
                        <span className="ml-2">Delete</span>
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <div className="flex items-center justify-center w-6 h-6 mx-auto my-4">
                  <Spinner />
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex justify-end col-span-1">
        <canvas id="qrcode" className="w-full h-full" />
      </div>
    </div>
  );
}
