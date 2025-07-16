import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface GenerateNoteDto {
    transcription: string;
    noteType: 'SOAP' | 'BAP' | 'Progress';
}

interface SOAPNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

interface BAPNote {
    behavior: string;
    assessment: string;
    plan: string;
}

interface ProgressNote {
    progressNote: string;
}

@Injectable()
export class NotesService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OpenAI API key is not configured');
        }
        this.openai = new OpenAI({ apiKey });
    }

    async generateNote(generateNoteDto: GenerateNoteDto): Promise<{ noteType: string; note: SOAPNote | BAPNote | ProgressNote }> {
        const { transcription, noteType } = generateNoteDto;

        if (!transcription || !transcription.trim()) {
            throw new BadRequestException('Transcription is required');
        }

        if (!['SOAP', 'BAP', 'Progress'].includes(noteType)) {
            throw new BadRequestException('Invalid note type. Must be SOAP, BAP, or Progress');
        }

        try {
            let prompt = '';
            
            switch (noteType) {
                case 'SOAP':
                    prompt = `Convert the following medical transcription into a SOAP note format. Return a JSON object with subjective, objective, assessment, and plan fields:

Transcription: "${transcription}"

Format the response as a JSON object with these exact fields:
- subjective: Patient's reported symptoms and concerns
- objective: Observable findings and measurements
- assessment: Clinical interpretation and diagnosis
- plan: Treatment plan and next steps

Return only the JSON object, no additional text.`;
                    break;

                case 'BAP':
                    prompt = `Convert the following medical transcription into a BAP (Behavior, Assessment, Plan) note format. Return a JSON object with behavior, assessment, and plan fields:

Transcription: "${transcription}"

Format the response as a JSON object with these exact fields:
- behavior: Patient's behavior and functional status
- assessment: Clinical assessment of the behavior
- plan: Treatment plan and interventions

Return only the JSON object, no additional text.`;
                    break;

                case 'Progress':
                    prompt = `Convert the following medical transcription into a Progress note format. Return a JSON object with a progressNote field:

Transcription: "${transcription}"

Format the response as a JSON object with this exact field:
- progressNote: Comprehensive progress note describing current status, changes, and ongoing care

Return only the JSON object, no additional text.`;
                    break;
            }

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a medical assistant that converts transcriptions into structured medical notes. Always return valid JSON format only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000,
            });

            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from AI service');
            }

            // Parse the JSON response
            let parsedNote;
            try {
                parsedNote = JSON.parse(response);
            } catch (parseError) {
                throw new Error('Invalid JSON response from AI service');
            }

            return {
                noteType,
                note: parsedNote
            };

        } catch (error) {
            throw new BadRequestException(`Note generation failed: ${error.message}`);
        }
    }
}