import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser, Roles } from '../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { JwtPayload } from '../common/types/authenticated-request.type';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@ApiTags('Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.GOOWIN_ADMIN, UserRole.GOOWIN_EDITOR)
@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post('services')
  @ApiOperation({ summary: 'Create a client service.' })
  @ApiResponse({ status: 201, type: ServiceResponseDto })
  create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.create(createServiceDto, currentUser.sub);
  }

  @Get('services')
  @ApiOperation({ summary: 'List services.' })
  @ApiResponse({ status: 200, type: ServiceResponseDto, isArray: true })
  findAll(): Promise<ServiceResponseDto[]> {
    return this.servicesService.findAll();
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get a service.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ServiceResponseDto })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.findOne(id);
  }

  @Get('clients/:clientId/services')
  @ApiOperation({ summary: 'List services for a client company.' })
  @ApiParam({ name: 'clientId', format: 'uuid' })
  @ApiResponse({ status: 200, type: ServiceResponseDto, isArray: true })
  findByClient(
    @Param('clientId', new ParseUUIDPipe({ version: '4' })) clientId: string,
  ): Promise<ServiceResponseDto[]> {
    return this.servicesService.findByClient(clientId);
  }

  @Patch('services/:id')
  @ApiOperation({ summary: 'Update a service.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ServiceResponseDto })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.update(id, updateServiceDto, currentUser.sub);
  }

  @Patch('services/:id/suspend')
  @ApiOperation({ summary: 'Suspend a service.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ServiceResponseDto })
  suspend(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.suspend(id, currentUser.sub);
  }

  @Patch('services/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate a service.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ServiceResponseDto })
  reactivate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.reactivate(id, currentUser.sub);
  }

  @Patch('services/:id/cancel')
  @ApiOperation({ summary: 'Cancel a service.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ServiceResponseDto })
  cancel(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.cancel(id, currentUser.sub);
  }
}
