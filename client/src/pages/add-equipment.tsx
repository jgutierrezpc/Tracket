import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigation } from "@/hooks/use-navigation";
import { useRackets } from "@/hooks/use-equipment";
import { ChevronLeft } from "lucide-react";

export default function AddEquipment() {
  const { navigate } = useNavigation();
  const { createRacket } = useRackets();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const canSubmit = brand.trim() !== "" && model.trim() !== "";

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-lg">
      <header className="bg-white text-black p-2 sticky top-0 z-30 border-gray-200">
        <div className="relative flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            onClick={() => navigate('profile')}
            className="absolute left-2 top-1/2 -translate-y-1/2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Add Equipment</h1>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;
            await createRacket.mutateAsync({ brand: brand.trim(), model: model.trim() });
            navigate('profile');
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <Input placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} data-testid="input-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <Input placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} data-testid="input-model" />
          </div>
          <Button type="submit" className="w-full" disabled={!canSubmit} data-testid="button-add-equipment">Add Equipment</Button>
        </form>
      </main>
    </div>
  );
}


