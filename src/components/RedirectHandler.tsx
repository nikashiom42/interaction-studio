import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function RedirectHandler() {
  const location = useLocation();

  useEffect(() => {
    const checkRedirect = async () => {
      const { data } = await supabase
        .from('redirects')
        .select('to_path')
        .eq('from_path', location.pathname)
        .eq('is_active', true)
        .maybeSingle();

      if (data?.to_path) {
        window.location.replace(data.to_path);
      }
    };

    checkRedirect();
  }, [location.pathname]);

  return null;
}
