export const grammar = {
  //defaultToken: "invalid",

  keywords: [
    "is",
    "mod", "endm", "fmod", "endfm", "omod", "endom", "smod", "endsm",
    "including", "inc", "extending", "ex", "protecting", "pr",
    "sort", "sorts",
    "subsort", "subsorts",
    "op", "ops",
    "var", "vars",
    "eq", "ceq",
    "rl", "crl",
    "strat", "sd"
  ],

  commandKeywords: [
    "parse", "check",
    "red", "reduce",
    "rew", "rewrite", "frewrite", "erewrite", "srewrite", "dsrewrite",
    "match", "xmatch",
    "vu-narrow",
    "irredundant", "variant", "unify",
    "eof", "quit",
    // TODO
  ],

  symbols:  /[=><!~?:&|+\-*\/\^%]+/,

  // C# style strings
  escapes: /\\(?:[abfnrtv\\""]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  tokenizer: {
    root: [
      // module beginning
      [/(?:f|o|s)?mod/, "keyword", "@moduleBeginning"],

      // identifiers and keywords
      [/[a-z_][\w-]*/,  { cases: { "@keywords": "keyword",
                                   "@commandKeywords": "invalid",
                                   "@default": "identifier" } }],
      [/[A-Z_][\w'-]*/,  "variable.name"],

      // whitespace
      { include: "@whitespace" },

      // types

      // delimiters and operators
      [/[{}()\[\]]/,        "@brackets"],
      [/[<>](?!@symbols)/,  "@brackets"],
      [/`/,                 "constructor"],
      [/@symbols/,          "delimiter"],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/,  "number.float"],
      [/0[xX][0-9a-fA-F]+/,         "number.hex"],
      [/\d+/,                       "number"],

      // delimiter: after number because of .\d floats
      [/[;,.]/, "delimiter"],

      // strings
      [/"([^"\\]|\\.)*$/, "string.invalid" ],  // non-teminated string
      [/"/,               { token: "string.quote", bracket: "@open", next: "@string" } ],

      // characters
      [/"[^\\"]"/,          "string"],
      [/(")(@escapes)(")/,  ["string","string.escape","string"]],
      [/"/,                 "string.invalid"]
    ],

    moduleBeginning: [
      { include: "@whitespace" },

      [/[A-Z_][\w-]*/,  "namespace"],
      [/is/,            "keyword", "@importList"]
    ],

    importList: [
      { include: "@whitespace" },

      [/protecting|pr/, "keyword", "@moduleExpression"],
      [/including|inc/, "keyword", "@moduleExpression"],
      [/extending|ex/,  "keyword", "@moduleExpression"]
    ],

    moduleExpression: [
      { include: "@whitespace" },

      [/[A-Z_][\w-]*/,  "namespace"],
      [/@symbols/,      "operator"],
      [/\./,            "delimiter", "@popall"]
    ],

    typeSignature: [
      { include: "@whitespace" },

      [/[A-Z_][\w-]*/,  "type"],
      [/->/,            "delimiter"],
      [/\[[^\]]*\]/,    "attribute"],
      [/\./,            "delimiter", "@pop"]
    ],

    comment: [
      [/.*$/, "comment", "@pop"],
    ],

    blockComment: [
      [/[^())]+/,   "comment"],
      [/\(/,        "comment", "@push"],    // nested comment
      [/\*\*\*\(/,  "comment", "@push"],
      [/\)/,        "comment", "@pop"]
    ],

    string: [
      [/[^\\"]+/,  "string"],
      [/@escapes/, "string.escape"],
      [/\\./,      "string.escape.invalid"],
      [/"/,        { token: "string.quote", bracket: "@close", next: "@pop" } ]
    ],

    whitespace: [
      [/[ \t\r\n]+/,  "white"],
      [/---/,         "comment", "@comment" ],
      [/\*\*\*\(/,    "comment", "@blockComment"],
    ],
  },
};
