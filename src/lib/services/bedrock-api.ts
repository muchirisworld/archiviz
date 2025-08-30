import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export async function getBedrockEmbedding(text: string, modelId: string): Promise<number[]> {
    const client = new BedrockRuntimeClient({
        region: process.env.BEDROCK_REGION,
        credentials: process.env.BEDROCK_API_KEY
            ? {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            }
            : undefined,
        endpoint: process.env.BEDROCK_ENDPOINT,
    });

    const input = {
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({ inputText: text }),
    };

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const body = JSON.parse(new TextDecoder().decode(response.body));
    // Adjust this according to actual Bedrock response structure
    return body.embedding || body.vector || [];
}
