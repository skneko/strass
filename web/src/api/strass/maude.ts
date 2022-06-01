export function collectModuleNames(program: string): string[] {
    const names: string[] = [];

    for (const match of program.matchAll(/^\s*(?:f|s|o)?mod (\S+)/gm)) {
        const name = match[1];
        names.push(name);
    }

    return names;
}