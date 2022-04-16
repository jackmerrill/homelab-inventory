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
        <div className="w-full h-full">
          <div className="grid h-full grid-cols-2 p-5 bg-white rounded-lg shadow-lg dark:bg-gray-700">
            <h2 className="col-span-1 mb-3 text-2xl font-bold">{asset.name}</h2>
            <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4 col-span-full">
              <li
                className="grid justify-center grid-cols-1"
                data-tip="Created At"
                data-for="cardIcons"
              >
                <span className="justify-self-center">
                  <ClockIcon className="w-5 h-5 dark:text-gray-200" />
                </span>
                <span className="text-sm font-light justify-self-center">
                  {new Date(asset.created_at).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </span>
              </li>
              <li
                className="grid justify-center grid-cols-1"
                data-tip="Type"
                data-for="cardIcons"
              >
                <span className="justify-self-center">
                  <AnnotationIcon className="w-5 h-5 dark:text-gray-200" />
                </span>
                <span className="text-sm font-light justify-self-center">
                  {asset.type.toUpperCase()}
                </span>
              </li>
              <li
                className="grid justify-center grid-cols-1"
                data-tip="Quantity"
                data-for="cardIcons"
              >
                <span className="justify-self-center">
                  <CalculatorIcon className="w-5 h-5 dark:text-gray-200" />
                </span>
                <span className="text-sm font-light justify-self-center">
                  {asset.quantity.toLocaleString()}
                </span>
              </li>
              <li
                className="grid justify-center grid-cols-1"
                data-tip="In Use"
                data-for="cardIcons"
              >
                <span className="justify-self-center">
                  <CollectionIcon className="w-5 h-5 dark:text-gray-200" />
                </span>
                <span className="text-sm font-light justify-self-center">
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
