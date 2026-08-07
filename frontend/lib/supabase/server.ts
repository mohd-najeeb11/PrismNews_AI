import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://laaunginsuumiiqpklea.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhYXVuZ2luc3V1bWlpcXBrbGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzY3ODAsImV4cCI6MjEwMTYxMjc4MH0.lKqmoQUgrO-XFVj6jzklsaavZI8Jjzgk0WGM8ZoOISU',


    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Context called from Server Component
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Context called from Server Component
          }
        },
      },
    }
  );
}
