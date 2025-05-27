// src/services/events.ts
import { supabase } from "@/utils/supabase-client";

export async function fetchEvents(locale = 'en', filters?: {
  q?: string;
  category?: string;
  location?: string;
  date?: string;
}) {
  let query = supabase
    .from('events')
    .select(`
      id,
      start_datetime,
      end_datetime,
      location,
      image_url,
      max_participants,
      prize_amount,
      currency,
      is_public,
      category:event_categories(name),
      organization:organizations(name),
      translations:event_translations(title, description, locale),
      tags:event_tags(tags(name))
    `)
    .eq('is_public', true)
    .order('start_datetime', { ascending: true });

  if (filters?.q) {
    query = query.or(`translations.title.ilike.%${filters.q}%,translations.description.ilike.%${filters.q}%,location.ilike.%${filters.q}%`);
  }

  if (filters?.category) {
    query = query.eq('event_categories.name', filters.category);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters?.date) {
    const date = new Date(filters.date);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    
    query = query
      .gte('start_datetime', date.toISOString())
      .lt('start_datetime', nextDay.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;

  return data?.map(event => ({
    ...event,
    translations: event.translations.filter(t => t.locale === locale || t.locale === 'en')
  })) || [];
}