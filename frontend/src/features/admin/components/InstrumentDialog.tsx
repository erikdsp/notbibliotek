import { useState } from "react";
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

interface InstrumentFormData {
  key: string;
  name: string;
}

interface InstrumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingInstrument: InstrumentFormData | null;
}

const emptyForm: InstrumentFormData = {
  key: "",
  name: "",
};

export function InstrumentDialog({
  open,
  onOpenChange,
  editingInstrument,
}: InstrumentDialogProps) {
  const [formData, setFormData] = useState<InstrumentFormData>(
    editingInstrument ?? emptyForm,
  );

  const isEditing = editingInstrument !== null;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: Create or update instrument
    console.log(formData);

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
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
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
