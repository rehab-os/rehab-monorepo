import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AudioService } from '../services/audio.service';
import { AuthGuard, TranscribeAudioDto, TranscriptionResponseDto } from '@rehab/common';

@ApiTags('Audio')
@Controller('audio')
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class AudioController {
    constructor(private readonly audioService: AudioService) {}

    @Post('transcribe')
    @UseInterceptors(FileInterceptor('audio'))
    @ApiOperation({ summary: 'Transcribe audio file to text' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({
        status: 200,
        description: 'Audio transcribed successfully',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: 'Request successful' },
                data: {
                    type: 'object',
                    properties: {
                        transcription: { 
                            type: 'string', 
                            example: 'Patient is a 35-year-old male presenting with mild knee pain after running.' 
                        }
                    }
                },
                timestamp: { type: 'string', example: '2023-12-01T00:00:00.000Z' },
                path: { type: 'string', example: '/audio/transcribe' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid file format or missing file'
    })
    async transcribeAudio(@UploadedFile() file: Express.Multer.File) {
        return this.audioService.transcribeAudio(file);
    }
}