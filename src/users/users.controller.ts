import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors
} from '@nestjs/common';
import { UsersService } from './users.service';
import {User} from "./decorator/user.decorator";
import {UsersModel} from "./entity/users.entity";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // postUser(@Body('nickname') nickname: string,
  //          @Body('email') email: string,
  //          @Body('password') password: string) {
  //   return this.usersService.createUser({
  //     nickname,
  //     email,
  //     password,
  //   });
  // }

  @Get()
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('follow')
  async getFollow(
      @User() user: UsersModel,
  ) {
    return this.usersService.getFollowers(user.id)
  }

  @Post('follow/:id')
  async postFollow(
      @User() user: UsersModel,
      @Param('id', ParseIntPipe) followeeId: number,
  ) {
    await this.usersService.follwUser(
        user.id,
        followeeId,
    )

    return true;
  }
}
