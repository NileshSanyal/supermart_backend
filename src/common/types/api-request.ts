/**
 * This interface is used to send
 * request data to server.
 */
export interface ApiRequest {
    data: any; // Filter parameters for list type requests
    index: number; // Current record index
    page_size: number; // Number of records to fetch for that page index
}