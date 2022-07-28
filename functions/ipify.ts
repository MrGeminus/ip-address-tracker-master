import axios, { AxiosResponse } from 'axios';
import { Handler } from "@netlify/functions";
import { IpifyDetailedResponse } from '../src/ts/interfaces';

const handler: Handler = async (event) => {
    // Checking if query is present in the request
    if (!event.queryStringParameters?.query) return { statusCode: 400, body: JSON.stringify('Bad request') }
    const query = event.queryStringParameters?.query;
    // Checking if environment variables is available
    if (!process.env.IPIFY_ACCESS_TOKEN) return { statusCode: 500, body: JSON.stringify('Internal Server Error') }
    const IPIFY_ACCESS_TOKEN = process.env.IPIFY_ACCESS_TOKEN;
    // Creating the url for the request
    const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${IPIFY_ACCESS_TOKEN}&${query}`;
    try {
        const { data }: AxiosResponse<IpifyDetailedResponse> = await axios(url)
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        }
    }
    catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) }
    }
}

export { handler };