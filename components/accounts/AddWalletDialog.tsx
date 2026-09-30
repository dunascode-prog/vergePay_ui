"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateWalletForm } from "@/components/accounts/CreateWalletForm";
import { walletName } from "@/lib/ledger";
import { AccountPurpose } from "@/types/account";

const WHY: Record<AccountPurpose, string> = {
  personal: "Keep your own spending apart from your business money.",
  business: "Receive client payments and track business expenses separately.",
};

/** Adds the customer's other wallet. `trigger` is the element that opens it (Base UI render prop). */
export function AddWalletDialog({ purpose, trigger }: { purpose: AccountPurpose; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a {walletName(purpose).toLowerCase()}</DialogTitle>
          <DialogDescription>{WHY[purpose]} It gets its own account number and starts at zero.</DialogDescription>
        </DialogHeader>
        {/* remounts each time it opens, so a fresh Idempotency-Key per attempt */}
        {open && (
          <CreateWalletForm
            purpose={purpose}
            submitLabel={`Add ${walletName(purpose).toLowerCase()}`}
            onCreated={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
