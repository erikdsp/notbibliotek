import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { EditableInstrument } from "@/features/admin/types/instrument-editor-types";
import type { Instrument } from "@/core/types";

type InstrumentEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingInstrument: EditableInstrument | null;
  instruments: Instrument[];
};

export function InstrumentEditor({
  open,
  onOpenChange,
  editingInstrument,
  instruments,
}: InstrumentEditorProps) {
  const originalName = editingInstrument?.name ?? "";
  const originalKey = editingInstrument?.key ?? "";
  const isEditing = editingInstrument !== null;
  const [name, setName] = useState(originalName);
  const [key, setKey] = useState(originalKey);
  const [keyEdited, setKeyEdited] = useState(isEditing);

  const instrumentKeys = new Set(instruments.map((i) => i.key));
  const isDirty = name !== originalName || key !== originalKey;
  const keyIsUnique = key === originalKey || !instrumentKeys.has(key);
  const isValid =
    name.trim().length > 0 && key.trim().length > 0 && keyIsUnique;

  function nameToKey(name: string) {
    return name.replace(/\s+/g, "").toLowerCase();
  }

  function handleSetName(newName: string) {
    setName(newName);
  }

  function handleSetKey(newKey: string) {
    setKey(newKey);
    setKeyEdited(true);
  }

  useEffect(() => {
    if (keyEdited) return;

    const timeoutMs = 700;
    const timeout = setTimeout(() => {
      setKey(nameToKey(name));
    }, timeoutMs);

    return () => clearTimeout(timeout);
  }, [name, keyEdited]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isDirty || !isValid) return;

    console.log("Create Instrument with Name: ", name.trim(), " and Key: ", key.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Instrument" : "Add Instrument"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? "Edit an existing instrument" : "Add a new instrument"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                value={name}
                placeholder="Instrument name"
                onChange={(event) => handleSetName(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="key">Key</FieldLabel>
              <Input
                id="key"
                value={key}
                placeholder="Unique instrument key"
                onChange={(event) => handleSetKey(event.target.value)}
                aria-invalid={!keyIsUnique}
              />
              {!keyIsUnique && (
                <p className="text-sm text-destructive">
                  There already exists an instrument with this key.
                </p>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || !isValid}>
              {isEditing ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
