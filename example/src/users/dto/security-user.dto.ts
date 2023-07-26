import { OmitType } from '@nestjs/swagger';
import { User } from '../entities';

export class SecurityUserDto extends OmitType(User, ['password']) {}
