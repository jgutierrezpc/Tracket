import React, { useState } from "react";
import { Racket } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BrokenRacketsProps {
  rackets: Racket[];
  onUpdate: (id: string, update: Partial<Racket>) => Promise<void> | void;
  onReactivate: (id: string) => Promise<void> | void;
}

export default function BrokenRackets({ rackets, onUpdate, onReactivate }: BrokenRacketsProps) {
  const broken = rackets.filter((r) => r.isBroken);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const handleFileChange = async (id: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await onUpdate(id, { imageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  if (broken.length === 0) {
    return null;
  }

  return (
    <section className="p-4">
      <h3 className="text-medium font-medium mb-3">Broken Rackets</h3>
      <div className="space-y-4">
        {broken.map((r) => (
          <div key={r.id} className="rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{r.brand} {r.model}</div>
              <Button size="sm" variant="outline" onClick={() => onReactivate(r.id)} data-testid={`broken-reactivate-${r.id}`}>Reactivate</Button>
            </div>
            {r.imageUrl ? (
              <img src={r.imageUrl} alt={`${r.brand} ${r.model}`} className="w-full max-h-48 object-contain rounded mb-2" />
            ) : (
              <div className="mb-2">
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(r.id, e.target.files?.[0] || null)} data-testid={`broken-upload-${r.id}`} />
              </div>
            )}
            <div className="space-y-2">
              <Textarea
                placeholder="Add notes about the breakage..."
                value={notesDraft[r.id] ?? (r.notes || "")}
                onChange={(e) => setNotesDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                data-testid={`broken-notes-${r.id}`}
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={() => onUpdate(r.id, { notes: notesDraft[r.id] ?? r.notes })} data-testid={`broken-save-notes-${r.id}`}>
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


