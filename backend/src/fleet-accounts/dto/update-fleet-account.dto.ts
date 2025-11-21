import { PartialType } from '@nestjs/mapped-types';
import { CreateFleetAccountDto } from './create-fleet-account.dto';

export class UpdateFleetAccountDto extends PartialType(CreateFleetAccountDto) {}
