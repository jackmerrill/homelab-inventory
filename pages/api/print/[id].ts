import { NextApiRequest, NextApiResponse } from "next";
import { getPrinters, printDirect } from "printer";
import QRCode from "qrcode";
import { supabase } from "../../../utils/supabase";
import { Asset } from "../../../utils/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }

  const { data, error } = await supabase
    .from<Asset>("assets")
    .select("*")
    .eq("id", id.toString())
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (!data) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  if (!process.env.PRINTER_NAME) {
    res.status(500).json({ error: "Missing printer name" });
    return;
  }

  const qrCode = await QRCode.toBuffer(id.toString(), { type: "png" });
  console.log(qrCode);
  printDirect({
    data: qrCode,
    type: "RAW",
    printer: process.env.PRINTER_NAME,
    error: (e) => {
      console.error(e);
      res.status(500).json({ error: e.message });
    },
    success: (jobId) => {
      console.log(`Printed QR code for asset ${id} with job id ${jobId}`);
      res.status(200).json({ success: true });
    },
  });
}
