import { readable, derived } from "svelte/store";

export const rootPath = readable("/strass");
export const rootUrl = derived(rootPath,
    $rootPath => `${window.location.origin}${$rootPath}`);