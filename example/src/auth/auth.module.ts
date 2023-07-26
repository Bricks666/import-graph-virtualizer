import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UsersModule } from '@/users';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [UsersModule, JwtModule],
	exports: [AuthService],
})
export class AuthModule {}
