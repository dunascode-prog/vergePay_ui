"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/components/app-data";
import { ErrorNote, StepHeader } from "@/components/money/parts";
import { primaryButton } from "@/components/security/TwoFactorStep";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { removeProfilePhoto, uploadProfilePhoto } from "@/services/profile";

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png"];

/** The checks the API makes, before anything is sent. */
export function photoProblem(file: File): string | null {
  if (!TYPES.includes(file.type)) return "Choose a JPG or PNG photo.";
  if (file.size > MAX_BYTES) return `That photo is ${(file.size / 1024 / 1024).toFixed(1)} MB. Choose one under 2 MB.`;
  return null;
}

/**
 * The round photo on the profile, with a camera button that opens a dialog:
 * choose a JPG or PNG (2 MB at most), see it as it will look, then save.
 * The API crops it to a square and keeps a 512 px copy.
 */
export function ProfilePhoto({ photoUrl, initials }: { photoUrl: string | null; initials: string }) {
  const { reloadUser } = useAppData();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "remove" | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // the preview link for the chosen file, released when replaced
  const pick = (next: File | null) => {
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return next ? URL.createObjectURL(next) : null;
    });
    setFile(next);
  };

  // opening starts afresh; closing releases the preview
  const onOpenChange = (o: boolean) => {
    setOpen(o);
    pick(null);
    setError(null);
  };

  const choose = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = ""; // choosing the same file again still fires
    if (!picked) return;
    const problem = photoProblem(picked);
    setError(problem);
    if (!problem) pick(picked);
  };

  const save = async () => {
    if (!file) return;
    setBusy("save");
    setError(null);
    try {
      await uploadProfilePhoto(file);
      await reloadUser();
      toast.success("Your photo is updated.");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't upload that photo. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy("remove");
    setError(null);
    try {
      await removeProfilePhoto();
      await reloadUser();
      toast.success("Your photo is removed.");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't remove your photo. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const shown = file ? preview : photoUrl;

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        aria-label={photoUrl ? "Change profile photo" : "Add a profile photo"}
        className="group relative size-16 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        <Circle src={photoUrl} initials={initials} className="size-16 text-lg" />
        <span className="absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full border-2 border-card bg-emerald-700 text-white shadow-sm transition-colors group-hover:bg-emerald-800">
          <Camera className="size-3.5" aria-hidden />
        </span>
      </button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <div className="space-y-5">
            <StepHeader title="Profile photo" subtitle="Only you see it, on your profile and in the menu." />

            <div className="flex justify-center">
              <Circle src={shown} initials={initials} className="size-40 text-4xl ring-4 ring-muted" />
            </div>

            <input ref={input} type="file" accept="image/jpeg,image/png" className="sr-only" aria-label="Choose a photo" onChange={choose} tabIndex={-1} />

            <p className="text-center text-xs text-muted-foreground">
              JPG or PNG, up to 2 MB. We crop it to a square and remove location and camera details.
            </p>

            {error && <ErrorNote>{error}</ErrorNote>}

            <div className="space-y-2">
              {file ? (
                <>
                  <Button onClick={save} disabled={busy !== null} className={primaryButton}>
                    {busy === "save" ? "Uploading…" : "Save photo"}
                  </Button>
                  <Button variant="ghost" className="h-10 w-full" onClick={() => input.current?.click()} disabled={busy !== null}>
                    Choose a different photo
                  </Button>
                </>
              ) : (
                <Button onClick={() => input.current?.click()} disabled={busy !== null} className={primaryButton}>
                  <ImagePlus className="size-4" /> {photoUrl ? "Choose a new photo" : "Choose a photo"}
                </Button>
              )}
              {photoUrl && !file && (
                <Button variant="ghost" className="h-10 w-full text-destructive hover:text-destructive" onClick={remove} disabled={busy !== null}>
                  <Trash2 className="size-4" /> {busy === "remove" ? "Removing…" : "Remove photo"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** A round photo, or the initials when there's none (or it fails to load). */
export function Circle({ src, initials, className }: { src: string | null; initials: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const showPhoto = src && failed !== src;
  return (
    <span
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
        className,
      )}
    >
      {showPhoto ? (
        // a signed S3 link: next/image would need the bucket host configured, and the file is already 512 px
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" onError={() => setFailed(src)} />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}
