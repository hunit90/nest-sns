import {
  Body,
  ClassSerializerInterceptor,
  Controller, DefaultValuePipe, Delete,
  Get,
  Param, ParseBoolPipe,
  ParseIntPipe, Patch,
  Post, Query,
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
      @Query('includeNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe) includeNotConfirmed: boolean,
  ) {
    return this.usersService.getFollowers(user.id, includeNotConfirmed)
  }

  @Post('follow/:id')
  async postFollow(
      @User() user: UsersModel,
      @Param('id', ParseIntPipe) followeeId: number,
  ) {
    await this.usersService.followUser(
        user.id,
        followeeId,
    )

    return true;
  }

  @Patch('follow/:id/confirm')
  async patchFollowConfirm (
      @User() user: UsersModel,
      @Param('id', ParseIntPipe) followerId: number,
  ) {
    this.usersService.confirmFollow(followerId, user.id);

    return true;
  }

  @Delete('follow/:id')
  async  deleteFollow(
      @User() user: UsersModel,
      @Param('id', ParseIntPipe) followeeId: number,
  ) {
    await this.usersService.deleteFollow(
        user.id,
        followeeId,
    )

    return true;
  }
}
