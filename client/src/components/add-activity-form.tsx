import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertActivitySchema, InsertActivity } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { z } from "zod";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlacesAutocomplete, type PlaceDetails } from "@/components/ui/places-autocomplete";

const formSchema = insertActivitySchema.extend({
  date: z.string().min(1, "Date is required"),
});

type FormData = z.infer<typeof formSchema>;

interface AddActivityFormProps {
  onClose: () => void;
}

export default function AddActivityForm({ onClose }: AddActivityFormProps) {
  const [selectedSport, setSelectedSport] = useState<string>("padel");
  const [sessionRating, setSessionRating] = useState<number>(0);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      sport: "padel",
      activityType: "friendly",
      duration: 90,
      sessionRating: null,
      clubName: "",
      clubLocation: "",
      clubMapLink: "",
      racket: "",
      partner: "",
      opponents: "",
      notes: "",
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: InsertActivity) => {
      return await apiRequest('POST', '/api/activities', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities/stats/overview'] });
      toast({
        title: "Activity added",
        description: "Your activity has been successfully recorded.",
      });
      onClose();
      form.reset();
      setSessionRating(0);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlaceSelect = (place: PlaceDetails) => {
    console.log('Form handlePlaceSelect called with:', place);
    setSelectedPlace(place);
    form.setValue("clubName", place.name);
    form.setValue("clubLocation", place.formatted_address);
    form.setValue("clubLatitude", place.geometry.location.lat.toString());
    form.setValue("clubLongitude", place.geometry.location.lng.toString());
    console.log('Form values updated - clubName:', place.name);
  };

  const onSubmit = (data: FormData) => {
    const activityData: InsertActivity = {
      ...data,
      sport: selectedSport,
      sessionRating: sessionRating > 0 ? sessionRating : null,
      clubName: selectedPlace?.name || data.clubName || null,
      clubLocation: selectedPlace?.formatted_address || data.clubLocation || null,
      clubLatitude: selectedPlace?.geometry.location.lat.toString() || data.clubLatitude || null,
      clubLongitude: selectedPlace?.geometry.location.lng.toString() || data.clubLongitude || null,
      clubMapLink: data.clubMapLink || null,
      racket: data.racket || null,
      partner: data.partner || null,
      opponents: data.opponents || null,
      notes: data.notes || null,
    };
    createActivityMutation.mutate(activityData);
  };

  const sports = [
    { id: 'padel', name: 'Padel', icon: '🔵' },
    { id: 'tennis', name: 'Tennis', icon: '🟢' },
    { id: 'pickleball', name: 'Pickleball', icon: '🟡' },
  ];

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col">
      {/* Hidden accessibility elements */}
      <DialogTitle className="sr-only">Add New Activity</DialogTitle>
      <DialogDescription className="sr-only">
        Add a new padel, tennis, or pickleball activity with details like duration, racket, and club information.
      </DialogDescription>
      
      {/* Handle */}
      <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6 flex-shrink-0"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 flex-shrink-0">
        <h2 className="text-xl font-medium">Add Activity</h2>
      </div>

      {/* Scrollable Form Container */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 pb-6">
          
          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...form.register("date")}
              data-testid="input-date"
            />
            {form.formState.errors.date && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.date.message}</p>
            )}
          </div>

          {/* Sport Selection */}
          <div>
            <Label>Sport</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {sports.map(sport => (
                <Button
                  key={sport.id}
                  type="button"
                  variant={selectedSport === sport.id ? "default" : "outline"}
                  className={`p-3 h-auto flex flex-col ${
                    selectedSport === sport.id 
                      ? 'bg-primary text-white border-primary' 
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => {
                    setSelectedSport(sport.id);
                    form.setValue("sport", sport.id);
                  }}
                  data-testid={`sport-${sport.id}`}
                >
                  <div className="text-lg mb-1">{sport.icon}</div>
                  <div className="text-sm">{sport.name}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Activity Type */}
          <div>
            <Label htmlFor="activityType">Activity Type</Label>
            <Select 
              onValueChange={(value) => form.setValue("activityType", value)}
              defaultValue="friendly"
            >
              <SelectTrigger data-testid="select-activity-type">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="friendly">Friendly Match</SelectItem>
                <SelectItem value="tournament">Tournament</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="90"
              min="1"
              max="300"
              {...form.register("duration", { valueAsNumber: true })}
              data-testid="input-duration"
            />
            {form.formState.errors.duration && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.duration.message}</p>
            )}
          </div>

          {/* Racket */}
          <div>
            <Label htmlFor="racket">Racket Brand/Model (Optional)</Label>
            <Input
              id="racket"
              placeholder="Wilson Bela Elite V2.5"
              {...form.register("racket")}
              data-testid="input-racket"
            />
          </div>

          {/* Club/Venue Search */}
          <div>
            <Label htmlFor="clubName">Club/Venue (Optional)</Label>
            <PlacesAutocomplete
              onPlaceSelect={handlePlaceSelect}
              placeholder="Search for a venue..."
              value={selectedPlace?.name || form.watch("clubName") || ""}
              onChange={(value) => {
                console.log('PlacesAutocomplete onChange called with:', value);
                form.setValue("clubName", value);
              }}
            />
            {selectedPlace && (
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="text-sm text-green-800 dark:text-green-200">
                  <div className="font-medium">{selectedPlace.name}</div>
                  <div className="text-xs mt-1">{selectedPlace.formatted_address}</div>
                </div>
              </div>
            )}
          </div>

          {/* Partner */}
          <div>
            <Label htmlFor="partner">Partner (Optional)</Label>
            <Input
              id="partner"
              placeholder="Partner name"
              {...form.register("partner")}
              data-testid="input-partner"
            />
          </div>

          {/* Opponents */}
          <div>
            <Label htmlFor="opponents">Opponents (Optional)</Label>
            <Input
              id="opponents"
              placeholder="Opponent names"
              {...form.register("opponents")}
              data-testid="input-opponents"
            />
          </div>

          {/* Session Rating */}
          <div>
            <Label>Session Rating</Label>
            <div className="flex space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <Button
                  key={rating}
                  type="button"
                  variant={sessionRating >= rating ? "default" : "outline"}
                  size="icon"
                  className={`w-12 h-12 ${
                    sessionRating >= rating 
                      ? 'bg-yellow-400 border-yellow-400 text-white hover:bg-yellow-500' 
                      : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-yellow-400 hover:text-yellow-400'
                  }`}
                  onClick={() => setSessionRating(rating)}
                  data-testid={`rating-${rating}`}
                >
                  ⭐
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about your session..."
              rows={3}
              className="resize-none"
              {...form.register("notes")}
              data-testid="textarea-notes"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-blue-700 transition-colors mt-6"
            disabled={createActivityMutation.isPending}
            data-testid="button-submit-activity"
          >
            {createActivityMutation.isPending ? "Adding..." : "Add Activity"}
          </Button>
        </form>
      </div>
    </div>
  );
}