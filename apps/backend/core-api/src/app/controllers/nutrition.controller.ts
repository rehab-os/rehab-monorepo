import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NutritionService } from '../services/nutrition.service';
import { AuthGuard } from '@rehab/common';

@ApiTags('Nutrition')
@Controller('nutrition')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class NutritionController {
    constructor(private readonly nutritionService: NutritionService) {}

    @Post('generate')
    @ApiOperation({ summary: 'Generate nutrition plan based on patient data' })
    @ApiResponse({
        status: 200,
        description: 'Nutrition plan generated successfully',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: 'Request successful' },
                data: {
                    type: 'object',
                    properties: {
                        recommendedFoods: { 
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    category: { type: 'string' },
                                    items: { type: 'array', items: { type: 'string' } },
                                    reason: { type: 'string' }
                                }
                            }
                        },
                        avoidFoods: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    item: { type: 'string' },
                                    reason: { type: 'string' }
                                }
                            }
                        },
                        mealPlan: {
                            type: 'object',
                            properties: {
                                breakfast: { type: 'array', items: { type: 'string' } },
                                lunch: { type: 'array', items: { type: 'string' } },
                                dinner: { type: 'array', items: { type: 'string' } },
                                snacks: { type: 'array', items: { type: 'string' } }
                            }
                        },
                        hydration: { type: 'string' },
                        supplements: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    dosage: { type: 'string' },
                                    reason: { type: 'string' }
                                }
                            }
                        },
                        generalGuidelines: { type: 'array', items: { type: 'string' } }
                    }
                },
                timestamp: { type: 'string', example: '2023-12-01T00:00:00.000Z' },
                path: { type: 'string', example: '/nutrition/generate' }
            }
        }
    })
    async generateNutritionPlan(@Body() data: { prompt: string }) {
        return this.nutritionService.generateNutritionPlan(data.prompt);
    }
}