"use server";
import {
  createServerComponentClient,
  SupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { createServerClient as makeServerClient } from "@supabase/ssr";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { cachedGetUser } from "../actions/user.server.actions";
import { cachedGetProfile } from "../actions/profile.server.actions";

export async function createServerClient() {
  const cookieStore = await cookies();
  return makeServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (err) {
            console.error(err);
          }
        },
      },
    }
  );
}

// Supabase Instances are singleton
export async function createClient() {
  const cookieStore = await cookies();

  return createServerComponentClient(
    {
      cookies: () => cookieStore,
    },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_ANON_KEY,
    }
  );
}

export async function createAdminClient() {
  const user = await cachedGetUser()
  if (!user) throw new Error("No Valid Session")
  const profile = await cachedGetProfile(user.id)
  if (!profile || profile.role !== 'Admin') throw new Error("Invalid Permmisions")

  const adminSupabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  return adminSupabase
}

// export const supabase = createServerComponentClient(
//   {
//     cookies: () => cookies(),
//   },
//   {
//     supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
//     supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//   }
// )

// let supabaseInstance: SupabaseClient | null = null;

// export const getSupabase = () => {
//   if (!supabaseInstance) {
//     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//     const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

//     if (!supabaseUrl || !supabaseKey) {
//       throw new Error("Missing Environments");
//     }

//     supabaseInstance = createClient(supabaseUrl, supabaseKey);
//   }
//   return supabaseInstance;
// };
