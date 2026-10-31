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

type InstrumentFormData = {
  key: string;
  name: string;
}

type InstrumentEditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingInstrument: InstrumentFormData | null;
}


export function InstrumentEditor({
  open,
  onOpenChange,
  editingInstrument,
}: InstrumentEditorProps) {
  const [name, setName] = useState(editingInstrument?.name ?? "");
  const [key, setKey] = useState(editingInstrument?.key ?? "");
  const [keyEdited, setKeyEdited] = useState(false);

  const isEditing = editingInstrument !== null;


  function nameToKey(name: string) {
    return name.replace(/\s+/g, "")
    .toLowerCase()
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

    console.log("Create Instrument with Name: ", name, " and Key: ", key)
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
                onChange={(event) => handleSetName(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="name">Key</FieldLabel>
              <Input
                id="key"
                value={key}
                onChange={(event) => handleSetKey(event.target.value)}
              />
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
            <Button type="submit">{isEditing ? "Save Changes" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
