const SIX = "(?:6|vi|six|ⅵ|六|٦|۶|६)";
const AND = "(?:and|&|n|y|i|e|et|und|и|і|と|和|과|와|و)";
const DIES = `(?:${[
  "dies|died|dying|death|dead|killed|kills|murdered|ending|endings|betrayal|betrays|betrayed|fate|arrested|jailed",
  "muere|murió|muerte|final|traición",
  "meurt|mort|fin|trahison",
  "stirbt|tod|ende|verrat",
  "muore|morte|tradimento",
  "morre|morreu",
  "ginie|zginął|zginie|śmierć|umiera|zakończenie|zdrada",
  "умирает|умер|умрет|смерть|концовка|предательство",
  "ölüyor|ölümü|sonu",
].join("|")})`;

const EXPLICIT_TERMS = {
  title: [
    ["gta", SIX],
    ["grand", "theft", "auto", SIX],
    ["гта", SIX],
    ["グランド", "セフト", "オート", SIX],
    ["グラセフ", SIX],
    ["侠盗猎车手", SIX],
    ["俠盜獵車手", SIX],
    ["그랜드", "테프트", "오토", SIX],
    ["جي", "تي", "[اأ]ي", SIX],
    ["جراند", "ثفت", "[اأ]وتو", SIX],
    ["जीटीए", SIX],
    ["rockstar", "(?:6|vi)"],
  ],
  characters: [
    ["jason", "duval"],
    ["lucia", "caminos"],
    ["jason", AND, "lucia"],
    ["lucia", AND, "jason"],
    ["джейсон", AND, "лю[сч]ия"],
    ["ジェイソン", AND, "ルシア"],
    ["杰森", AND, "露西亚"],
    ["제이슨", AND, "루시아"],
    ["cal", "hampton"],
    ["boobie", "ike"],
    ["dre", "quan", "priest"],
    ["real", "dimez"],
    ["raul", "bautista"],
    ["brian", "heder"],
    ["lori", "heder"],
    ["bae", "luxe"],
    ["only", "raw", "records"],
    ["wyman['’]?s", "world"],
    ["san4san"],
    ["chester['’]?s", "music"],
    ["dale['’]?s", "shopwell"],
  ],
  places: [
    ["leonida"],
    ["レオニダ"],
    ["莱昂尼达"],
    ["레오니다"],
    ["vice", "city"],
    ["вайс", "сити"],
    ["バイス", "シティ"],
    ["罪恶都市"],
    ["罪惡都市"],
    ["바이스", "시티"],
    ["port", "gellhorn"],
    ["grass", "rivers"],
    ["mount", "kalaga"],
    ["kalaga"],
    ["vice", "beach"],
    ["vice", "dale"],
    ["ekanfinaka"],
    ["leaf", "links"],
    ["vcpd"],
  ],
  spoilers: [
    ["(?:jason|lucia)", DIES],
    ["(?:джейсон|лю[сч]ия)", DIES],
  ],
};

