// import { createClient } from "@/lib/supabase/server";
// import { NextRequest, NextResponse } from "next/server";
// import { Profile, CreatedProfileData, Availability } from "@/types";

// interface UserMetadata {
//   email: string;
//   role: "Student" | "Tutor" | "Admin";
//   user_id: string;
//   first_name: string | null;
//   last_name: string | null;
//   age: string;
//   grade: string;
//   gender: string;
//   start_date: string;
//   availability: Availability[];
//   parent_name: string;
//   parent_phone: string;
//   parent_email: string;
//   phone_number: string;
//   timezone: string;
//   subjects_of_interest: string[];
//   status: "Active";
//   student_number: string;
//   languages_spoken: string[];
// }

// export async function POST(request: NextRequest) {
//   try {
//     const newProfileData: CreatedProfileData = await request.json();

//     const profileData: Partial<Profile> = await createUser(newProfileData);
//     return NextResponse.json(
//       { success: true, profileData: profileData },
//       { status: 200 }
//     );
//   } catch (error) {
//     const err = error as Error;
//     return NextResponse.json(
//       {
//         error: err,
//         message: err.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * Creates a new user through an email invite
//  * @param newProfileData 
//  * @returns 
//  */

// const createUser = async (newProfileData: CreatedProfileData) => {
//   const supabase = await createClient();
//   try {
//     // Call signUp to create a new user

//     const { data: authData, error: authError } =
//       await supabase.auth.admin.inviteUserByEmail(newProfileData.email, {
//         data: {
//           first_name: newProfileData.firstName,
//           last_name: newProfileData.lastName,
//         },
//       });

//     if (authError) throw new Error(authError.message);

//     const userMetadata: UserMetadata = {
//       email: newProfileData.email,
//       role: newProfileData.role,
//       user_id: authData.user.id,
//       first_name: newProfileData.firstName,
//       last_name: newProfileData.lastName,
//       age: newProfileData.age,
//       grade: newProfileData.grade,
//       gender: newProfileData.gender,
//       start_date: newProfileData.startDate,
//       availability: newProfileData.availability,
//       parent_name: newProfileData.parentName,
//       parent_phone: newProfileData.parentPhone,
//       parent_email: newProfileData.parentEmail,
//       phone_number: newProfileData.phoneNumber,
//       timezone: newProfileData.timezone,
//       subjects_of_interest: newProfileData.subjects_of_interest,
//       status: newProfileData.status,
//       student_number: newProfileData.studentNumber,
//       languages_spoken: newProfileData.languages_spoken,
//     };

//     const { data: createdProfile, error: profileError } = await supabase
//       .from("Profiles")
//       .insert(userMetadata)
//       .select()
//       .single();

//     if (profileError) {
//       await supabase.auth.admin.deleteUser(authData.user.id);
//       throw profileError;
//     }

//     const createdProfileData: Profile = {
//       id: createdProfile.id, // Assuming 'id' is the generated key
//       createdAt: createdProfile.created_at, // Assuming 'created_at' is the generated timestamp
//       userId: createdProfile.user_id, // Adjust based on your schema
//       role: createdProfile.role,
//       firstName: createdProfile.first_name,
//       lastName: createdProfile.last_name,
//       // dateOfBirth: createdProfile.dateOfBirth,
//       startDate: createdProfile.start_date,
//       availability: createdProfile.availability,
//       email: createdProfile.email,
//       phoneNumber: createdProfile.phone_number,
//       parentName: createdProfile.parent_name,
//       parentPhone: createdProfile.parent_phone,
//       parentEmail: createdProfile.parent_email,
//       timeZone: createdProfile.time_zone,
//       subjects_of_interest: createdProfile.subjects_of_interest,
//       languages_spoken: createdProfile.languages_spoken,
//       tutorIds: createdProfile.tutor_ids,
//       status: createdProfile.status,
//       studentNumber: createdProfile.studentNumber,
//       settingsId: createdProfile.settings_id,
//     };

//     return createdProfileData;
//   } catch (error) {
//     const err = error as Error;
//     console.error("Error creating user:", error);
//     throw error;
//   }
// };
