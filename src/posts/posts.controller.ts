import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {AccessTokenGuard} from "../auth/guard/bearer-token.guard";
import {UsersModel} from "../users/entities/users.entity";
import {User} from "../users/decorator/user.decorator";



@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return  this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  postPost(
      @User('id') userId: number,
      @Body('title') title: string,
      @Body('content') content: string,
  ) {

    return this.postsService.createPost(
        userId, title, content
    )
  }
  @Put(':id')
  putPost(
      @Param('id', ParseIntPipe) id: number,
      @Body('title') title?: string,
      @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(
        id, title, content
    )
  }

  @Delete(':id')
  deletePost(
      @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.deletePost(id);
  }
}
