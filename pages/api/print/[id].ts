import { NextApiRequest, NextApiResponse } from "next";
import { getPrinters, printDirect } from "printer";
import QRCode from "qrcode";
import { supabase } from "../../../utils/supabase";
import { Asset } from "../../../utils/types";
import * as fs from "fs";
import {execSync} from "child_process";

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

  const qrCode = await QRCode.toFile("temp.png", id.toString(), { type: "png" });
  const fuck = execSync("/usr/bin/lp -d SII_SLP100 -o media=custom_83.31x24.13mm_83.31x24.13mm -o sides=one-sided temp.png");
  res.status(200).json({ success: true });
}
