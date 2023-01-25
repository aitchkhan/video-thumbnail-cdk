import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import s3 from "@aws-sdk/client-s3";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        return getResponseBody(200, []);
    }
    catch (error: any) {
        console.error(JSON.stringify({ message: error.message }))
        return getResponseBody(400, { message: error.message });
    }
}

export const getResponseBody = (statusCode: number, notifications: any) => {
    return {
        headers: {
            'Content-Type': 'application/json',
        },
        statusCode: statusCode,
        body: JSON.stringify({ notifications })
    }
}