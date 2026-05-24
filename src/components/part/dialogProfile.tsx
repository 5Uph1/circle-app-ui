import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";

interface dialogProps {
  userId: number | null;
  fullname: string | null;
  username: string | null;
  bio: string | null;
  photo_profile?: string | null;
  onSubmit: (e: React.FormEvent, onSuccess: () => void) => void | Promise<void>;
}

export function DialogDemo({
  userId,
  fullname,
  username,
  bio,
  photo_profile,
  onSubmit,
}: dialogProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setPreview(null);
      }}
    >
      <DialogTrigger asChild>
        {/* <button className="absolute -bottom-10 right-0 border border-gray-500 text-xs px-3 py-1 rounded-full cursor-pointer text-gray-300 hover:bg-black"> */}
        <button className="border border-gray-500 px-4 py-1 rounded-full text-sm hover:bg-gray-800 cursor-pointer">
          Edit Profile
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        {/* Form dipindah ke DALAM DialogContent */}
        <form onSubmit={(e) => onSubmit(e, () => setOpen(false))}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="my-4">
            <Field>
              <Label>Photo Profile</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden cursor-pointer border border-gray-600"
                  onClick={() => fileRef.current?.click()}
                >
                  {preview || photo_profile ? (
                    <img
                      src={preview ?? photo_profile!}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      foto
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-green-400 border border-green-400 rounded-full px-3 py-1"
                >
                  Pilih Foto
                </button>
              </div>
              <input
                ref={fileRef}
                name="photo_profile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </Field>
            <Field>
              <Label htmlFor="name-1">Name</Label>
              <Input type="hidden" name="id" defaultValue={userId || ""} />
              <Input
                id="name-1"
                name="fullname"
                defaultValue={fullname || ""}
                placeholder="Full name"
                required
              />
            </Field>
            <Field>
              <Label htmlFor="username-1">Username</Label>
              <Input
                id="username-1"
                name="username"
                defaultValue={username ? `@${username}` : ""}
                placeholder="@username"
                required
              />
            </Field>
            <Field>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                name="bio"
                defaultValue={bio || ""}
                placeholder="Tell something about you..."
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
            {/* type="submit" sekarang benar-benar trigger form di atas */}
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
