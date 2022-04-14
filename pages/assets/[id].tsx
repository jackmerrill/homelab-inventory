import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import FullAssetPage from "../../components/Asset";
import Spinner from "../../components/Spinner";
import { supabase } from "../../utils/supabase";
import { Asset } from "../../utils/types";

export default function AssetPage() {
  const [asset, setAsset] = useState<Asset>();
  const router = useRouter();

  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    supabase
      .from<Asset>("assets")
      .select("*")
      .eq("id", id?.toString())
      .single()
      .then((r) => {
        const { data, error } = r;
        if (error) {
          console.error(error);
        } else {
          setAsset(data);
        }
      });
  }, [router, id]);

  return (
    <>
      {asset ? (
        <FullAssetPage asset={asset} />
      ) : (
        <div className="w-full h-screen flex justify-center items-center align-middle">
          <div className="w-10 h-10">
            <Spinner />
          </div>
        </div>
      )}
    </>
  );
}
