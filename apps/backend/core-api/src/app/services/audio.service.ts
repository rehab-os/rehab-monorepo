import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AudioService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OpenAI API key is not configured');
        }
        this.openai = new OpenAI({ apiKey });
    }

    async transcribeAudio(file: Express.Multer.File): Promise<{ transcription: string }> {
        if (!file) {
            throw new BadRequestException('No audio file provided');
        }

        // Validate file type
        const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file type. Only MP3, WAV, M4A, and WebM files are supported');
        }

        // Validate file size (max 25MB for OpenAI Whisper)
        const maxSize = 25 * 1024 * 1024; // 25MB
        if (file.size > maxSize) {
            throw new BadRequestException('File size too large. Maximum size is 25MB');
        }

        try {
            // Create a File object from the buffer
            const audioFile = new File([file.buffer], file.originalname, {
                type: file.mimetype,
            });

            // Transcribe using OpenAI Whisper
            const transcription = await this.openai.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-1',
                language: 'en', // Force English transcription
                response_format: 'text',
            });

            return { transcription: transcription.toString() };
        } catch (error) {
            throw new BadRequestException(`Transcription failed: ${error.message}`);
        }
    }
}