const FRANCHISE_TERMS = {
  series: [
    ["gta(?:v|iv|o|sa|vc)?"],
    ["grand", "theft", "auto"],
    ["гта"],
    ["グラセフ"],
    ["グランド", "セフト", "オート"],
    ["侠盗猎车手"],
    ["俠盜獵車手"],
    ["그랜드", "테프트", "오토"],
    ["جي", "تي", "[اأ]ي"],
    ["जीटीए"],
  ],
  studio: [
    ["rockstar", "games"],
    ["rockstar", "north"],
    ["rockstar['’]s"],
    ["r\\*"],
    ["take", "two", "interactive"],
    ["sam", "houser"],
    ["dan", "houser"],
    ["rob", "nelson"],
    ["aaron", "garbut"],
    ["imran", "sarwar"],
    ["leslie", "benzies"],
    ["jennifer", "kolbe"],
    ["strauss", "zelnick"],
    ["lazlow"],
  ],
  insiders: [
    ["tez2"],
    ["yan2295"],
    ["videotech(?:uk)?"],
    ["cyberleek"],
    ["kiwitalkz"],
    ["lucas7yoshi"],
    ["teapotuberhacker"],
    ["arion", "kurtaj"],
    ["rockstar", "intel"],
    ["gtabase"],
    ["gtaforums"],
    ["rockstar", "mag"],
    ["rockstar", "newswire"],
  ],
  creators: [
    ["dark", "viper", "au"],
    ["mr", "boss", "ftw"],
    ["ghillie", "master"],
    ["broughy(?:1322)?"],
    ["tylarious"],
    ["speedy", "w03"],
    ["domis", "live"],
    ["techno", "gamerz"],
    ["alpha", "sniper", "97"],
    ["lord", "kebun"],
  ],
  roleplay: [
    ["nopixel"],
    ["fivem"],
    ["rage", "mp"],
    ["sa[-:]mp"],
    ["5city"],
    ["spain", "rp"],
    ["marbella", "vice"],
    ["gvmp"],
    ["flashland"],
    ["eclipse", "rp"],
    ["majestic", "rp"],
    ["arizona", "rp"],
    ["radmir", "rp"],
    ["cidade", "alta", "rp"],
    ["complexo", "rp"],
  ],
  leonida: [
    ["ambrosia"],
    ["andr[eé]s", "de", "le[oó]n"],
    ["megamundo"],
    ["stefanie", "gates"],
    ["petra", "navarro"],
    ["high", "rollerz"],
    ["dad", "bod", "squad"],
    ["ammu", "nation"],
  ],
  universe: [
    ["los", "santos"],
    ["liberty", "city"],
    ["san", "andreas"],
    ["vinewood"],
    ["blaine", "county"],
    ["niko", "bellic"],
    ["tommy", "vercetti"],
    ["trevor", "philips"],
    ["franklin", "clinton"],
    ["michael", "de", "santa"],
    ["cluckin['’]?", "bell"],
    ["burger", "shot"],
    ["sprunk"],
    ["pi(?:ß|ss)wasser"],
    ["lifeinvader"],
    ["weazel", "news"],
    ["bleeter"],
  ],
};

// Too common to block alone, so they count only on pages about GTA.
const STORY_TERMS = {
  spoilers: [
    ["endings?"],
    ["plot", "twist"],
    ["(?:final|last)", "mission"],
    ["post", "credits?"],
    ["credits", "scene"],
    ["(?:dies|died)"],
    ["(?:gets|got|was|were)", "killed"],
    ["betray(?:s|ed|al)?"],
    ["zakończeni[eau]"],
    ["(?:ostatnia|finałowa)", "misja"],
    ["(?:ginie|zginął|zginęła|zginie)"],
    ["zdrad(?:a|y|ził|ziła)"],
    ["final", "del", "juego"],
    ["(?:muere|murió)"],
    ["traici(?:ón|ona)"],
    ["(?:meurt|trahison)"],
    ["fin", "du", "jeu"],
    ["(?:stirbt|verrat)"],
    ["ende", "des", "spiels"],
    ["(?:morre|morreu|traição)"],
    ["final", "do", "jogo"],
    ["концовк[аиуе]"],
    ["(?:умирает|умер|предательство)"],
  ],
};

const SEP = "[\\s\\-_.+:'’#·•・]*";
const LETTER = "[\\p{Script=Latin}\\p{Script=Cyrillic}\\p{Script=Greek}]";
const WORD_CHAR = `(?:${LETTER}|\\p{N})`;
const START = `(?<!${WORD_CHAR})`;
const INVISIBLE = /[\u00AD\u200B-\u200D\u2060\uFEFF]/g;

const terms = (words, end) => START + words.join(SEP) + end;

const compile = (groups, end) =>
  new RegExp(
    Object.entries(groups)
      .map(
        ([name, list]) =>
          `(?<${name}>${list.map((w) => terms(w, end)).join("|")})`,
      )
      .join("|"),
    "iu",
  );

const EXPLICIT = compile(EXPLICIT_TERMS, `(?!${WORD_CHAR})`);
// Everything about the game except its name: characters, places and story.
const EXPLICIT_UNNAMED = compile(
  Object.fromEntries(
    Object.entries(EXPLICIT_TERMS).filter(([group]) => group !== "title"),
  ),
  `(?!${WORD_CHAR})`,
);
const FRANCHISE = compile(FRANCHISE_TERMS, `(?!${LETTER})`);
const STORY = compile(STORY_TERMS, `(?!${WORD_CHAR})`);

