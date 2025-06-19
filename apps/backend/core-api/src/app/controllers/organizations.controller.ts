import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrganizationsService } from '../services/organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationResponseDto } from '@rehab/common';
import { AuthGuard, PermissionsGuard, RequirePermissions } from '@rehab/common';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        id: string;
        phone: string;
        [key: string]: any;
    };
}

@ApiTags('Organizations')
@Controller('organizations')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Post()
    // @RequirePermissions('organizations:create')
    @ApiOperation({ summary: 'Create a new organization' })
    @ApiResponse({
        status: 201,
        description: 'Organization created successfully',
        type: OrganizationResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions'
    })
    create(
        @Body() createOrganizationDto: CreateOrganizationDto,
        @Request() req: AuthenticatedRequest
    ): Promise<OrganizationResponseDto> {
        return this.organizationsService.create(createOrganizationDto, req.user.id);
    }

    @Get()
    // @RequirePermissions('organizations:read')
    @ApiOperation({ summary: 'Get all organizations' })
    @ApiResponse({
        status: 200,
        description: 'List of organizations retrieved successfully',
        type: [OrganizationResponseDto]
    })
    findAll(): Promise<OrganizationResponseDto[]> {
        return this.organizationsService.findAll();
    }

    @Get(':id')
    // @RequirePermissions('organizations:read')
    @ApiOperation({ summary: 'Get organization by ID' })
    @ApiParam({
        name: 'id',
        description: 'Organization UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'Organization details retrieved successfully',
        type: OrganizationResponseDto
    })
    @ApiResponse({
        status: 404,
        description: 'Organization not found'
    })
    findOne(@Param('id') id: string): Promise<OrganizationResponseDto> {
        return this.organizationsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions('organizations:update')
    @ApiOperation({ summary: 'Update organization' })
    @ApiParam({
        name: 'id',
        description: 'Organization UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'Organization updated successfully',
        type: OrganizationResponseDto
    })
    @ApiResponse({
        status: 404,
        description: 'Organization not found'
    })
    update(
        @Param('id') id: string,
        @Body() updateOrganizationDto: UpdateOrganizationDto,
    ): Promise<OrganizationResponseDto> {
        return this.organizationsService.update(id, updateOrganizationDto);
    }

    @Delete(':id')
    @RequirePermissions('organizations:delete')
    @ApiOperation({ summary: 'Deactivate organization' })
    @ApiParam({
        name: 'id',
        description: 'Organization UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'Organization deactivated successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Organization not found'
    })
    remove(@Param('id') id: string): Promise<void> {
        return this.organizationsService.remove(id);
    }
}