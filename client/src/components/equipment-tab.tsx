import React from "react";
import { useRackets } from "@/hooks/use-equipment";
import RacketList from "@/components/racket-list";
import AddRacketForm from "@/components/add-racket-form";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";

export default function EquipmentTab() {
  const { rackets, isLoading, updateRacket } = useRackets();
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({ queryKey: ["/api/activities"] });

  // Adding equipment is now handled via dedicated page

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateRacket.mutateAsync({ id, update: { isActive } });
  };

  const handleToggleBroken = async (id: string, isBroken: boolean) => {
    // When marking broken, also set inactive
    const update: any = { isBroken };
    if (isBroken) update.isActive = false;
    await updateRacket.mutateAsync({ id, update });
  };

  const handleUploadImage = async (id: string, imageUrl: string) => {
    await updateRacket.mutateAsync({ id, update: { imageUrl } });
  };

  const loading = isLoading || activitiesLoading;
  if (loading) {
    return (
      <section className="p-4">
        <h3 className="text-medium font-medium mb-3">Equipment</h3>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <AddRacketForm />
      <RacketList
        rackets={rackets}
        activities={activities}
        onToggleActive={handleToggleActive}
        onToggleBroken={handleToggleBroken}
        onUploadImage={handleUploadImage}
      />
    </section>
  );
}


