import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PageSEO {
  meta_title: string | null;
  meta_description: string | null;
  schema_markup: string | null;
}

export function usePageSEO(pageKey: string) {
  return useQuery({
    queryKey: ['page-seo', pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_seo')
        .select('meta_title, meta_description, schema_markup')
        .eq('page_key', pageKey)
        .maybeSingle();

      if (error) throw error;
      return data as PageSEO | null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
