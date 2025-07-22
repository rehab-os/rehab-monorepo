import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class NutritionService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OpenAI API key is not configured');
        }
        this.openai = new OpenAI({ apiKey });
    }

    async generateNutritionPlan(prompt: string): Promise<any> {
        if (!prompt) {
            throw new BadRequestException('Prompt is required');
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional nutritionist specializing in creating personalized nutrition plans for patients in physical therapy and rehabilitation. 
                        You provide evidence-based dietary recommendations considering medical conditions, medications, allergies, and recovery goals.
                        
                        IMPORTANT: You MUST respond with ONLY valid JSON that can be parsed. Do not include any explanatory text before or after the JSON.
                        
                        Your response must follow this exact JSON structure:
                        {
                          "recommendedFoods": [{"category": "string", "items": ["string"], "reason": "string"}],
                          "avoidFoods": [{"item": "string", "reason": "string"}],
                          "mealPlan": {"breakfast": ["string"], "lunch": ["string"], "dinner": ["string"], "snacks": ["string"]},
                          "hydration": "string",
                          "supplements": [{"name": "string", "dosage": "string", "reason": "string"}],
                          "generalGuidelines": ["string"]
                        }`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });

            const responseText = completion.choices[0].message.content;
            
            if (!responseText) {
                throw new BadRequestException('No response from AI service');
            }
            
            try {
                // Clean the response in case there's any extra text
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                const jsonString = jsonMatch ? jsonMatch[0] : responseText;
                
                const nutritionData = JSON.parse(jsonString);
                
                // Validate the response structure
                if (!nutritionData.recommendedFoods || !nutritionData.avoidFoods || !nutritionData.mealPlan) {
                    console.error('Invalid nutrition data structure:', nutritionData);
                    throw new Error('Invalid response structure');
                }
                
                return nutritionData;
            } catch (parseError) {
                console.error('Failed to parse OpenAI response:', responseText);
                console.error('Parse error:', parseError);
                throw new BadRequestException('Failed to generate nutrition plan format');
            }
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw new BadRequestException(`Failed to generate nutrition plan: ${error.message}`);
        }
    }
}