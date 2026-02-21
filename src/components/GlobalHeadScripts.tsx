import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ParsedMeta {
  name?: string;
  property?: string;
  content: string;
}

function parseMetaTags(html: string): ParsedMeta[] {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const metas = Array.from(doc.querySelectorAll('meta'));
    return metas
      .map((el) => {
        const content = el.getAttribute('content');
        if (!content) return null;
        const name = el.getAttribute('name');
        const property = el.getAttribute('property');
        if (!name && !property) return null;
        return {
          ...(name ? { name } : {}),
          ...(property ? { property } : {}),
          content,
        } as ParsedMeta;
      })
      .filter((m): m is ParsedMeta => m !== null);
  } catch {
    return [];
  }
}

function decodeSettingsValue(value: unknown): string {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'string' ? parsed : value;
    } catch {
      return value;
    }
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

export function GlobalHeadScriptsRaw() {
  const { data } = useQuery({
    queryKey: ['global-head-scripts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'head_scripts')
        .maybeSingle();
      if (error) throw error;
      if (!data?.value) return null;
      return decodeSettingsValue(data.value);
    },
    staleTime: 10 * 60 * 1000,
  });

  if (!data) return null;

  const metas = parseMetaTags(data);
  if (metas.length === 0) return null;

  return (
    <Helmet>
      {metas.map((meta, i) =>
        meta.name ? (
          <meta key={`gs-${i}`} name={meta.name} content={meta.content} />
        ) : (
          <meta key={`gs-${i}`} property={meta.property} content={meta.content} />
        )
      )}
    </Helmet>
  );
}
