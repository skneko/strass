export async function fetchAs<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init);

    if (response.ok) {
        return response.json() as Promise<T>;
    } else {
        throw `API error: ${response.status} ${response.statusText}`;
    }
}