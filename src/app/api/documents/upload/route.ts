import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the user's org_id
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (userError || !userData?.org_id) {
    return NextResponse.json({ error: "User organization not found" }, { status: 403 });
  }

  const orgId = userData.org_id;

  // Parse multipart form data
  const formData = await request.formData();

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || undefined;
  const category = formData.get("category") as "engagement" | "project" | null;
  const engagementType = formData.get("engagement_type") as
    | "purchase_order"
    | "scope_of_work"
    | "nda"
    | "msa"
    | "proposal"
    | "other"
    | null;
  const projectId = formData.get("project_id") as string | null;
  const type = formData.get("type") as "deliverable" | "working_doc" | null;

  // Validate required fields
  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (!category || !["engagement", "project"].includes(category)) {
    return NextResponse.json({ error: "category must be 'engagement' or 'project'" }, { status: 400 });
  }

  if (!type || !["deliverable", "working_doc"].includes(type)) {
    return NextResponse.json({ error: "type must be 'deliverable' or 'working_doc'" }, { status: 400 });
  }

  if (category === "engagement" && !engagementType) {
    return NextResponse.json({ error: "engagement_type is required when category is 'engagement'" }, { status: 400 });
  }

  if (category === "project" && !projectId) {
    return NextResponse.json({ error: "project_id is required when category is 'project'" }, { status: 400 });
  }

  // Build storage path
  const timestamp = Date.now();
  const storagePath = `${orgId}/${category}/${timestamp}-${file.name}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Insert document record
  const { data: document, error: insertError } = await supabase
    .from("documents")
    .insert({
      org_id: orgId,
      project_id: category === "project" ? projectId : null,
      category,
      engagement_type: category === "engagement" ? engagementType : null,
      title: title || file.name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      type,
      status: "draft",
      uploaded_by: user.id,
      uploaded_by_type: "client",
    })
    .select()
    .single();

  if (insertError) {
    // Clean up uploaded file if DB insert fails
    await supabase.storage.from("documents").remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, document });
}
