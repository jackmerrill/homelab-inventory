import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  // If the user doesn't put the env vars, that's their fault
  // this is also to prevent github actions from failing lol
  console.error("Missing Supabase environment variables");
}

export const getPagination = (page: number, size: number) => {
  const limit = size ? +size : 3;
  const from = page ? page * limit : 0;
  const to = page ? from + size : size;

  return { from, to };
};

export const supabase = createClient(supabaseUrl!, supabaseSecretKey!);
