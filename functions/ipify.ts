import axios, { AxiosResponse } from 'axios';
import { Handler } from "@netlify/functions";
import { IpifyDetailedResponse } from '../src/ts/interfaces';

const handler: Handler = async (event, context) => {
    const query = event.queryStringParameters?.query;
    const IPIFY_ACCESS_TOKEN = process.env.IPIFY_ACCESS_TOKEN;
    const url: string = `https://geo.ipify.org/api/v2/country,city?apiKey=${IPIFY_ACCESS_TOKEN}&${query}`;
    console.log(url);
    try {
        const { data }: AxiosResponse<IpifyDetailedResponse> = await axios(url)
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        }
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            const status: number = error.response?.status || error?.request.status || 400;
            return { statusCode: status, body: JSON.stringify(error.message) }
        }
        else {
            return { statusCode: 500, body: JSON.stringify(error) }
        }
    }
}

export { handler };