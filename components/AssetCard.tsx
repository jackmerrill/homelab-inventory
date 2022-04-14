import Link from "next/link";
import { Asset } from "../utils/types";
import {
  AnnotationIcon,
  CalculatorIcon,
  ClockIcon,
  CollectionIcon,
  DotsVerticalIcon,
} from "@heroicons/react/solid";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AssetCard({ asset }: { asset: Asset }) {
  return (
    <Link href={`/assets/${asset.id}`} passHref>
      <a>
        <div className="w-full">
          <div className="bg-white dark:bg-gray-700 grid grid-cols-2 rounded-lg shadow-lg p-5">
            <h2 className="text-2xl font-bold mb-3 col-span-1">{asset.name}</h2>
            <ul className="grid grid-cols-4 gap-2 col-span-full">
              <li
                className="grid grid-cols-1 justify-center"
                data-tip="Created At"
                data-for="cardIcons"
              >
                <span className="justify-self-center">
                  <ClockIcon className="w-5 h-5 dark:text-gray-200" />
                </span>
                <span className="justify-self-center font-light text-sm">
                  {new Date(asset.created_at).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </span>
              </li>
              <li
                className="grid grid-cols-1 justify-center"
                data-tip="Type"
                data-for="cardIcons"
              >
                <span className="justify-self-center">
                  <AnnotationIcon className="w-5 h-5 dark:text-gray-200" />
                </span>
                <span className="justify-self-center font-light text-sm">
                  {asset.type.toUpperCase()}
                </span>
              </li>
              <li
                className="grid grid-cols-1 justify-center"
                data-tip="Quantity"
                data-for="cardIcons"
              >
                <span className="justify-self-center">
                  <CalculatorIcon className="w-5 h-5 dark:text-gray-200" />
                </span>
                <span className="justify-self-center font-light text-sm">
                  {asset.quantity.toLocaleString()}
                </span>
              </li>
              <li
                className="grid grid-cols-1 justify-center"
                data-tip="In Use"
                data-for="cardIcons"
              >
                <span className="justify-self-center">
                  <CollectionIcon className="w-5 h-5 dark:text-gray-200" />
                </span>
                <span className="justify-self-center font-light text-sm">
                  {asset.in_use.toLocaleString()}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </a>
    </Link>
  );
}
