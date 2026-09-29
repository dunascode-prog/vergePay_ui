"use server";

import { revalidatePath } from "next/cache";
import {
  createEnvelope,
  adjustEnvelopeAllocation,
  recordWithdrawal,
  CreateEnvelopeInput,
} from "@/data/mock-envelopes";
import { Envelope, EnvelopeTransaction } from "@/types/envelope";

export async function createEnvelopeAction(input: CreateEnvelopeInput): Promise<Envelope> {
  const envelope = await createEnvelope(input);
  revalidatePath("/dashboard/envelopes");
  return envelope;
}

export async function addFundsAction(envelopeId: string, amount: number): Promise<Envelope> {
  const envelope = await adjustEnvelopeAllocation(envelopeId, amount);
  revalidatePath("/dashboard/envelopes");
  return envelope;
}

export async function withdrawAction(
  envelopeId: string,
  amount: number,
  note: string
): Promise<EnvelopeTransaction> {
  const transaction = await recordWithdrawal(envelopeId, amount, note);
  revalidatePath("/dashboard/envelopes");
  return transaction;
}
