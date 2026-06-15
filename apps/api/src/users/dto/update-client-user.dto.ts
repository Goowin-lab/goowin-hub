import { PartialType } from '@nestjs/swagger';

import { CreateClientUserDto } from './create-client-user.dto';

export class UpdateClientUserDto extends PartialType(CreateClientUserDto) {}
