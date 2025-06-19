import { createClient } from "@supabase/supabase-js";
import { Startup } from "../types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This is a placeholder for a real user session
const FAKE_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

export async function getStartupDataForCurrentUser(): Promise<Startup> {
    console.log("Fetching startup data from Supabase...");

    const { data: startupData, error: startupError } = await supabase
        .from("startups")
        .select(`
            name,
            website,
            description,
            oneLiner,
            commonResponses:common_responses,
            founders (
                fullName:full_name,
                email,
                linkedin
            )
        `)
        .eq("user_id", FAKE_USER_ID)
        .single();

    if (startupError) {
        console.error("Error fetching startup data:", startupError);
        throw new Error("Could not fetch startup data from Supabase.");
    }

    if (!startupData) {
        throw new Error(`No startup found for user ${FAKE_USER_ID}`);
    }

    console.log("✅ Startup data fetched successfully.");
    
    // The data from Supabase needs to be cast to our Startup interface.
    // Supabase returns snake_case, so we map it to our camelCase properties.
    return startupData as unknown as Startup;
} 