import { DynamicTool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import axios from "axios";
import prisma from "../prisma/client.js";
import { decrypt } from "../utils/encryption.js";

class BuiltInToolsService {
    async getTools(userId, toolNames = []) {
        const tools = [];

        for (const name of toolNames) {
            try {
                switch (name.toLowerCase()) {
                    case 'tavily_search':
                        const tavilyTool = await this.createTavilyTool(userId);
                        if (tavilyTool) {
                            tools.push(tavilyTool);
                        } else {
                            console.log(`ℹ️ Tavily tool skipped for user ${userId}: API key 'tavily' not found.`);
                        }
                        break;

                    case 'weather':
                        const weatherTool = await this.createWeatherTool(userId);
                        if (weatherTool) {
                            tools.push(weatherTool);
                        } else {
                            console.log(`ℹ️ Weather tool skipped for user ${userId}: API key 'weather' or 'openweathermap' not found.`);
                        }
                        break;

                    case 'calculator':
                        tools.push(this.createCalculatorTool());
                        break;
                }
            } catch (error) {
                console.error(`⚠️ Skipping tool ${name} due to error:`, error.message);
                // Instead of crashing the whole agent, we throw a clear error if the tool was explicitly requested
                throw error;
            }
        }

        return tools;
    }

    async createTavilyTool(userId) {
        const keyRecord = await prisma.apiKey.findUnique({
            where: { userId_provider: { userId, provider: 'tavily' } }
        });

        if (!keyRecord) return null;

        const apiKey = decrypt(keyRecord.encryptedKey);

        if (!apiKey) {
            throw new Error('Decryption of Tavily API key failed or key is empty.');
        }

        // The @langchain/tavily package requires the environment variable 
        // to be set even when passed in the constructor.
        process.env.TAVILY_API_KEY = apiKey;
        console.log('🔑 Tavily key loaded into environment');

        try {
            return new TavilySearch({
                apiKey: apiKey,
                maxResults: 5
            });
        } catch (error) {
            console.error('❌ Error initializing TavilySearch:', error.message);
            throw new Error(`Tavily initialization failed: ${error.message}`);
        }
    }

    async createWeatherTool(userId) {
        // Look for either 'weather' or 'openweathermap' in the database
        let keyRecord = await prisma.apiKey.findUnique({
            where: { userId_provider: { userId, provider: 'weather' } }
        });

        if (!keyRecord) {
            keyRecord = await prisma.apiKey.findUnique({
                where: { userId_provider: { userId, provider: 'openweathermap' } }
            });
        }

        if (!keyRecord) return null;

        const apiKey = decrypt(keyRecord.encryptedKey);

        return new DynamicTool({
            name: "get_weather",
            description: "Get the current weather for a specific city. Input should be the city name.",
            func: async (city) => {
                try {
                    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
                    const { main, weather, name } = response.data;
                    return `The current weather in ${name} is ${weather[0].description} with a temperature of ${main.temp}°C and humidity of ${main.humidity}%.`;
                } catch (error) {
                    return `Error fetching weather: ${error.response?.data?.message || error.message}`;
                }
            }
        });
    }

    createCalculatorTool() {
        return new DynamicTool({
            name: "calculator",
            description: "Perform simple mathematical calculations. Input should be a mathematical expression like '2 + 2'.",
            func: async (expression) => {
                try {
                    // Sanitize input - only allow numbers, operators, parentheses, and decimal points
                    const sanitized = expression.replace(/[^-()\d/*+.\s]/g, '');

                    // Additional validation - check for balanced parentheses
                    const openParens = (sanitized.match(/\(/g) || []).length;
                    const closeParens = (sanitized.match(/\)/g) || []).length;

                    if (openParens !== closeParens) {
                        return "Error: Unbalanced parentheses in expression.";
                    }

                    // Use Function constructor instead of eval for safer evaluation
                    // This still evaluates code but in a more controlled manner
                    const result = new Function(`return ${sanitized}`)();

                    if (!isFinite(result)) {
                        return "Error: Result is not a finite number.";
                    }

                    return `The result is: ${result}`;
                } catch (e) {
                    return "Error: Invalid mathematical expression.";
                }
            }
        });
    }
}

export default new BuiltInToolsService();
