import { AzureOpenAI } from 'openai';

class AzureGptChat {
  private apiKey: string;
  private modelName: string;
  private temperature: number;
  private client: AzureOpenAI;

  private azureSearchEndpoint = process.env.AZURE_SEARCH_ENDPOINT || '';
  private isConnected = false;
  private azureSearchApiToken = process.env.AZURE_SEARCH_TOKEN || '';

  constructor(options: { apiKey: string, modelName: string, temperature: number }) {
    this.apiKey = options.apiKey;
    this.modelName = options.modelName || 'gpt-4o';
    this.temperature = options.temperature || 0.5;

    const deployment = 'D-OAI-model-deploy';
    const apiVersion = '2024-04-01-preview';
    const endpoint = this.azureSearchEndpoint;
    this.client = new AzureOpenAI({
      deployment,
      apiVersion,
      endpoint,
      apiKey: this.azureSearchApiToken,
    });
  }

  public async call(prompt: string): Promise<string> {
    let result = '';

    try {
      const events = await this.client.chat.completions.create({
        stream: true,
        messages: [{
          role: 'user',
          content: prompt,
        }],
        // max_tokens: 800,
        model: this.modelName,
        temperature: this.temperature,
      });

      for await (const event of events) {
        for (const choice of event.choices) {
          if (choice.delta?.content) {
            result += choice.delta?.content;
          }
        }
      }
      return result;
    } catch (error) {
      console.error('Error calling Azure GPT API:', error);
      throw error;
    }
  }
}

export { AzureGptChat };
