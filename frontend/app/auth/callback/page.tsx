'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          router.push('/saved');
          router.refresh();
        } else {
          router.push('/login?error=auth-code-error');
        }
      });
    } else {
      router.push('/saved');
    }
  }, [router, searchParams]);

  return (
    <div className="max-w-md mx-auto py-16 text-center text-slate-400 text-xs animate-pulse">
      Completing authentication redirect...
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-16 text-center text-slate-400 text-xs">Authenticating...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
