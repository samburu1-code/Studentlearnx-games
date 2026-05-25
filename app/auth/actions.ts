'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUp(_prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!name || !email || !password) return 'All fields are required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name } },
  });

  if (error) return error.message;
  redirect('/profile');
}

export async function signIn(_prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) return 'Email and password are required.';

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return 'Invalid email or password.';
  redirect('/profile');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
