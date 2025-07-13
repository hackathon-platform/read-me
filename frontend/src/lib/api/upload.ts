import { supabase } from "@/lib/supabaseClient";

/**
 * Upload image to Supabase Storage
 * @param file - The file to upload
 * @param type - Type of image (banner or icon)
 * @param orgSlug - Organization slug for folder organization
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  type: "banner" | "icon",
  orgSlug: string
): Promise<string> {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 5MB limit");
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Please upload an image.");
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${orgSlug}-${type}-${Date.now()}.${fileExt}`;
    const filePath = `organizations/${orgSlug}/${type}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("organization") // Make sure this bucket name matches your Supabase bucket
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Replace if exists
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Failed to upload ${type}: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("organization")
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
