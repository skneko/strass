<script lang="ts">
    import type { Example } from "@models/Example";
    import { rootUrl } from "@stores/context";
    import {
        constraints,
        predicatesAddendum,
        program,
        selectedExampleId,
    } from "stores/wizardSession";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    export let examples: Example[];

    let selectElem: HTMLSelectElement;

    onMount(() => {
        for (let example of examples) {
            selectElem.options.add(new Option(example.name, example.id));
        }

        selectedExampleId.subscribe((value) => {
            if (selectElem) {
                selectElem.value = value;
            }
        });
    });

    async function handleChange(
        event: Event & { currentTarget: EventTarget & HTMLSelectElement }
    ) {
        let value = event.currentTarget.value;

        if (value === "empty") {
            $program = "";
            $predicatesAddendum = "";
            $constraints = "";
        } else {
            await loadExample(value);
        }

        $selectedExampleId = value;
        dispatch("change", {
            value,
        });
    }

    async function loadExample(id: string) {
        let example = examples.find((example) => example.id === id);
        let baseUrl = `${$rootUrl}/examples/${example.id}`;

        let [programContent, predicatesContent, constraintsContent] =
            await Promise.all([
                readStatic(`${baseUrl}/${example.id}.maude`),
                readStatic(
                    example.predicates
                        ? `${baseUrl}/${example.predicates}.predicates`
                        : `${baseUrl}/${example.constraints}.predicates`,
                    undefined,
                    example.predicates ? undefined : ""
                ),
                readStatic(`${baseUrl}/${example.constraints}.constraints`),
            ]);

        $program = programContent;
        $predicatesAddendum = predicatesContent;
        $constraints = constraintsContent;
    }

    async function readStatic(
        input: RequestInfo,
        init?: RequestInit,
        defaultValue?: string
    ): Promise<string> {
        let response = await fetch(input, init);

        if (response.ok) {
            return response.text();
        } else if (defaultValue !== undefined && response.status == 404) {
            return defaultValue;
        } else {
            throw `Error fetching file: ${response.status} ${response.statusText}`;
        }
    }
</script>

<form>
    <select
        bind:this={selectElem}
        on:change={handleChange}
        class="form-select"
        aria-label="Default select example"
    >
        <option value="empty" selected
            >Empty (upload file or write it yourself)</option
        >
    </select>
</form>

<style>
    select {
        font-weight: 600;
        background-color: rgb(221, 238, 253);
    }
</style>
