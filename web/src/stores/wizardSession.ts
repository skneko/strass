import { writable, derived } from "svelte/store";

export const program = writable("");
export const rootModuleName = writable("<root-module>");
export const predicatesAddendum = writable("");
export const constraints = writable("");
export const selectedExampleId = writable("empty");

export const addendumModuleName = derived(rootModuleName, 
    $rootModuleName => $rootModuleName + "-PREDICATES");