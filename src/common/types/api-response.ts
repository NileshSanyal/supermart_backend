/**
 * @description This interface is used to retrieve
 * response data from server.
 */
export interface ApiResponse {
    status: number;
    error: boolean;
    message: string;
    data ?: any;
    total_records ?: number;
}