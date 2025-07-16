import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from '../services/notes.service';
import { AuthGuard, GenerateNoteDto, GenerateNoteResponseDto } from '@rehab/common';

@ApiTags('Notes')
@Controller('notes')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

    @Post('generate')
    @ApiOperation({ summary: 'Generate medical note from transcription' })
    @ApiResponse({
        status: 200,
        description: 'Medical note generated successfully',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: 'Request successful' },
                data: {
                    type: 'object',
                    properties: {
                        noteType: { type: 'string', example: 'SOAP' },
                        note: {
                            type: 'object',
                            properties: {
                                subjective: { type: 'string', example: 'The patient reports knee pain after running.' },
                                objective: { type: 'string', example: 'Mild tenderness, no visible swelling.' },
                                assessment: { type: 'string', example: 'Likely overuse injury.' },
                                plan: { type: 'string', example: 'Rest, ice, and reassess in 7 days.' }
                            }
                        }
                    }
                },
                timestamp: { type: 'string', example: '2023-12-01T00:00:00.000Z' },
                path: { type: 'string', example: '/notes/generate' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid transcription or note type'
    })
    async generateNote(@Body() generateNoteDto: GenerateNoteDto) {
        return this.notesService.generateNote(generateNoteDto);
    }
}