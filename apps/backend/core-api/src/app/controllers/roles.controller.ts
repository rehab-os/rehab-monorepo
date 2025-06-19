import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, RoleResponseDto } from '@rehab/common';
import { AuthGuard, PermissionsGuard, RequirePermissions } from '@rehab/common';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    // @RequirePermissions('roles:create')
    @ApiOperation({ summary: 'Create a new role' })
    @ApiResponse({ status: 201, description: 'Role created', type: RoleResponseDto })
    create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    // @RequirePermissions('roles:read')
    @ApiOperation({ summary: 'Get all roles' })
    @ApiResponse({ status: 200, description: 'List of roles', type: [RoleResponseDto] })
    findAll(): Promise<RoleResponseDto[]> {
        return this.rolesService.findAll();
    }

    @Get(':id')
    // @RequirePermissions('roles:read')
    @ApiOperation({ summary: 'Get role by ID' })
    @ApiResponse({ status: 200, description: 'Role details', type: RoleResponseDto })
    findOne(@Param('id') id: string): Promise<RoleResponseDto> {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    // @RequirePermissions('roles:update')
    @ApiOperation({ summary: 'Update role' })
    @ApiResponse({ status: 200, description: 'Role updated', type: RoleResponseDto })
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    // @RequirePermissions('roles:delete')
    @ApiOperation({ summary: 'Delete role' })
    @ApiResponse({ status: 200, description: 'Role deleted' })
    remove(@Param('id') id: string): Promise<void> {
        return this.rolesService.remove(id);
    }

    @Put(':id/permissions')
    // @RequirePermissions('roles:update')
    @ApiOperation({ summary: 'Assign permissions to role' })
    @ApiResponse({ status: 200, description: 'Permissions assigned', type: RoleResponseDto })
    assignPermissions(
        @Param('id') id: string,
        @Body() assignPermissionsDto: AssignPermissionsDto,
    ): Promise<RoleResponseDto> {
        return this.rolesService.assignPermissions(id, assignPermissionsDto);
    }

    @Delete(':id/permissions')
    // @RequirePermissions('roles:update')
    @ApiOperation({ summary: 'Unassign permissions from role' })
    @ApiResponse({ status: 200, description: 'Permissions unassigned', type: RoleResponseDto })
    @ApiParam({ name: 'id', description: 'Role ID' })
    unassignPermissions(
        @Param('id') id: string,
        @Body() body: { permission_ids: string[] },
    ): Promise<RoleResponseDto> {
        return this.rolesService.unassignPermissions(id, body.permission_ids);
    }
}