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
import { ChangeClientCommercialStatusDto } from './dto/change-client-commercial-status.dto';
import { ClientResponseDto } from './dto/client-response.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientsService } from './clients.service';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.GOOWIN_ADMIN, UserRole.GOOWIN_EDITOR)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a client company.' })
  @ApiResponse({ status: 201, type: ClientResponseDto })
  create(
    @Body() createClientDto: CreateClientDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ClientResponseDto> {
    return this.clientsService.create(createClientDto, currentUser.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List client companies.' })
  @ApiResponse({ status: 200, type: ClientResponseDto, isArray: true })
  findAll(): Promise<ClientResponseDto[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client company.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClientResponseDto })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ClientResponseDto> {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client company.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClientResponseDto })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    return this.clientsService.update(id, updateClientDto);
  }

  @Patch(':id/commercial-status')
  @ApiOperation({
    summary: 'Change the commercial status of a client company.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClientResponseDto })
  changeCommercialStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() changeClientCommercialStatusDto: ChangeClientCommercialStatusDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ClientResponseDto> {
    return this.clientsService.changeCommercialStatus(
      id,
      changeClientCommercialStatusDto,
      currentUser.sub,
    );
  }
}
