export const defaultInstrumentMappings: Record<string, string[]> = {
  // Brass
  trumpet: ["trumpet"],
  trombone: ["trombone"],
  trombone2: ["trombone"],
  basstrombone: ["basstrombone"],

  // Woodwinds
  flute: ["flute1", "flute2"],
  flute1: ["flute1"],
  flute2: ["flute2"],
  altoflute: ["flute2"],
  piccolo: ["flute1"],
  clarinet: ["clarinet"],
  bassclarinet: ["clarinet"],
  altosaxophone: ["altosaxophone"],
  tenorsaxophone: ["tenorsaxophone"],
  panflute: ["flute1"],

  // Strings
  violin1: ["violin1"],
  violin2: ["violin2"],
  viola: ["viola"],
  violoncello: ["violoncello"],
  violin: ["violin1", "violin2"],

  // Bass
  doublebass: ["doublebass"],
  electricbass: ["doublebass"],

  // Stringed Instruments
  acousticguitar: ["guitar"],
  electricguitar: ["guitar"],
  jazzguitar: ["guitar"],
  bouzouki: ["bouzouki"],
  oud: ["oud"],

  // Other
  accordion: ["accordion"],
  harmonica: ["harmonica"],
  harp: ["harp"],
  vibraphone: ["vibraphone", "marimba"],
  marimba: ["marimba"],
  piano: ["piano"],

  // Percussion
  percussion: ["percussion"],
  percussion2: ["percussion"],
  percussion3: ["percussion"],
  cymbals: ["percussion"],
  snaredrum: ["percussion"],
  tomtoms: ["percussion"],
  drums: ["drums", "percussion"],

  // Vocals
  voice: ["voice"],
  choir: ["voice"],
  soprano: ["voice"],
  alto: ["voice"],
  tenor: ["voice"],
};
