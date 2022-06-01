export const grammar = {
    symbols: /[=><!~?:&|+\-*/^%]+/,

    // C# style strings
    escapes: /\\(?:[abfnrtv\\""]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
        root: [
            { include: "@whitespace" },

            [/(path)(\s+)(for)(\s+)(\w+)(\s*)(:)(.*)$/, ["keyword", "white", "keyword", "white", "type", "white", "delimiter", ""]],
            [/#/, "keyword"],
            [/true|false/, "constant"],

            // delimiters and operators
            [/[{}()[\]]/, "@brackets"],
            [/[<>](?!@symbols)/, "@brackets"],
            [/`/, "constructor"],
            [/@symbols/, "delimiter"],

            // numbers
            [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
            [/0[xX][0-9a-fA-F]+/, "number.hex"],
            [/\d+/, "number"],

            // delimiter: after number because of .\d floats
            [/[;,.]/, "delimiter"],

            // strings
            [/"([^"\\]|\\.)*$/, "string.invalid"],  // non-teminated string
            [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

            // characters
            [/"[^\\"]"/, "string"],
            [/(")(@escapes)(")/, ["string", "string.escape", "string"]],
            [/"/, "string.invalid"]
        ],

        string: [
            [/[^\\"]+/, "string"],
            [/@escapes/, "string.escape"],
            [/\\./, "string.escape.invalid"],
            [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }]
        ],

        whitespace: [
            [/[ \t\r\n]+/, "white"]
        ],
    }
};