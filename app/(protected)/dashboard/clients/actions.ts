"use server";

import { revalidatePath } from "next/cache";
import { createClient, CreateClientInput } from "@/data/mock-clients";
import { ClientProfile } from "@/types/client";

export async function createClientAction(input: CreateClientInput): Promise<ClientProfile> {
  const client = await createClient(input);
  revalidatePath("/dashboard/clients");
  return client;
}
