import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards,} from '@nestjs/common';
import {PostsService} from './posts.service';
import {AccessTokenGuard} from "../auth/guard/bearer-token.guard";
import {UsersModel} from "../users/entities/users.entity";
import {User} from "../users/decorator/user.decorator";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate-post.dto";
import {ImageModelType} from "../common/entity/image.entity";
import {DataSource} from "typeorm";
import {PostsImagesService} from "./iamge/images.service";


@Controller('posts')
export class PostsController {
  constructor(
      private readonly postsService: PostsService,
      private readonly postsImagesService: PostsImagesService,
      private readonly dataSource: DataSource,
  ) {}

  @Get()
  getPosts(
      @Query() query: PaginatePostDto,
  ) {
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);

    return true;
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return  this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async postPost(
      @User('id') userId: number,
      @Body() body: CreatePostDto,
  ) {
    const qr = this.dataSource.createQueryRunner();

    await qr.connect();

    await qr.startTransaction();

    try {
      const post = await this.postsService.createPost(
          userId, body,
      )
      for (let i = 0; i < body.images.length; i++) {
        await this.postsImagesService.createPostImage({
          post,
          order: i,
          path: body.images[i],
          type: ImageModelType.POST_IMAGE,
        });
      }

      await qr.commitTransaction();

      return this.postsService.getPostById(post.id)
    } catch (e) {
      await qr.rollbackTransaction();
      await qr.release();
    }
  }
  @Patch(':id')
  patchPost(
      @Param('id', ParseIntPipe) id: number,
      @Body() body: UpdatePostDto
  ) {
    return this.postsService.updatePost(
        id, body
    )
  }

  @Delete(':id')
  deletePost(
      @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.deletePost(id);
  }
}