const ROCKSTAR_SOURCES = [
  /^https?:\/\/(?:www\.)?rockstargames\.com(?:[/?#]|$)/i,
  /^https?:\/\/(?:www\.|m\.)?youtube\.com\/(?:@|c\/|user\/)rockstargames(?:[/?#]|$)/i,
  /^https?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/rockstargames(?:[/?#]|$)/i,
  /^https?:\/\/(?:www\.)?(?:instagram|facebook|threads)\.(?:com|net)\/@?rockstargames(?:[/?#]|$)/i,
  /^https?:\/\/(?:www\.)?tiktok\.com\/@rockstargames(?:[/?#]|$)/i,
  /^https?:\/\/(?:www\.)?twitch\.tv\/rockstargames(?:[/?#]|$)/i,
];

// On NoVice's own repository pages, "GTA 6" is the product's name, so the name
// alone does not cover or blur them. Characters, places, story spoilers and the
// user's keywords still blur there. Issues, pull requests, commits and file
// views at a commit hash show anyone's text, so they keep full protection.
const NOVICE_PAGES =
  /^https:\/\/github\.com\/kpulka247\/novice(?:\/(?:tree|blob)\/(?:main|dev)(?:[/?#]|$)|\/?(?:[?#]|$))/i;

export const isNovicePage = (url) => NOVICE_PAGES.test(url);

// Channel links catch a creator's posts even where the card hides their name.
const CREATOR_HANDLES = [
  "darkviperau",
  "mrbossftw",
  "ghillie_?master",
  "broughy1322",
  "tylarious",
  "speedyw03",
  "domislive",
  "technogamerz(?:official)?",
  "alphasniper97",
  "lordkebun",
  "kiwitalkz",
  "videotech_?uk",
  "yan2295",
  "tezfunz2",
  "gtaseriesvideos",
  "rockstarintel",
];
const CREATOR_PAGES = new RegExp(
  `^https?://(?:[\\w-]+\\.)*(?:youtube\\.com|twitch\\.tv|kick\\.com|(?:x|twitter)\\.com|tiktok\\.com|instagram\\.com)/(?:@|c/|user/)?(${CREATOR_HANDLES.join("|")})(?:[/?#]|$)`,
  "i",
);

const KEYWORD_SPLIT = /[\s\-_.+:'’#·•・]+/u;
const escapeRegExp = (text) => text.replace(/[\\^$.*+?()[\]{}|/]/g, "\\$&");

const clean = (text) => text.normalize("NFKC").replace(INVISIBLE, "");

function decodeUrl(url) {
  try {
    return decodeURIComponent(url.replace(/\+/g, " "));
  } catch {
    return url;
  }
}

function find(regex, text, level) {
  const match = regex?.exec(text);
  if (!match) return null;
  // Naming the matched words would give away the story spoiler itself.
  const term = match.groups?.spoilers ? null : match[0].trim();
  return { level, term };
}

export function compileKeywords(keywords) {
  const phrases = keywords
    .map((keyword) =>
      clean(keyword).split(KEYWORD_SPLIT).filter(Boolean).map(escapeRegExp),
    )
    .filter((words) => words.length > 0);
  if (phrases.length === 0) return null;
  return new RegExp(
    phrases.map((words) => terms(words, `(?!${WORD_CHAR})`)).join("|"),
    "iu",
  );
}

export function findSpoiler(
  text,
  keywords = null,
  { nameAllowed = false } = {},
) {
  if (!text) return null;
  const cleaned = clean(text);
  if (nameAllowed) {
    return (
      find(EXPLICIT_UNNAMED, cleaned, "gta6") ?? find(keywords, cleaned, "gta6")
    );
  }
  return (
    find(EXPLICIT, cleaned, "gta6") ??
    find(keywords, cleaned, "gta6") ??
    find(FRANCHISE, cleaned, "franchise")
  );
}

export function findStorySpoiler(text) {
  return text ? find(STORY, clean(text), "gta6") : null;
}

export function findUrlSpoiler(
  url,
  keywords = null,
  { nameAllowed = false } = {},
) {
  if (!url) return null;
  if (nameAllowed) {
    const decoded = clean(decodeUrl(url));
    return (
      find(EXPLICIT_UNNAMED, decoded, "gta6") ?? find(keywords, decoded, "gta6")
    );
  }
  if (ROCKSTAR_SOURCES.some((source) => source.test(url))) {
    return { level: "gta6", term: "Rockstar Games" };
  }
  const decoded = clean(decodeUrl(url));
  const creator = CREATOR_PAGES.exec(url);
  return (
    find(EXPLICIT, decoded, "gta6") ??
    find(keywords, decoded, "gta6") ??
    (creator && { level: "franchise", term: creator[1] })
  );
}
