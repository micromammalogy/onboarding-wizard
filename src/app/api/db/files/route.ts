import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const BUCKET_NAME = 'onboarding-files';

async function ensureBucket(supabase: ReturnType<typeof getSupabaseServer>) {
  const { data } = await supabase.storage.getBucket(BUCKET_NAME);
  if (!data) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });
  }
}

/**
 * POST /api/db/files — Upload a file to Supabase Storage
 * Returns the public URL of the uploaded file.
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    await ensureBucket(supabase);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('project_id') as string | null;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'file and project_id are required' },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${projectId}/${timestamp}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 },
      );
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return NextResponse.json({
      url: urlData.publicUrl,
      name: file.name,
      size: file.size,
      path,
    });
  } catch (err) {
    console.error('[files] Upload error:', err);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/db/files — Delete a file from Supabase Storage
 * Query params: path (required)
 */
export async function DELETE(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'path query parameter is required' },
        { status: 400 },
      );
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[files] Delete error:', err);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 },
    );
  }
}
