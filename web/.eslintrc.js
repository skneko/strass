module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json"],
        extraFileExtensions: [".svelte"]
    },
    plugins: [
        "@typescript-eslint",
        "svelte3"
    ],
    ignorePatterns: [
        "public/build"
    ],
    overrides: [
        {
            "files": ["**/*.svelte"],
            "processor": "svelte3/svelte3"
        }
    ],
    rules: {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    },
    settings: {
        "svelte3/typescript": require("typescript")
    }
}
