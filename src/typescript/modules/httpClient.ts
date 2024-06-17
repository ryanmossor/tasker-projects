import axios, { Method } from "axios";
import * as tasker from "../dev/tasker";
import Logger from "./logger";
import { isNullOrEmpty } from "./utils";

class HttpError extends Error {
    public properties: Record<string, any>;

    constructor(message: string, properties?: Record<string, any>) {
        super(message);
        this.name = HttpError.name;
        this.properties = properties;
    }
}

type HttpRequestParams<TData = any> = {
    url: string;
    body?: TData;
    params?: any;
    headers?: any;
};

type AxiosErrorLogMessage = {
    response?: {
        status: number;
        data: any;
        headers: any;
    };
    request?: {
        url: string;
        method: string;
        data?: any;
        params?: any;
        headers?: any;
    };
};

export default class Http {
    private static async makeRequest<TData = any, TResponse = any>(method: Method, {
        url,
        body,
        params,
        headers,
    }: HttpRequestParams<TData>) : Promise<TResponse> {
        if (isNullOrEmpty(tasker.global("ONLINE"))) {
            throw new HttpError("Device offline - skipping HTTP request", { method, url });
        }

        Logger.trace({
            message: "HTTP request",
            properties: { method, url, body, params, headers },
        });

        try {
            const { data } = await axios({ method, url, data: body, params, headers });
            return data;
        } catch (error) {
            if (!axios.isAxiosError(error)) {
                throw error;
            }

            const properties: AxiosErrorLogMessage = {};

            if (error.request) {
                properties.request = {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data,
                    params: error.config?.params,
                    headers: error.config?.headers,
                };
            }

            if (error.response) {
                properties.response = {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers,
                };
            }

            throw new HttpError(error.message, properties);
        }
    }

    public static async get<TResponse = any>({ url, params, headers }: HttpRequestParams): Promise<TResponse> {
        return this.makeRequest("GET", { url, params, headers });
    }

    public static async post<TData = any, TResponse = any>({
        url,
        body,
        params,
        headers,
    }: HttpRequestParams<TData>): Promise<TResponse> {
        return this.makeRequest("POST", { url, body, params, headers });
    }

    public static async patch<TData = any, TResponse = any>({
        url,
        body,
        params,
        headers,
    }: HttpRequestParams<TData>): Promise<TResponse> {
        return this.makeRequest("PATCH", { url, body, params, headers });
    }

    public static async put<TData = any, TResponse = any>({
        url,
        body,
        params,
        headers,
    }: HttpRequestParams<TData>): Promise<TResponse> {
        return this.makeRequest("PUT", { url, body, params, headers });
    }

    public static async delete<TData = any, TResponse = any>({
        url,
        body,
        params,
        headers,
    }: HttpRequestParams<TData>): Promise<TResponse> {
        return this.makeRequest("DELETE", { url, body, params, headers });
    }
}
