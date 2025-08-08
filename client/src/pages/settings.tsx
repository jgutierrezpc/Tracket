import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigation } from "@/hooks/use-navigation";

export default function Settings() {
  const { navigate } = useNavigation();
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
          <h1 className="text-lg font-medium">Settings</h1>
        </div>
      </header>
      <main className="px-2 flex-1 overflow-y-auto p-4">
        <p className="text-sm text-gray-600">Coming soon…</p>
      </main>
    </div>
  );
}


