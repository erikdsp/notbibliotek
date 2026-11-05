import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PdfPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: Blob | null;
  isLoading: boolean;
  error: Error | null;
};

export function PdfPreviewDialog({
  open,
  onOpenChange,
  file,
  isLoading,
  error,
}: PdfPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95vh] w-[95vw] sm:max-w-none flex-col">
        <DialogHeader>
          <DialogTitle>PDF Preview</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p>Loading PDF...</p>
        ) : error ? (
          <p>Failed to load PDF: {error.message}</p>
        ) : file ? (
          <PdfViewer file={file} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PdfViewer({ file }: { file: Blob }) {
  const setIframeRef = useCallback(
    (iframe: HTMLIFrameElement | null) => {
      if (!iframe) return;

      const url = URL.createObjectURL(file);
      iframe.src = url;

      return () => {
        iframe.removeAttribute("src");
        URL.revokeObjectURL(url);
      };
    },
    [file],
  );

  return (
    <iframe
      ref={setIframeRef}
      title="PDF Preview"
      className="min-h-0 w-full flex-1"
    />
  );
}
