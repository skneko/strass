export const grammar = {
    tokenizer: {
        root: [
            [/(path)(\s+)(for)(\s+)(\w+)(\s*)(:)(.*)$/, ["keyword", "white", "keyword", "white", "type", "white", "delimiter", ""]],
            [/#/, "keyword"]
        ]
    }
};