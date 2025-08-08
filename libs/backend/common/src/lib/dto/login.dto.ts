import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: '+917006672937' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    phone!: string;

    @ApiProperty({ example: 'firebase-id-token-here', description: 'Firebase ID token obtained after OTP verification' })
    @IsString()
    @IsNotEmpty()
    firebaseIdToken!: string;
}

export class SendOtpDto {
    @ApiProperty({ example: '+1234567890' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    phone!: string;
}

export class LoginResponseDto {
    @ApiProperty()
    access_token!: string;

    @ApiProperty()
    refresh_token!: string;

    @ApiProperty()
    user!: {
        id: string;
        phone: string;
        full_name: string;
        email?: string;
        roles: Array<{
            role: string;
            display_name: string;
            organization_id?: string;
            clinic_id?: string;
            permissions: string[];
        }>;
    };
}