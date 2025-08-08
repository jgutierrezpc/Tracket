import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/use-navigation";

export default function AddRacketForm() {
  const { navigate } = useNavigation();
  return (
    <div className="p-4">
      <Button className="w-full" onClick={() => navigate('addEquipment')} data-testid="button-go-add-equipment">
        Add Equipment
      </Button>
    </div>
  );
}


