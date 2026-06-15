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
import { ClientUserResponseDto } from './dto/client-user-response.dto';
import { CreateClientUserDto } from './dto/create-client-user.dto';
import { UpdateClientUserDto } from './dto/update-client-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.GOOWIN_ADMIN, UserRole.GOOWIN_EDITOR)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('clients/:clientId/users')
  @ApiOperation({ summary: 'Create a client user for a client company.' })
  @ApiParam({ name: 'clientId', format: 'uuid' })
  @ApiResponse({ status: 201, type: ClientUserResponseDto })
  createClientUser(
    @Param('clientId', new ParseUUIDPipe({ version: '4' })) clientId: string,
    @Body() createClientUserDto: CreateClientUserDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ClientUserResponseDto> {
    return this.usersService.createClientUser(
      clientId,
      createClientUserDto,
      currentUser.sub,
    );
  }

  @Get('clients/:clientId/users')
  @ApiOperation({ summary: 'List users for a client company.' })
  @ApiParam({ name: 'clientId', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClientUserResponseDto, isArray: true })
  findClientUsers(
    @Param('clientId', new ParseUUIDPipe({ version: '4' })) clientId: string,
  ): Promise<ClientUserResponseDto[]> {
    return this.usersService.findClientUsers(clientId);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get a client user.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClientUserResponseDto })
  findClientUser(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ClientUserResponseDto> {
    return this.usersService.findClientUser(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a client user.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClientUserResponseDto })
  updateClientUser(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateClientUserDto: UpdateClientUserDto,
  ): Promise<ClientUserResponseDto> {
    return this.usersService.updateClientUser(id, updateClientUserDto);
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a client user.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: ClientUserResponseDto })
  deactivateClientUser(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ClientUserResponseDto> {
    return this.usersService.deactivateClientUser(id, currentUser.sub);
  }
}
