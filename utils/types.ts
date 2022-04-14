export type Asset = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  type: string;
  quantity: number;
  in_use: number;
  attributes?: {
    [key: string]: string;
  };
};

export type AssetHasAsset = {
  parent: Asset | string;
  child: Asset | string;
  created_at: string;
  updated_at: string;
};
