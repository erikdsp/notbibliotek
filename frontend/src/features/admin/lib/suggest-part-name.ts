export function suggestPartName(filename: string): string {
  const name = filename
    .replace(/\.pdf$/i, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]/g, " ");

  const matches: { name: string; patterns: RegExp[] }[] = [
    {
      name: "Bass Clarinet",
      patterns: [
        /\bbass[\s_.-]*clarinet\b/,
        /\bbas[\s_.-]*kl(?:ar)?\b/,
        /\bbas[\s_.-]*cl(?:ar)?\b/,
      ],
    },
    {
      name: "Bass Trombone",
      patterns: [/\bbass[\s_.-]*trombone\b/, /\bbastb\b/],
    },
    {
      name: "Electric Bass",
      patterns: [/\bel[\s_.-]*bass?\b/, /\belectric[\s_.-]*bass\b/],
    },
    {
      name: "Double Bass",
      patterns: [
        /\bcontrabass\b/,
        /\bdouble[\s_.-]*bass\b/,
        /\bupright[\s_.-]*bass\b/,
        /\bkontrabas\b/,
        /\bkb\b/,
        /\bbass?\b/,
      ],
    },
    {
      name: "Alto Flute",
      patterns: [
        /\balto[\s_.-]*flute\b/,
        /\balto[\s_.-]*flauta\b/,
        /\balt[\s_.-]*fl\b/,
        /\baltflojt\b/,
      ],
    },
    {
      name: "Flute 1",
      patterns: [/\bflute[\s_.-]*(?:1|i)\b/, /\bfl[\s_.-]*(?:1|i)\b/],
    },
    {
      name: "Flute 2",
      patterns: [/\bflute[\s_.-]*(?:2|ii)\b/, /\bfl[\s_.-]*(?:2|ii)\b/],
    },
    {
      name: "Flute",
      patterns: [/\bflute\b/, /\bfl\b/, /\btvaerfloejt\b/],
    },
    {
      name: "Violin 1",
      patterns: [
        /\bviolin[\s_-]*(?:1|i)(?=$|[\s_.-])/,
        /\bvl[\s_-]*1(?=$|[\s_.-])/,
      ],
    },
    {
      name: "Violin 2",
      patterns: [
        /\bviolin[\s_-]*(?:2|ii)(?=$|[\s_.-])/,
        /\bvl[\s_-]*2(?=$|[\s_.-])/,
      ],
    },
    {
      name: "Violin",
      patterns: [/\bviolin\b/],
    },
    {
      name: "Viola",
      patterns: [/\bviola\b/, /\bvla\b/],
    },
    {
      name: "Violoncello",
      patterns: [/\bvioloncell(?:o|i|os)\b/, /\bcello\b/, /\bvc\b/],
    },
    {
      name: "Alto Saxophone",
      patterns: [
        /\balt[\s_.-]*sax\b/,
        /\balto[\s_.-]*sax(?:ophone)?\b/,
        /\balts\b/,
        /\ba[\s.]*sax\b/,
      ],
    },
    {
      name: "Tenor Saxophone",
      patterns: [/\bten[\s_.-]*sax\b/, /\btenor[\s_.-]*sax(?:ophone)?\b/],
    },
    {
      name: "Trombone 1",
      patterns: [
        /\btrombone[\s_.-]*(?:1|i)\b/,
        /\btrb[\s_.-]*(?:1|i)\b/,
        /\btb[\s_.-]*(?:1|i)\b/,
      ],
    },
    {
      name: "Trombone 2",
      patterns: [
        /\btrombone[\s_.-]*(?:2|ii)\b/,
        /\btrb[\s_.-]*(?:2|ii)\b/,
        /\btb[\s_.-]*(?:2|ii)\b/,
      ],
    },
    {
      name: "Trombone",
      patterns: [/\btrombone\b/, /\btrb\b/, /\btb\b/],
    },
    {
      name: "Trumpet",
      patterns: [/\btrumpet\b/, /\btrp\b/, /\btp\b/],
    },
    {
      name: "Flugelhorn",
      patterns: [/\bflugelhorn\b/, /\bflug\b/],
    },
    {
      name: "Clarinet",
      patterns: [/\bclar(?:inet)?\b/, /\bkl(?:ar(?:inett)?)?\b/],
    },
    {
      name: "Electric Guitar",
      patterns: [/\belectric[\s_.-]*guitar\b/],
    },
    {
      name: "Acoustic Guitar",
      patterns: [/\bacoustic[\s_.-]*guitar\b/],
    },
    {
      name: "Jazz Guitar",
      patterns: [/\bjazz[\s_.-]*guitar\b/],
    },
    {
      name: "Guitar",
      patterns: [/\bguitar\b/, /\bgit\b/],
    },
    {
      name: "Vibraphone",
      patterns: [/\bvibraphone\b/, /\bvib\b/],
    },
    {
      name: "Marimba",
      patterns: [/\bmarimba\b/, /\bmar\b/],
    },
    {
      name: "Harmonica",
      patterns: [/\bharmonica\b/, /\bharm\b/],
    },
    {
      name: "Pan Flute",
      patterns: [/\bpan[\s_.-]*flute\b/, /\bpanfl\b/],
    },
    {
      name: "Accordion",
      patterns: [/\baccordion\b/, /\bdragspel\b/, /\bacc\b/],
    },
    {
      name: "Piccolo",
      patterns: [/\bpiccolo\b/, /\bpiccola\b/],
    },
    {
      name: "Piano",
      patterns: [/\bpiano\b/, /\bpi\b/],
    },

    {
      name: "Harp",
      patterns: [/\bharp\b/, /\bharpa\b/],
    },
    {
      name: "Snare Drum",
      patterns: [/\bsnare[\s_.-]*drum\b/],
    },
    {
      name: "Cymbals",
      patterns: [/\bcymbals\b/],
    },
    {
      name: "Tom-toms",
      patterns: [/\btom[\s_.-]*toms?\b/, /\btoms\b/],
    },
    {
      name: "Percussion",
      patterns: [/\bpercussion\b/],
    },
    {
      name: "Drums",
      patterns: [/\bdrum[\s_.-]*set\b/, /\bdrums\b/],
    },
    {
      name: "Choir",
      patterns: [/\bchoir\b/],
    },
    {
      name: "Voice",
      patterns: [/\bvoice\b/],
    },
    {
      name: "Soprano",
      patterns: [/\bsoprano\b/],
    },
    {
      name: "Alto",
      patterns: [/\balto\b/],
    },
    {
      name: "Tenor",
      patterns: [/\btenor\b/],
    },
    {
      name: "Bouzouki",
      patterns: [/\bbouzouki\b/],
    },
    {
      name: "Oud",
      patterns: [/\boud\b/],
    },
  ];

  const match = matches.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(name)),
  );

  return match?.name ?? filename.replace(/\.pdf$/i, "")
}
