// import { createClient } from "@supabase/supabase-js";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";
// import { Table } from "@/lib/supabase/tables";

// export async function POST(req: NextRequest) {
//   const supabase = createRouteHandlerClient({ cookies });
//   const { profileId } = await req.json();

//   try {
//     const { data: profileData, error: profileError } = await supabase
//       .from(Table.Profiles)
//       .select("user_id")
//       .eq("id", profileId)
//       .single();

//     if (profileError) {
//       return NextResponse.json({ error: "Profile not found" }, { status: 404 });
//     }

//     const adminSupabase = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.SUPABASE_SERVICE_ROLE_KEY!, // ✅ Server-only environment variable
//       {
//         auth: {
//           autoRefreshToken: false,
//           persistSession: false,
//         },
//       }
//     );

//     // Delete the user
//     const { error: authError } = await adminSupabase.auth.admin.deleteUser(
//       profileData.user_id
//     );

//     if (authError) {
//       return NextResponse.json({ error: authError.message }, { status: 500 });
//     }

//     // Delete from profiles table
//     const { error: deleteError } = await supabase
//       .from(Table.Profiles)
//       .delete()
//       .eq("id", profileId);

//     if (deleteError) {
//       return NextResponse.json({ error: deleteError.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
