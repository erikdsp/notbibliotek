type partMetaData = {
  key: string;
  name: string;
};

export function suggestPartMetadata(filename: string): partMetaData {
  const name = filename
    .replace(/\.pdf$/i, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]/g, " ");

  const matches: { key: string; name: string; patterns: RegExp[] }[] = [
    {
      key: "bassclarinet",
      name: "Bass Clarinet",
      patterns: [
        /\bbass[\s_.-]*clarinet\b/,
        /\bbas[\s_.-]*kl(?:ar)?\b/,
        /\bbas[\s_.-]*cl(?:ar)?\b/,
      ],
    },
    {
      key: "basstrombone",
      name: "Bass Trombone",
      patterns: [/\bbass[\s_.-]*trombone\b/, /\bbastb\b/],
    },
    {
      key: "electricbass",
      name: "Electric Bass",
      patterns: [/\bel[\s_.-]*bass?\b/, /\belectric[\s_.-]*bass\b/],
    },
    {
      key: "doublebass",
      name: "Double Bass",
      patterns: [
        /\bcontrabass\b/,
        /\bdouble[\s_.-]*bass\b/,
        /\bkontrabas\b/,
        /\bkb\b/,
        /\bbass?\b/,
      ],
    },
    {
      key: "altoflute",
      name: "Alto Flute",
      patterns: [
        /\balto[\s_.-]*flute\b/,
        /\balto[\s_.-]*flauta\b/,
        /\balt[\s_.-]*fl\b/,
        /\baltflojt\b/,
      ],
    },
    {
      key: "flute1",
      name: "Flute 1",
      patterns: [/\bflute[\s_.-]*(?:1|i)\b/, /\bfl[\s_.-]*(?:1|i)\b/],
    },
    {
      key: "flute2",
      name: "Flute 2",
      patterns: [/\bflute[\s_.-]*(?:2|ii)\b/, /\bfl[\s_.-]*(?:2|ii)\b/],
    },
    {
      key: "flute",
      name: "Flute",
      patterns: [/\bflute\b/, /\bfl\b/, /\btvaerfloejt\b/],
    },
    {
      key: "violin1",
      name: "Violin 1",
      patterns: [
        /\bviolin[\s_-]*(?:1|i)(?=$|[\s_.-])/,
        /\bvl[\s_-]*1(?=$|[\s_.-])/,
      ],
    },
    {
      key: "violin2",
      name: "Violin 2",
      patterns: [
        /\bviolin[\s_-]*(?:2|ii)(?=$|[\s_.-])/,
        /\bvl[\s_-]*2(?=$|[\s_.-])/,
      ],
    },
    {
      key: "violin",
      name: "Violin",
      patterns: [/\bviolin\b/],
    },
    {
      key: "viola",
      name: "Viola",
      patterns: [/\bviola\b/, /\bvla\b/],
    },
    {
      key: "violoncello",
      name: "Violoncello",
      patterns: [/\bvioloncell(?:o|i|os)\b/, /\bcello\b/, /\bvc\b/],
    },
    {
      key: "altosaxophone",
      name: "Alto Saxophone",
      patterns: [
        /\balt[\s_.-]*sax\b/,
        /\balto[\s_.-]*sax(?:ophone)?\b/,
        /\balts\b/,
        /\ba[\s.]*sax\b/,
      ],
    },
    {
      key: "tenorsaxophone",
      name: "Tenor Saxophone",
      patterns: [/\bten[\s_.-]*sax\b/, /\btenor[\s_.-]*sax(?:ophone)?\b/],
    },
    {
      key: "trombone1",
      name: "Trombone 1",
      patterns: [
        /\btrombone[\s_.-]*(?:1|i)\b/,
        /\btrb[\s_.-]*(?:1|i)\b/,
        /\btb[\s_.-]*(?:1|i)\b/,
      ],
    },
    {
      key: "trombone2",
      name: "Trombone 2",
      patterns: [
        /\btrombone[\s_.-]*(?:2|ii)\b/,
        /\btrb[\s_.-]*(?:2|ii)\b/,
        /\btb[\s_.-]*(?:2|ii)\b/,
      ],
    },
    {
      key: "trombone",
      name: "Trombone",
      patterns: [/\btrombone\b/, /\btrb\b/, /\btb\b/],
    },
    {
      key: "trumpet",
      name: "Trumpet",
      patterns: [/\btrumpet\b/, /\btrp\b/, /\btp\b/],
    },
    {
      key: "clarinet",
      name: "Clarinet",
      patterns: [/\bclar(?:inet)?\b/, /\bkl(?:ar(?:inett)?)?\b/],
    },
    {
      key: "electricguitar",
      name: "Electric Guitar",
      patterns: [/\belectric[\s_.-]*guitar\b/],
    },
    {
      key: "acousticguitar",
      name: "Acoustic Guitar",
      patterns: [/\bacoustic[\s_.-]*guitar\b/],
    },
    {
      key: "jazzguitar",
      name: "Jazz Guitar",
      patterns: [/\bjazz[\s_.-]*guitar\b/],
    },
    {
      key: "guitar",
      name: "Guitar",
      patterns: [/\bguitar\b/, /\bgit\b/],
    },
    {
      key: "vibraphone",
      name: "Vibraphone",
      patterns: [/\bvibraphone\b/, /\bvib\b/],
    },
    {
      key: "marimba",
      name: "Marimba",
      patterns: [/\bmarimba\b/, /\bmar\b/],
    },
    {
      key: "harmonica",
      name: "Harmonica",
      patterns: [/\bharmonica\b/, /\bharm\b/],
    },
    {
      key: "panflute",
      name: "Pan Flute",
      patterns: [/\bpan[\s_.-]*flute\b/, /\bpanfl\b/],
    },
    {
      key: "accordion",
      name: "Accordion",
      patterns: [/\baccordion\b/, /\bdragspel\b/, /\bacc\b/],
    },
    {
      key: "piccolo",
      name: "Piccolo",
      patterns: [/\bpiccolo\b/, /\bpiccola\b/],
    },
    {
      key: "piano",
      name: "Piano",
      patterns: [/\bpiano\b/, /\bpi\b/],
    },

    {
      key: "harp",
      name: "Harp",
      patterns: [/\bharp\b/, /\bharpa\b/],
    },
    {
      key: "snaredrum",
      name: "Snare Drum",
      patterns: [/\bsnare[\s_.-]*drum\b/],
    },
    {
      key: "cymbals",
      name: "Cymbals",
      patterns: [/\bcymbals\b/],
    },
    {
      key: "tomtoms",
      name: "Tom-toms",
      patterns: [/\btom[\s_.-]*toms?\b/, /\btoms\b/],
    },
    {
      key: "percussion",
      name: "Percussion",
      patterns: [/\bpercussion\b/],
    },
    {
      key: "drums",
      name: "Drums",
      patterns: [/\bdrum[\s_.-]*set\b/, /\bdrums\b/],
    },
    {
      key: "choir",
      name: "Choir",
      patterns: [/\bchoir\b/],
    },
    {
      key: "voice",
      name: "Voice",
      patterns: [/\bvoice\b/],
    },
    {
      key: "soprano",
      name: "Soprano",
      patterns: [/\bsoprano\b/],
    },
    {
      key: "alto",
      name: "Alto",
      patterns: [/\balto\b/],
    },
    {
      key: "tenor",
      name: "Tenor",
      patterns: [/\btenor\b/],
    },
    {
      key: "bouzouki",
      name: "Bouzouki",
      patterns: [/\bbouzouki\b/],
    },
    {
      key: "oud",
      name: "Oud",
      patterns: [/\boud\b/],
    },
  ];

  const match = matches.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(name)),
  );

  return {
    key: match?.key ?? "",
    name: match?.name ?? filename.replace(/\.pdf$/i, ""),
  };
}
