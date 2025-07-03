import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { TeamService } from '../services/team.service';
import { 
    AddTeamMemberDto, 
    TeamMemberResponseDto, 
    BulkTeamMembersResponseDto 
} from '@rehab/common';
import { AuthGuard, PermissionsGuard } from '@rehab/common';
import { ClinicRole } from '@rehab/database';

@ApiTags('Team Management')
@Controller('team')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, PermissionsGuard)
export class TeamController {
    constructor(private readonly teamService: TeamService) { }

    @Post('members')
    @ApiOperation({ summary: 'Add a new team member to organization/clinics' })
    @ApiHeader({ name: 'x-organization-id', required: true })
    @ApiResponse({ status: 201, description: 'Team member added successfully', type: [TeamMemberResponseDto] })
    async addTeamMember(
        @Body() addTeamMemberDto: AddTeamMemberDto,
        @Headers('x-organization-id') organizationId: string,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        @Request() req,
    ): Promise<TeamMemberResponseDto[]> {
        return this.teamService.addTeamMember(organizationId, addTeamMemberDto, req.user.id);
    }

    @Get('members')
    @ApiOperation({ summary: 'Get all team members in organization' })
    @ApiHeader({ name: 'x-organization-id', required: true })
    @ApiQuery({ name: 'clinic_id', required: false, description: 'Filter by specific clinic' })
    @ApiResponse({ status: 200, description: 'Team members retrieved successfully', type: BulkTeamMembersResponseDto })
    async getTeamMembers(
        @Headers('x-organization-id') organizationId: string,
        @Query('clinic_id') clinicId?: string,
    ): Promise<BulkTeamMembersResponseDto> {
        return this.teamService.getTeamMembers(organizationId, clinicId);
    }

    @Delete('members/:userId')
    @ApiOperation({ summary: 'Remove team member from organization' })
    @ApiHeader({ name: 'x-organization-id', required: true })
    @ApiQuery({ name: 'clinic_id', required: false, description: 'Remove from specific clinic only' })
    @ApiResponse({ status: 200, description: 'Team member removed successfully' })
    async removeTeamMember(
        @Param('userId') userId: string,
        @Headers('x-organization-id') organizationId: string,
        @Query('clinic_id') clinicId?: string,
    ): Promise<{ message: string }> {
        await this.teamService.removeTeamMember(organizationId, userId, clinicId);
        return { message: 'Team member removed successfully' };
    }

    @Patch('members/:userId/role')
    @ApiOperation({ summary: 'Update team member role and admin status' })
    @ApiHeader({ name: 'x-organization-id', required: true })
    @ApiResponse({ status: 200, description: 'Team member role updated', type: TeamMemberResponseDto })
    async updateTeamMemberRole(
        @Param('userId') userId: string,
        @Headers('x-organization-id') organizationId: string,
        @Body() updateRoleDto: {
            clinic_id: string;
            role: ClinicRole;
            is_admin: boolean;
        }
    ): Promise<TeamMemberResponseDto> {
        return this.teamService.updateTeamMemberRole(
            organizationId,
            userId,
            updateRoleDto.clinic_id,
            updateRoleDto.role,
            updateRoleDto.is_admin
        );
    }
}