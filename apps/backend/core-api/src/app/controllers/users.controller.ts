import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import {
    CreateUserDto,
    UpdateUserDto,
    UserResponseDto,
    AssignRoleDto,
    UpdateProfileDto,
    UserListQueryDto
} from '@rehab/common';
import { AuthGuard, PermissionsGuard, RequirePermissions } from '@rehab/common';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        id: string;
        phone: string;
        [key: string]: any;
    };
}

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('users:create')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
    create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('users:read')
    @ApiOperation({ summary: 'Get all users' })
    @ApiQuery({ name: 'organizationId', required: false })
    @ApiQuery({ name: 'clinicId', required: false })
    @ApiQuery({ name: 'role', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
    findAll(@Query() query: UserListQueryDto): Promise<{ users: UserResponseDto[]; total: number }> {
        return this.usersService.findAll(query);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Current user profile', type: UserResponseDto })
    getCurrentUser(@Request() req: AuthenticatedRequest): Promise<UserResponseDto> {
        return this.usersService.findOne(req.user.id);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated', type: UserResponseDto })
    updateProfile(
        @Request() req: AuthenticatedRequest,
        @Body() updateProfileDto: UpdateProfileDto
    ): Promise<UserResponseDto> {
        return this.usersService.updateProfile(req.user.id, updateProfileDto);
    }

    @Get(':id')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('users:read')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'User details', type: UserResponseDto })
    findOne(@Param('id') id: string): Promise<UserResponseDto> {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('users:update')
    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('users:delete')
    @ApiOperation({ summary: 'Deactivate user' })
    @ApiResponse({ status: 200, description: 'User deactivated' })
    remove(@Param('id') id: string): Promise<void> {
        return this.usersService.remove(id);
    }

    @Post(':id/assign-role')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('users:assign_role')
    @ApiOperation({ summary: 'Assign role to user' })
    @ApiResponse({ status: 200, description: 'Role assigned', type: UserResponseDto })
    assignRole(
        @Param('id') id: string,
        @Body() assignRoleDto: AssignRoleDto,
        @Request() req: AuthenticatedRequest
    ): Promise<UserResponseDto> {
        return this.usersService.assignRole(id, assignRoleDto, req.user.id);
    }

    @Delete(':id/roles/:roleId')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('users:remove_role')
    @ApiOperation({ summary: 'Remove role from user' })
    @ApiResponse({ status: 200, description: 'Role removed' })
    removeRole(
        @Param('id') userId: string,
        @Param('roleId') roleId: string
    ): Promise<void> {
        return this.usersService.removeRole(userId, roleId);
    }

    @Get(':id/permissions')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('users:read')
    @ApiOperation({ summary: 'Get user permissions' })
    @ApiResponse({ status: 200, description: 'User permissions', type: [String] })
    getUserPermissions(
        @Param('id') id: string,
        @Query('organizationId') organizationId?: string,
        @Query('clinicId') clinicId?: string
    ): Promise<string[]> {
        return this.usersService.getUserPermissions(id, organizationId, clinicId);
    }
}