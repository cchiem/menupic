import { Together } from "together-ai";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

export async function POST(request: Request) {
    try {
        const { menuURL } = await request.json();
        console.log("Received menu URL:", menuURL);

        if (!menuURL) {
            return Response.json(
                { error: "No menu URL provided" },
                { status: 400 }
            );
        }

        const systemPrompt = `You are given an image of a menu. Your job is to take each item in the menu and convert it into the following JSON format:
        [{"name": "name of menu item", "price": "price of the menu item", "description": "description of menu item"}, ...]
        Please make sure to include all items in the menu and include a price (if it exists) & a description (if it exists). ALSO PLEASE ONLY RETURN JSON.`;

        // Add timeout for Together AI requests (10 seconds)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        let output;
        try {
            output = await together.chat.completions.create({
                model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: systemPrompt },
                            { type: "image_url", image_url: { url: menuURL } },
                        ],
                    },
                ],
                signal: controller.signal, // Attach timeout signal
            });
            clearTimeout(timeout);
        } catch (error) {
            console.error("Together AI Request Failed:", error);
            return Response.json(
                { error: "Failed to fetch menu data from Together AI" },
                { status: 500 }
            );
        }

        const menuItems = output?.choices?.[0]?.message?.content;
        console.log("Received Menu Items:", menuItems);

        if (!menuItems) {
            return Response.json(
                { error: "No menu items extracted" },
                { status: 500 }
            );
        }

        // Define menu schema
        const menuSchema = z.array(
            z.object({
                name: z.string().describe("The name of the menu item"),
                price: z.string().describe("The price of the menu item"),
                description: z
                    .string()
                    .describe("Description of the menu item."),
            })
        );

        const jsonSchema = zodToJsonSchema(menuSchema, "menuSchema");

        let extractedData;
        try {
            const extract = await together.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content:
                            "The following is a list of items from a menu. Only answer in JSON.",
                    },
                    { role: "user", content: menuItems! },
                ],
                model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
                // @ts-expect-error - this is not typed in the API

                response_format: { type: "json_object", schema: jsonSchema },
            });
            // @ts-expect-error: just need to see what happens in deployment

            extractedData = JSON.parse(extract?.choices?.[0]?.message?.content);
            console.log("Extracted Menu JSON:", extractedData);
        } catch (error) {
            console.error("JSON Extraction Failed:", error);
            return Response.json(
                { error: "Failed to parse menu items" },
                { status: 500 }
            );
        }

        // Limit to max 5 image requests to prevent timeout
        const limitedItems = extractedData.slice(0, 5);

        const imagePromises = limitedItems.map(async (item: any) => {
            console.log("Processing image for:", item.name);
            try {
                const response = await together.images.create({
                    prompt: `A picture of food for a menu, hyper realistic, highly detailed, ${item.name}, ${item.description}.`,
                    model: "black-forest-labs/FLUX.1-schnell",
                    width: 1024,
                    height: 768,
                    steps: 4,
                    response_format: "base64",
                });
                item.menuImage = response.data[0];
            } catch (error) {
                console.error("Image Generation Failed for:", item.name, error);
                item.menuImage = null;
            }
            return item;
        });

        await Promise.all(imagePromises);

        return Response.json({ menu: limitedItems });
    } catch (error) {
        console.error("Server Error:", error);
        return Response.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export const maxDuration = 60; // Set Vercel function timeout limit
