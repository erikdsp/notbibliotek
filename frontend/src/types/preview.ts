export type Preview =
  | { type: "local"; file: File; title: string }
  | { type: "saved"; fileId: string; title: string };
