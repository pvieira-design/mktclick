"use client";

import { useState } from "react";
import { DeliverableCard } from "./deliverable-card";
import { DeliverableForm } from "./deliverable-form";
import { Button } from "@/components/base/buttons/button";
import { Plus } from "@untitledui/icons";

interface DeliverableListProps {
  videoId: string;
  deliverables: any[];
  canEdit: boolean;
  canAddMore: boolean;
  onRefresh: () => void;
}

export function DeliverableList({
  videoId,
  deliverables,
  canEdit,
  canAddMore,
  onRefresh,
}: DeliverableListProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-secondary">
          Hooks ({deliverables.length})
        </span>
        {canAddMore && (
          <Button
            size="sm"
            color="secondary"
            iconLeading={Plus}
            onClick={() => setShowForm(true)}
          >
            Adicionar Hook
          </Button>
        )}
      </div>

      {deliverables.length === 0 && !showForm && (
        <p className="text-xs text-quaternary py-2 text-center">
          Nenhum hook adicionado
        </p>
      )}

      {deliverables.map((deliverable: any) => (
        <DeliverableCard
          key={deliverable.id}
          deliverable={deliverable}
          canEdit={canEdit && !deliverable.adNumber}
          onRefresh={onRefresh}
        />
      ))}

      {showForm && (
        <DeliverableForm
          videoId={videoId}
          onClose={() => setShowForm(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
