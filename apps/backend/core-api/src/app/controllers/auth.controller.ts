import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto, SendOtpDto, LoginResponseDto } from '@rehab/common';
import { Public, AuthGuard } from '@rehab/common';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        id: string;
        phone: string;
        [key: string]: any;
    };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('send-otp')
    @ApiOperation({ summary: 'Send OTP to phone number' })
    @ApiResponse({
        status: 200,
        description: 'OTP sent successfully',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: 'OTP sent successfully' },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'OTP sent successfully' }
                    }
                },
                timestamp: { type: 'string', example: '2023-12-01T00:00:00.000Z' },
                path: { type: 'string', example: '/auth/send-otp' }
            }
        }
    })
    async sendOtp(@Body() sendOtpDto: SendOtpDto) {
        return this.authService.sendOtp(sendOtpDto);
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login with phone and OTP' })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: LoginResponseDto
    })
    async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        return this.authService.login(loginDto);
    }

    @UseGuards(AuthGuard)
    @Get('me')
    @ApiBearerAuth('JWT-auth')  // Add the auth name to match main.ts
    @ApiOperation({ summary: 'Get current user info' })
    @ApiResponse({
        status: 200,
        description: 'Current user information',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                statusCode: { type: 'number', example: 200 },
                message: { type: 'string', example: 'Request successful' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        phone: { type: 'string' },
                        full_name: { type: 'string' },
                        email: { type: 'string' },
                        roles: { type: 'array' }
                    }
                },
                timestamp: { type: 'string' },
                path: { type: 'string' }
            }
        }
    })
    async getCurrentUser(@Request() req: AuthenticatedRequest) {
        return req.user;
    }
}