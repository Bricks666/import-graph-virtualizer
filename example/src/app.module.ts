import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database';
import { AuthModule } from '@/auth';
import { UsersModule } from '@/users';
import { MoviesModule } from '@/movies';
import { FilesModule } from '@/files';
import { STATIC_DIR, STATIC_PATH } from '@/shared';

const STATIC_DIR_PATH = resolve(__dirname, STATIC_DIR);

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['.env', '.env.local'],
		}),
		DatabaseModule.forRoot({
			isGlobal: true,
		}),
		FilesModule.forRoot({
			dir: STATIC_DIR_PATH,
			clientPath: STATIC_PATH,
		}),
		ServeStaticModule.forRoot({
			rootPath: STATIC_DIR_PATH,
			serveRoot: STATIC_PATH,
		}),
		AuthModule,
		UsersModule,
		MoviesModule
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
