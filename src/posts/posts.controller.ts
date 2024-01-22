import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put, UseGuards, Request, Patch
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {AccessTokenGuard} from "../auth/guard/bearer-token.guard";
import {UsersModel} from "../users/entities/users.entity";
import {User} from "../users/decorator/user.decorator";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";


@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.getAllPosts()
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id)
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  postPosts(
      @User('id') userId: number,
      @Body() body: CreatePostDto
  ) {
    return this.postsService.createPost(
        userId, body
    )
  }

  @Patch(':id')
  patchPost(
      @Param('id', ParseIntPipe) id: number,
      @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(
        id, body
    )
  }

  @Delete(':id')
  deletePost(
      @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.deletePost(id)
  }
}
