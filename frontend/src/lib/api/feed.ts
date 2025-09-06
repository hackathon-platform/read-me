import { supabase } from "@/lib/supabaseClient";

/**
 * Upload media for feed posts
 * @param file - The file to upload
 * @param type - Type of media (image or video)
 * @returns The public URL of the uploaded media
 */
export async function uploadFeedMedia(
  file: File,
  type: "image" | "video"
): Promise<string> {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file size
    const maxSize = type === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for video, 10MB for image
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Validate file type
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    
    if (type === "image" && !allowedImageTypes.includes(file.type)) {
      throw new Error("Invalid image type. Please upload a valid image file.");
    }
    
    if (type === "video" && !allowedVideoTypes.includes(file.type)) {
      throw new Error("Invalid video type. Please upload a valid video file.");
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `feed-${type}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `feed/${type}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("feed-media") // Feed media bucket
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Failed to upload ${type}: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("feed-media")
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

/**
 * Create a new feed post
 * @param postData - The feed post data
 * @returns The created post
 */
export async function createFeedPost(postData: {
  type: "project" | "activity";
  title: string;
  description: string;
  media: Array<{
    type: "image" | "video";
    url: string;
    caption?: string;
  }>;
}) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // TODO: Insert into feed posts table
    // This would require creating the appropriate database table in Supabase
    const feedPost = {
      id: `post-${Date.now()}`,
      profileId: user.id,
      ...postData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Creating feed post:", feedPost);
    
    // For now, just return the mock data
    return feedPost;
  } catch (error) {
    console.error("Create feed post error:", error);
    throw error;
  }
}

/**
 * Get feed posts
 * @param limit - Number of posts to retrieve
 * @param offset - Offset for pagination
 * @returns Array of feed posts
 */
export async function getFeedPosts(limit: number = 10, offset: number = 0) {
  try {
    // TODO: Implement actual API call to get feed posts
    // This would require creating the appropriate database table in Supabase
    
    // For now, return mock data
    return [];
  } catch (error) {
    console.error("Get feed posts error:", error);
    throw error;
  }
}