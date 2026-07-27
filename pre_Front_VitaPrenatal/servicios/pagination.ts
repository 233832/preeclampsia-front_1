import { fetchApi } from './apiClient';
import { assertApiResponse } from './apiError';

const DEFAULT_PAGE_SIZE = 100;

export async function fetchAllPaginated<T>(
    buildUrl: (skip: number, limit: number) => string,
    responseLabel: string,
    pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<T[]> {
    if (!Number.isFinite(pageSize) || pageSize <= 0) {
        throw new Error(`Tamano de pagina invalido para ${responseLabel}.`);
    }

    const items: T[] = [];
    let skip = 0;

    while (true) {
        const response = await fetchApi(buildUrl(skip, pageSize));
        await assertApiResponse(response, responseLabel);

        const pageItems = (await response.json()) as T[];

        if (!Array.isArray(pageItems)) {
            throw new Error(`Respuesta invalida al ${responseLabel}.`);
        }

        items.push(...pageItems);

        if (pageItems.length < pageSize) {
            break;
        }

        skip += pageSize;
    }

    return items;
}