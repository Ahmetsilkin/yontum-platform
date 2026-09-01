import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase-server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yontum.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/giris`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/kayit`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/kosullar`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/gizlilik`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    const db = await createClient();
    const { data: businesses } = await db
      .from('businesses')
      .select('slug,updated_at')
      .eq('is_published', true)
      .is('deleted_at', null);

    const businessRoutes: MetadataRoute.Sitemap = (businesses || []).map((b) => ({
      url: `${BASE_URL}/site/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...businessRoutes];
  } catch {
    return staticRoutes;
  }
}
