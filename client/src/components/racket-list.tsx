import React, { useMemo } from "react";
import { Racket } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateUsageMinutesByRacketId } from "@/utils/equipment-helpers";
import { Activity } from "@shared/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RacketListProps {
  rackets: Racket[];
  activities?: Activity[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onToggleBroken: (id: string, isBroken: boolean) => void;
  onUploadImage: (id: string, imageUrl: string) => void;
}

export default function RacketList({ rackets, activities = [], onToggleActive, onToggleBroken, onUploadImage }: RacketListProps) {
  const sorted = [...rackets].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    if (a.isBroken !== b.isBroken) return a.isBroken ? 1 : -1;
    return (a.brand + a.model).localeCompare(b.brand + b.model);
  });

  const minutesById = useMemo(() => calculateUsageMinutesByRacketId(rackets, activities), [rackets, activities]);

  return (
    <section className="p-4">
      <h3 className="text-sm font-medium mb-3">Rackets</h3>
      <div className="space-y-2">
        {sorted.map((r) => (
          <Popover key={r.id}>
            <PopoverTrigger asChild>
              <button className="w-full text-left">
                <div className="flex items-center justify-between p-3 rounded-md border border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-sm">{r.brand} {r.model}</div>
                    {r.isActive && <Badge variant="default">Active</Badge>}
                    {!r.isActive && <Badge variant="secondary">Inactive</Badge>}
                    {r.isBroken && <Badge variant="destructive">Broken</Badge>}
                    <div className="text-xs text-gray-600">
                      {Math.round(((minutesById[r.id] || 0) / 60) * 10) / 10}h
                    </div>
                  </div>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium">{r.brand} {r.model}</div>
                  <div className="text-xs text-gray-600">Usage: {Math.round(((minutesById[r.id] || 0) / 60) * 10) / 10} hours</div>
                  <div className="mt-1 flex gap-2">
                    {r.isActive && <Badge variant="default">Active</Badge>}
                    {!r.isActive && <Badge variant="secondary">Inactive</Badge>}
                    {r.isBroken && <Badge variant="destructive">Broken</Badge>}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-gray-700">Photo</div>
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt={`${r.brand} ${r.model}`} className="w-full h-32 object-cover rounded" />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">No image</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const dataUrl = reader.result as string;
                        onUploadImage(r.id, dataUrl);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onToggleActive(r.id, !r.isActive)} data-testid={`racket-popover-toggle-active-${r.id}`}>
                    {r.isActive ? "Set Inactive" : "Set Active"}
                  </Button>
                  <Button size="sm" variant={r.isBroken ? "secondary" : "destructive"} onClick={() => onToggleBroken(r.id, !r.isBroken)} data-testid={`racket-popover-toggle-broken-${r.id}`}>
                    {r.isBroken ? "Unmark Broken" : "Mark Broken"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </section>
  );
}


