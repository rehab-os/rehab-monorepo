import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PhysiotherapistProfileService } from '../services/physiotherapist-profile.service';
import {
  CreatePhysiotherapistProfileDto,
  UpdatePhysiotherapistProfileDto,
  CompletePhysiotherapistProfileDto,
  CreateEducationDto,
  CreateTechniqueDto,
  CreateMachineDto,
  CreateWorkshopDto
} from '@rehab/common';
import { AuthGuard, PermissionGuard, RequirePermissions } from '@rehab/common';

@ApiTags('Physiotherapist Profile')
@ApiBearerAuth()
@Controller('physiotherapist-profile')
@UseGuards(AuthGuard)
export class PhysiotherapistProfileController {
  constructor(private readonly profileService: PhysiotherapistProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update physiotherapist profile' })
  @ApiResponse({ status: 201, description: 'Profile created/updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createProfile(
    @Req() req: any,
    @Body() createProfileDto: CreatePhysiotherapistProfileDto
  ) {
    const profile = await this.profileService.createOrUpdateProfile(req.user.id, createProfileDto);
    return {
      success: true,
      message: 'Profile saved successfully',
      data: profile
    };
  }

  @Put()
  @ApiOperation({ summary: 'Update physiotherapist profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdatePhysiotherapistProfileDto
  ) {
    const profile = await this.profileService.updateProfile(req.user.id, updateProfileDto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: profile
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get physiotherapist profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Req() req: any) {
    const profile = await this.profileService.getProfile(req.user.id);
    if (!profile) {
      return {
        success: false,
        message: 'Profile not found',
        data: null
      };
    }
    
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: profile
    };
  }

  @Get(':profileId')
  @ApiOperation({ summary: 'Get physiotherapist profile by ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfileById(@Param('profileId') profileId: string) {
    const profile = await this.profileService.getProfileById(profileId);
    if (!profile) {
      return {
        success: false,
        message: 'Profile not found',
        data: null
      };
    }
    
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: profile
    };
  }

  @Post('complete')
  @ApiOperation({ summary: 'Create complete physiotherapist profile with all details' })
  @ApiResponse({ status: 201, description: 'Complete profile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  async createCompleteProfile(
    @Req() req: any,
    @Body() completeProfileDto: CompletePhysiotherapistProfileDto
  ) {
    const profile = await this.profileService.createCompleteProfile(req.user.id, completeProfileDto);
    return {
      success: true,
      message: 'Complete profile created successfully',
      data: profile
    };
  }

  @Post('education')
  @ApiOperation({ summary: 'Add education to physiotherapist profile' })
  @ApiResponse({ status: 201, description: 'Education added successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async addEducation(
    @Req() req: any,
    @Body() createEducationDto: CreateEducationDto
  ) {
    const education = await this.profileService.addEducation(req.user.id, createEducationDto);
    return {
      success: true,
      message: 'Education added successfully',
      data: education
    };
  }

  @Post('technique')
  @ApiOperation({ summary: 'Add technique to physiotherapist profile' })
  @ApiResponse({ status: 201, description: 'Technique added successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async addTechnique(
    @Req() req: any,
    @Body() createTechniqueDto: CreateTechniqueDto
  ) {
    const technique = await this.profileService.addTechnique(req.user.id, createTechniqueDto);
    return {
      success: true,
      message: 'Technique added successfully',
      data: technique
    };
  }

  @Post('machine')
  @ApiOperation({ summary: 'Add machine to physiotherapist profile' })
  @ApiResponse({ status: 201, description: 'Machine added successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async addMachine(
    @Req() req: any,
    @Body() createMachineDto: CreateMachineDto
  ) {
    const machine = await this.profileService.addMachine(req.user.id, createMachineDto);
    return {
      success: true,
      message: 'Machine added successfully',
      data: machine
    };
  }

  @Post('workshop')
  @ApiOperation({ summary: 'Add workshop to physiotherapist profile' })
  @ApiResponse({ status: 201, description: 'Workshop added successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async addWorkshop(
    @Req() req: any,
    @Body() createWorkshopDto: CreateWorkshopDto
  ) {
    const workshop = await this.profileService.addWorkshop(req.user.id, createWorkshopDto);
    return {
      success: true,
      message: 'Workshop added successfully',
      data: workshop
    };
  }

  @Delete('education/:educationId')
  @ApiOperation({ summary: 'Delete education from physiotherapist profile' })
  @ApiResponse({ status: 200, description: 'Education deleted successfully' })
  @ApiResponse({ status: 404, description: 'Education not found' })
  @HttpCode(HttpStatus.OK)
  async deleteEducation(
    @Req() req: any,
    @Param('educationId') educationId: string
  ) {
    await this.profileService.deleteEducation(req.user.id, educationId);
    return {
      success: true,
      message: 'Education deleted successfully'
    };
  }

  @Delete('technique/:techniqueId')
  @ApiOperation({ summary: 'Delete technique from physiotherapist profile' })
  @ApiResponse({ status: 200, description: 'Technique deleted successfully' })
  @ApiResponse({ status: 404, description: 'Technique not found' })
  @HttpCode(HttpStatus.OK)
  async deleteTechnique(
    @Req() req: any,
    @Param('techniqueId') techniqueId: string
  ) {
    await this.profileService.deleteTechnique(req.user.id, techniqueId);
    return {
      success: true,
      message: 'Technique deleted successfully'
    };
  }

  @Delete('machine/:machineId')
  @ApiOperation({ summary: 'Delete machine from physiotherapist profile' })
  @ApiResponse({ status: 200, description: 'Machine deleted successfully' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  @HttpCode(HttpStatus.OK)
  async deleteMachine(
    @Req() req: any,
    @Param('machineId') machineId: string
  ) {
    await this.profileService.deleteMachine(req.user.id, machineId);
    return {
      success: true,
      message: 'Machine deleted successfully'
    };
  }

  @Delete('workshop/:workshopId')
  @ApiOperation({ summary: 'Delete workshop from physiotherapist profile' })
  @ApiResponse({ status: 200, description: 'Workshop deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workshop not found' })
  @HttpCode(HttpStatus.OK)
  async deleteWorkshop(
    @Req() req: any,
    @Param('workshopId') workshopId: string
  ) {
    await this.profileService.deleteWorkshop(req.user.id, workshopId);
    return {
      success: true,
      message: 'Workshop deleted successfully'
    };
  }
}