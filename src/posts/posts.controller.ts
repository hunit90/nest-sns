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
  Put, UseGuards, Request
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {AccessTokenGuard} from "../auth/guard/bearer-token.guard";


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
      @Request() req: any,
      @Body('title') title: string,
      @Body('content') content: string,
  ) {
    const authorId = req.user.id

    return this.postsService.createPost(
        authorId, title, content
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
    return this.postsService.deletePost(id)
  }
}
