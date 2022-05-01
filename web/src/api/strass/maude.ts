export function collectModuleNames(program: string): string[] {
    let names: string[] = [];

    for (let match of program.matchAll(/^\s*(?:f|s|o)?mod (\S+)/gm)) {
        let name = match[1];
        names.push(name);
    }

    return names;
}