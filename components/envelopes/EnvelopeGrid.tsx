"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeCard } from "./EnvelopeCard";
import { AddEnvelopeDialog } from "./AddEnvelopeDialog";
import { Envelope, EnvelopeView } from "@/types/envelope";
import { addFundsAction, withdrawAction, createEnvelopeAction } from "@/app/(protected)/dashboard/envelopes/actions";

interface EnvelopeGridProps {
  envelopes: EnvelopeView[];
}

export function EnvelopeGrid({ envelopes: initialEnvelopes }: EnvelopeGridProps) {
  const router = useRouter();
  const [envelopes, setEnvelopes] = useState(initialEnvelopes);

  const existingLinkedCategories = envelopes
    .map((e) => e.linkedCategory)
    .filter((c): c is NonNullable<typeof c> => c !== null);

  function handleCreated(envelope: Envelope) {
    setEnvelopes((prev) => [...prev, { ...envelope, spent: 0, remaining: envelope.allocated, isOverBudget: false }]);
    router.refresh();
  }

  async function handleAddFunds(envelopeId: string, amount: number) {
    await addFundsAction(envelopeId, amount);
    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === envelopeId
          ? { ...e, allocated: e.allocated + amount, remaining: e.remaining + amount, isOverBudget: e.spent > e.allocated + amount }
          : e
      )
    );
    router.refresh();
  }

  async function handleWithdraw(envelopeId: string, amount: number, note: string) {
    await withdrawAction(envelopeId, amount, note);
    setEnvelopes((prev) =>
      prev.map((e) =>
        e.id === envelopeId
          ? { ...e, spent: e.spent + amount, remaining: e.remaining - amount, isOverBudget: e.spent + amount > e.allocated }
          : e
      )
    );
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddEnvelopeDialog
          onCreate={createEnvelopeAction}
          onCreated={handleCreated}
          existingLinkedCategories={existingLinkedCategories}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {envelopes.map((envelope) => (
          <EnvelopeCard
            key={envelope.id}
            envelope={envelope}
            onAddFunds={handleAddFunds}
            onWithdraw={handleWithdraw}
          />
        ))}
      </div>
    </div>
  );
}
