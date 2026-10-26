export type Instrument = {
  id: string;
  key: string;
  name: string;
};

export type PartInstruments = {
  part_id: string;
  instruments: Instrument[];
};
