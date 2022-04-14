import {
  AnnotationIcon,
  ArrowSmLeftIcon,
  CalculatorIcon,
  ClockIcon,
  CollectionIcon,
  QrcodeIcon,
} from "@heroicons/react/solid";
import Link from "next/link";
import toast from "react-hot-toast";
import { Asset } from "../utils/types";

export default function FullAssetPage({ asset }: { asset: Asset }) {
  return (
    <div className="grid grid-cols-2 gap-4 px-12 py-8 dark:text-white">
      <Link href="/" passHref>
        <a className="flex items-center align-middle transition-colors duration-150 text-blue-400 hover:text-blue-500 col-span-full">
          <ArrowSmLeftIcon className="w-5 h-5" />
          <span className="ml-2">Back to Inventory</span>
        </a>
      </Link>
      <h1 className="font-black text-3xl">{asset.name}</h1>
      <div className="flex w-full justify-end">
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
        </button>
      </div>
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 col-span-full grid-cols-1 w-full">
        <ul className="grid grid-cols-4 gap-2 space-x-8 col-span-full justify-self-start">
          <li className="flex space-x-2 items-center align-middle">
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
          <li className="flex space-x-2 items-center align-middle">
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
          <li className="flex space-x-2 items-center align-middle">
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
          <li className="flex space-x-2 items-center align-middle">
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
      </div>
    </div>
  );
}
