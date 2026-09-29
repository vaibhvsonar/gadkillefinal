import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://zsuwbwgtfjmgqgwlwnwd.supabase.co').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !supabaseAnonKey.includes('YOUR_SUPABASE') &&
  !supabaseAnonKey.includes('PLACEHOLDER');

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Uploads an image file directly to Supabase Object Storage (`images` bucket)
 * using the official @supabase/supabase-js SDK and returns its public URL.
 */
export async function uploadToSupabaseStorage(
  file: File,
  folder = 'general'
): Promise<{ url: string; path: string; bucket: string } | null> {
  if (!supabase) return null;

  const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
  const rand = Math.random().toString(36).slice(2, 10);
  const storagePath = `${safeFolder}/${Date.now()}-${rand}.${ext}`;

  let { error } = await supabase.storage.from('images').upload(storagePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'image/jpeg',
  });

  if (error) {
    // Automatically create the public 'images' bucket in Supabase Object Storage via SDK and retry
    await supabase.storage.createBucket('images', { public: true }).catch(() => {});
    const retry = await supabase.storage.from('images').upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });
    error = retry.error;
  }

  if (error) {
    return null;
  }

  const { data } = supabase.storage.from('images').getPublicUrl(storagePath);
  if (!data?.publicUrl) return null;

  return {
    url: data.publicUrl,
    path: storagePath,
    bucket: 'images',
  };
}
