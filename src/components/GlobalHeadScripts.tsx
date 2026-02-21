import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function GlobalHeadScripts() {
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
      const raw = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
      return raw.replace(/^"|"$/g, '');
    },
    staleTime: 10 * 60 * 1000,
  });

  if (!data) return null;

  return (
    <Helmet>
      {/* Injected via Admin > SEO > Global Scripts */}
      <script>{`/* head-scripts-start */`}</script>
    </Helmet>
  );
}

// Use a raw DOM approach since Helmet can't inject arbitrary HTML
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
      const raw = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
      return raw.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
    },
    staleTime: 10 * 60 * 1000,
  });

  if (!data) return null;

  // Inject into <head> using a hidden div with dangerouslySetInnerHTML
  // This is the standard pattern for injecting verification meta tags
  return (
    <Helmet>
      {/* Parse and inject meta tags from the raw HTML string */}
      {data.match(/<meta[^>]+>/gi)?.map((tag, i) => {
        const nameMatch = tag.match(/name=["']([^"']+)["']/);
        const contentMatch = tag.match(/content=["']([^"']+)["']/);
        const propertyMatch = tag.match(/property=["']([^"']+)["']/);
        if (contentMatch) {
          if (nameMatch) {
            return <meta key={`gs-${i}`} name={nameMatch[1]} content={contentMatch[1]} />;
          }
          if (propertyMatch) {
            return <meta key={`gs-${i}`} property={propertyMatch[1]} content={contentMatch[1]} />;
          }
        }
        return null;
      })}
    </Helmet>
  );
}
