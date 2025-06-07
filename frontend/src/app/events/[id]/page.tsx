"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  CalendarClock,
  ChevronLeft,
  Clock,
  Edit,
  MapPin,
  Share,
  Tag,
  Trash,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabase } from "@/components/supabase-provider";
import { toast } from "sonner";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { supabase, user, loading: userLoading } = useSupabase();
  const [event, setEvent] = useState<any | null>(null);
  const [organizer, setOrganizer] = useState<any | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [userParticipation, setUserParticipation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (eventError) throw eventError;
        if (!eventData) {
          router.push("/events");
          return;
        }

        setEvent(eventData);

        // Fetch organizer details
        const { data: organizerData, error: organizerError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", eventData.organizer_id)
          .single();

        if (organizerError) throw organizerError;
        setOrganizer(organizerData);

        // Fetch participation count
        const { count, error: countError } = await supabase
          .from("participants")
          .select("*", { count: "exact", head: true })
          .eq("event_id", eventId)
          .eq("status", "attending");

        if (countError) throw countError;
        setParticipantCount(count || 0);

        // Fetch participants
        const { data: participantsData, error: participantsError } =
          await supabase
            .from("participants")
            .select("user_id, status, profiles(id, full_name, avatar_url)")
            .eq("event_id", eventId)
            .eq("status", "attending")
            .order("created_at", { ascending: false })
            .limit(10);

        if (participantsError) throw participantsError;
        setParticipants(participantsData || []);

        // Check if user is participating
        if (user) {
          const { data: userParticipationData, error: userParticipationError } =
            await supabase
              .from("participants")
              .select("*")
              .eq("event_id", eventId)
              .eq("user_id", user.id)
              .single();

          if (!userParticipationError) {
            setUserParticipation(userParticipationData);
          }
        }
      } catch (error: any) {
        console.error("Error fetching event details:", error);
        toast("Error", {
          description: "Failed to load event details",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, supabase, router, user, toast]);

  // Handle join event
  const handleJoinEvent = async (status: "attending" | "interested") => {
    if (!user) {
      toast("Authentication required", {
        description: "Please sign in to join this event",
        duration: 3000,
      });
      router.push("/login");
      return;
    }

    try {
      setIsJoining(true);

      if (userParticipation) {
        // Update existing participation
        const { error } = await supabase
          .from("participants")
          .update({ status })
          .eq("id", userParticipation.id);

        if (error) throw error;
      } else {
        // Create new participation
        const { error } = await supabase.from("participants").insert({
          event_id: eventId,
          user_id: user.id,
          status,
        });

        if (error) throw error;
      }

      // Refresh user participation
      const { data, error } = await supabase
        .from("participants")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setUserParticipation(data);

      // Update participant count
      const { count, error: countError } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("status", "attending");

      if (countError) throw countError;
      setParticipantCount(count || 0);

      toast(`You're ${status} this event!`, {
        description:
          status === "attending"
            ? "You'll receive updates about this event"
            : "You've marked your interest in this event",
      });
    } catch (error: any) {
      toast("Error", {
        description: error.message || "Failed to join the event",
        duration: 3000,
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Handle leave event
  const handleLeaveEvent = async () => {
    if (!user || !userParticipation) return;

    try {
      setIsJoining(true);

      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("id", userParticipation.id);

      if (error) throw error;

      setUserParticipation(null);

      // Update participant count
      const { count, error: countError } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("status", "attending");

      if (countError) throw countError;
      setParticipantCount(count || 0);

      toast("Left event", {
        description: "You have been removed from this event",
      });
    } catch (error: any) {
      toast("Error", {
        description: error.message || "Failed to leave the event",
        duration: 3000,
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!user || !event || user.id !== event.organizer_id) return;

    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      toast("Event deleted", {
        description: "The event has been successfully deleted",
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast("Error", {
        description: error.message || "Failed to delete the event",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Share event
  const handleShareEvent = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied", {
        description: "Event link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-24 mb-8" />
        <div className="max-w-4xl mx-auto">
          <Skeleton className="aspect-[21/9] w-full rounded-xl mb-8" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex flex-wrap gap-2 mb-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-8 w-40 mb-4" />
              <Skeleton className="h-24 w-full mb-8" />
              <Skeleton className="h-8 w-40 mb-4" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg mb-4" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Link
          href="/events"
          className="flex items-center text-muted-foreground mb-8"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The event you're looking for doesn't exist or has been removed
          </p>
          <Button onClick={() => router.push("/events")}>Browse Events</Button>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const isOrganizer = user?.id === event.organizer_id;
  const isAttending = userParticipation?.status === "attending";
  const isInterested = userParticipation?.status === "interested";
  const hasReachedLimit =
    event.max_participants && participantCount >= event.max_participants;
  const spotsLeft = event.max_participants
    ? event.max_participants - participantCount
    : null;

  return (
    <div className="container mx-auto py-8 px-4">
      <Link
        href="/events"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="relative aspect-[21/9] w-full mb-8 overflow-hidden rounded-xl bg-muted">
          <Image
            src={
              event.image_url ||
              "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg"
            }
            alt={event.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleShareEvent}
            >
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            {isOrganizer && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => router.push(`/events/${eventId}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the event and remove all participant
                        registrations.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteEvent}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {event.category}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(startDate, "EEEE, MMMM d, yyyy")}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">About this event</h2>
            <div className="prose prose-sm dark:prose-invert mb-8 max-w-none">
              <p>{event.description}</p>
            </div>

            <h2 className="text-xl font-semibold mb-4">Attendees</h2>
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex -space-x-2 mr-3">
                  {participants.length > 0 ? (
                    participants.slice(0, 5).map((participant) => (
                      <Avatar
                        key={participant.user_id}
                        className="border-2 border-background"
                      >
                        <AvatarImage src={participant.profiles.avatar_url} />
                        <AvatarFallback>
                          {participant.profiles.full_name
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="text-muted-foreground">
                  {participantCount} people attending
                </span>
              </div>
              {participants.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No attendees yet. Be the first to join!
                </p>
              )}
              {event.max_participants && (
                <div className="text-sm text-muted-foreground mb-2">
                  {spotsLeft !== null && spotsLeft > 0 ? (
                    <span>
                      {spotsLeft} spots left out of {event.max_participants}
                    </span>
                  ) : (
                    <span className="text-destructive">
                      Event is at full capacity
                    </span>
                  )}
                </div>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-4">Organizer</h2>
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage src={organizer?.avatar_url} />
                <AvatarFallback>
                  {organizer?.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{organizer?.full_name}</p>
                <p className="text-sm text-muted-foreground">Organizer</p>
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Date & Time</p>
                </div>
                <div className="text-sm flex items-start gap-2">
                  <CalendarClock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p>{format(startDate, "EEEE, MMMM d, yyyy")}</p>
                    <p>
                      {format(startDate, "h:mm a")} -{" "}
                      {format(endDate, "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Location</p>
                </div>
                <div className="text-sm flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <p>{event.location}</p>
                </div>
              </div>

              {event.max_participants && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Capacity</p>
                  </div>
                  <div className="text-sm flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p>
                        {participantCount} attending out of{" "}
                        {event.max_participants}
                      </p>
                      {spotsLeft !== null && spotsLeft > 0 ? (
                        <p className="text-muted-foreground">
                          {spotsLeft} spots remaining
                        </p>
                      ) : (
                        <p className="text-destructive">No spots remaining</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!userLoading && !isOrganizer && (
                <>
                  {isAttending ? (
                    <Button
                      className="w-full mb-2"
                      onClick={handleLeaveEvent}
                      disabled={isJoining}
                    >
                      {isJoining ? "Updating..." : "You're attending"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full mb-2"
                      onClick={() => handleJoinEvent("attending")}
                      disabled={isJoining || hasReachedLimit}
                    >
                      {isJoining
                        ? "Joining..."
                        : hasReachedLimit
                          ? "Event Full"
                          : "Attend Event"}
                    </Button>
                  )}

                  {isInterested ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLeaveEvent}
                      disabled={isJoining}
                    >
                      {isJoining ? "Updating..." : "Interested"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleJoinEvent("interested")}
                      disabled={isJoining}
                    >
                      {isJoining ? "Updating..." : "Mark as interested"}
                    </Button>
                  )}
                </>
              )}

              {!userLoading && isOrganizer && (
                <div className="w-full p-3 bg-muted rounded-md text-center">
                  <User className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">You're the organizer</p>
                  <p className="text-xs text-muted-foreground">
                    You created this event
                  </p>
                </div>
              )}

              {userLoading && (
                <>
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-10 w-full" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
