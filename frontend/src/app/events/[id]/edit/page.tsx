"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar,
  CalendarClock,
  CalendarPlus,
  ChevronLeft,
  ImageIcon,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSupabase } from "@/components/supabase-provider";
import Link from "next/link";
import { toast } from "sonner";

// Event categories
const EVENT_CATEGORIES = [
  "Conference",
  "Workshop",
  "Networking",
  "Party",
  "Concert",
  "Exhibition",
  "Sports",
  "Community",
  "Charity",
  "Other",
];

const formSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters long" }),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters long" }),
    location: z.string().min(3, { message: "Location is required" }),
    category: z.string({
      required_error: "Please select a category",
    }),
    image_url: z.string().url().optional().or(z.literal("")),
    start_date: z.date({
      required_error: "Start date is required",
    }),
    end_date: z.date({
      required_error: "End date is required",
    }),
    max_participants: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { supabase, user, loading } = useSupabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "",
      image_url: "",
      start_date: undefined,
      end_date: undefined,
      max_participants: undefined,
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
  }, [loading, user, router]);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);

        const { data: event, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (error) {
          throw error;
        }

        if (!event) {
          router.push("/events");
          return;
        }

        // Check if user is the organizer
        if (user && event.organizer_id !== user.id) {
          toast("Unauthorized", {
            description: "You don't have permission to edit this event",
          });
          router.push(`/events/${eventId}`);
          return;
        }

        // Format the data for the form
        form.reset({
          title: event.title,
          description: event.description,
          location: event.location,
          category: event.category,
          image_url: event.image_url || "",
          start_date: new Date(event.start_date),
          end_date: new Date(event.end_date),
          max_participants: event.max_participants || undefined,
        });
      } catch (error: any) {
        toast("Error", {
          description: error.message || "Failed to load event data",
        });
        router.push("/events");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId && user) {
      fetchEvent();
    }
  }, [eventId, supabase, user, router, form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast("Authentication required", {
        description: "You need to be logged in to edit an event",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Update the event in the database
      const { error } = await supabase
        .from("events")
        .update({
          title: values.title,
          description: values.description,
          location: values.location,
          category: values.category,
          image_url: values.image_url || null,
          start_date: values.start_date.toISOString(),
          end_date: values.end_date.toISOString(),
          max_participants: values.max_participants || null,
        })
        .eq("id", eventId);

      if (error) {
        throw error;
      }

      toast("Event updated", {
        description: "Your event has been successfully updated",
      });

      // Navigate to the event page
      router.push(`/events/${eventId}`);
    } catch (error: any) {
      toast("Error", {
        description: error.message || "Failed to update the event",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
              <CalendarPlus className="h-7 w-7" />
              <span>Edit Event</span>
            </h1>
            <p className="text-muted-foreground">Loading event data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={`/events/${eventId}`}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Event
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <CalendarPlus className="h-7 w-7" />
            <span>Edit Event</span>
          </h1>
          <p className="text-muted-foreground">
            Update the details of your event
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Summer Tech Conference 2023"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Give your event a catchy and descriptive title.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event details, agenda, and what attendees can expect..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of your event to attract
                      participants.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EVENT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the category that best fits your event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <MapPin className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                          <Input
                            placeholder="123 Main St, City, Country or Online"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Physical address or specify "Online" for virtual events.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date and Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP p")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When does your event start?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date and Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarClock className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP p")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When does your event end?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Image URL</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <ImageIcon className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Add an image URL for your event (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Participants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Leave empty for unlimited"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Set a limit on the number of participants (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/events/${eventId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Event"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
