import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto, UpdatePermissionDto, PermissionResponseDto, AuthGuard, PermissionsGuard, RequirePermissions } from '@rehab/common';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Post()
    // @RequirePermissions('permissions:create')
    @ApiOperation({ summary: 'Create a new permission' })
    @ApiResponse({ status: 201, description: 'Permission created', type: PermissionResponseDto })
    create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
        return this.permissionsService.create(createPermissionDto);
    }

    @Get()
    // @RequirePermissions('permissions:read')
    @ApiOperation({ summary: 'Get all permissions' })
    @ApiResponse({ status: 200, description: 'List of permissions', type: [PermissionResponseDto] })
    findAll(): Promise<PermissionResponseDto[]> {
        return this.permissionsService.findAll();
    }

    @Get(':id')
    // @RequirePermissions('permissions:read')
    @ApiOperation({ summary: 'Get permission by ID' })
    @ApiResponse({ status: 200, description: 'Permission details', type: PermissionResponseDto })
    findOne(@Param('id') id: string): Promise<PermissionResponseDto> {
        return this.permissionsService.findOne(id);
    }

    @Patch(':id')
    // @RequirePermissions('permissions:update')
    @ApiOperation({ summary: 'Update permission' })
    @ApiResponse({ status: 200, description: 'Permission updated', type: PermissionResponseDto })
    update(
        @Param('id') id: string,
        @Body() updatePermissionDto: UpdatePermissionDto,
    ): Promise<PermissionResponseDto> {
        return this.permissionsService.update(id, updatePermissionDto);
    }

    @Delete(':id')
    // @RequirePermissions('permissions:delete')
    @ApiOperation({ summary: 'Delete permission' })
    @ApiResponse({ status: 200, description: 'Permission deleted' })
    remove(@Param('id') id: string): Promise<void> {
        return this.permissionsService.remove(id);
    }
}