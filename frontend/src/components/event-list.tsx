"use client";

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/supabase-provider';
import { startOfDay, parseISO, addDays, subDays } from 'date-fns';
import EventCard from '@/components/event-card';
import SearchFilter from "@/components/search-filter";

// Dummy data for events
const DUMMY_EVENTS = [
  {
    id: '1',
    title: 'Tech Conference 2025',
    description: 'Join us for the biggest tech conference of the year! Featuring keynote speakers from leading tech companies, workshops on the latest technologies, and networking opportunities.',
    location: 'San Francisco Convention Center',
    category: 'Conference',
    start_date: addDays(new Date(), 30).toISOString(),
    end_date: addDays(new Date(), 32).toISOString(),
    image_url: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    organizer_id: '123',
    max_participants: 500,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Summer Music Festival',
    description: 'A three-day music festival featuring top artists from around the world. Experience amazing performances, food vendors, and art installations.',
    location: 'Central Park, New York',
    category: 'Concert',
    start_date: addDays(new Date(), 45).toISOString(),
    end_date: addDays(new Date(), 47).toISOString(),
    image_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    organizer_id: '124',
    max_participants: 10000,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Startup Networking Mixer',
    description: 'Connect with fellow entrepreneurs, investors, and industry experts. Perfect opportunity to showcase your startup and meet potential partners.',
    location: 'WeWork Downtown',
    category: 'Networking',
    start_date: addDays(new Date(), 7).toISOString(),
    end_date: addDays(new Date(), 7).toISOString(),
    image_url: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg',
    organizer_id: '125',
    max_participants: 100,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Charity Run for Education',
    description: 'Join our annual charity run to support education initiatives. Choose between 5K, 10K, or half marathon distances. All proceeds go to local schools.',
    location: 'Riverside Park',
    category: 'Charity',
    start_date: addDays(new Date(), 14).toISOString(),
    end_date: addDays(new Date(), 14).toISOString(),
    image_url: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    organizer_id: '126',
    max_participants: 1000,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Art Exhibition: Future Cities',
    description: 'Experience stunning artworks from contemporary artists exploring their vision of future cities. Features paintings, sculptures, and digital art.',
    location: 'Modern Art Gallery',
    category: 'Exhibition',
    start_date: addDays(new Date(), 3).toISOString(),
    end_date: addDays(new Date(), 21).toISOString(),
    image_url: 'https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg',
    organizer_id: '127',
    max_participants: null,
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    title: 'Web Development Workshop',
    description: 'Learn the latest web development technologies in this hands-on workshop. Perfect for beginners and intermediate developers.',
    location: 'Online',
    category: 'Workshop',
    start_date: addDays(new Date(), 5).toISOString(),
    end_date: addDays(new Date(), 5).toISOString(),
    image_url: 'https://images.pexels.com/photos/574069/pexels-photo-574069.jpeg',
    organizer_id: '128',
    max_participants: 50,
    created_at: new Date().toISOString()
  }
];

// Dummy data for users/profiles
const DUMMY_PROFILES = [
  {
    id: '123',
    full_name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    bio: 'Tech conference organizer with 10+ years of experience',
    updated_at: new Date().toISOString()
  },
  {
    id: '124',
    full_name: 'Michael Chen',
    email: 'michael@example.com',
    avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    bio: 'Music festival promoter and artist manager',
    updated_at: new Date().toISOString()
  },
  {
    id: '125',
    full_name: 'Emily Rodriguez',
    email: 'emily@example.com',
    avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    bio: 'Startup community leader and mentor',
    updated_at: new Date().toISOString()
  }
];

export default function EventList({ 
  searchParams 
}: { 
  searchParams?: { 
    q?: string; 
    category?: string; 
    location?: string; 
    date?: string;
  } 
}) {
  const { supabase } = useSupabase();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        
        // For demonstration, we'll use dummy data instead of actual Supabase queries
        let filteredEvents = [...DUMMY_EVENTS];

        // Apply filters if they exist
        if (searchParams?.q) {
          const searchTerm = searchParams.q.toLowerCase();
          filteredEvents = filteredEvents.filter(event => 
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm)
          );
        }

        if (searchParams?.category && searchParams.category !== 'All Categories') {
          filteredEvents = filteredEvents.filter(event => 
            event.category === searchParams.category
          );
        }

        if (searchParams?.location) {
          const locationTerm = searchParams.location.toLowerCase();
          filteredEvents = filteredEvents.filter(event => 
            event.location.toLowerCase().includes(locationTerm)
          );
        }

        if (searchParams?.date) {
          const filterDate = startOfDay(parseISO(searchParams.date));
          const nextDay = addDays(filterDate, 1);
          
          filteredEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate >= filterDate && eventDate < nextDay;
          });
        }

        setEvents(filteredEvents);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [searchParams]);

  if (error) {
    return <div>Failed to load events</div>;
  }

  if (loading) {
    return (
      <div className="gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 w-full rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
        <h3 className="text-xl font-medium mb-2">No events found</h3>
        <p className="text-muted-foreground mb-4">
          {searchParams?.q || searchParams?.category || searchParams?.location || searchParams?.date
            ? "Try adjusting your search filters"
            : "Be the first to create an event!"
          }
        </p>
      </div>
    );
  }

  return (
      <div className="py-1 flex flex-col gap-5">
        <SearchFilter/>
      {events.map((event) => (
        <EventCard key={event.id} event={event}/>
      ))}
    </div>
  );
}