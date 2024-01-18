import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {JwtModule} from "@nestjs/jwt";
import {UsersModel} from "../users/entities/users.entity";
import {UsersService} from "../users/users.service";
import {UsersModule} from "../users/users.module";

@Module({
  imports: [
      JwtModule.register({}),
      UsersModule,
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
