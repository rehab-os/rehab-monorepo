import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { PermissionResponseDto } from './permission.dto';

export class CreateRoleDto {
    @ApiProperty({ example: 'clinic_owner' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'Clinic Owner' })
    @IsString()
    @IsNotEmpty()
    display_name!: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    is_system_role?: boolean;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) { }

export class AssignPermissionsDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    permission_ids!: string[];
}

export class RoleResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    display_name!: string;

    @ApiProperty()
    description?: string;

    @ApiProperty()
    is_system_role!: boolean;

    @ApiProperty()
    created_at!: Date;

    @ApiPropertyOptional()
    permissions?: PermissionResponseDto[];
}