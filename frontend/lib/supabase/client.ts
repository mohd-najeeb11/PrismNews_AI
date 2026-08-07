import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://laaunginsuumiiqpklea.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhYXVuZ2luc3V1bWlpcXBrbGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzY3ODAsImV4cCI6MjEwMTYxMjc4MH0.placeholder-anon'
  );
}

