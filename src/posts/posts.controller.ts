import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query, UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {PostsService} from './posts.service';
import {AccessTokenGuard} from "../auth/guard/bearer-token.guard";
import {UsersModel} from "../users/entity/users.entity";
import {User} from "../users/decorator/user.decorator";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";
import {PaginatePostDto} from "./dto/paginate-post.dto";
import {ImageModelType} from "../common/entity/image.entity";
import {DataSource, QueryRunner as QR} from "typeorm";
import {PostsImagesService} from "./iamge/images.service";
import {LogInterceptor} from "../common/interceptor/log.interceptor";
import {TransactionInterceptor} from "../common/interceptor/transaction.interceptor";
import {QueryRunner} from "../common/decorator/query-runner.decorator";
import {HttpExceptionFilter} from "../common/exception-filter/http.exception-filter";
import {RolesEnum} from "../users/const/roles.const";
import {Roles} from "../users/decorator/roles.decorator";
import {IsPublic} from "../common/decorator/is-public.decorator";


@Controller('posts')
export class PostsController {
  constructor(
      private readonly postsService: PostsService,
      private readonly postsImagesService: PostsImagesService,
      private readonly dataSource: DataSource,
  ) {}

  @Get()
  @IsPublic()
  // @UseInterceptors(LogInterceptor)
  getPosts(
      @Query() query: PaginatePostDto,
  ) {
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  async postPostRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);

    return true;
  }

  @Get(':id')
  @IsPublic()
  getPost(@Param('id', ParseIntPipe) id: number) {
    return  this.postsService.getPostById(id);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postPost(
      @User('id') userId: number,
      @Body() body: CreatePostDto,
      @QueryRunner() qr: QR,
  ) {
      const post = await this.postsService.createPost(
          userId, body, qr
      )
      for (let i = 0; i < body.images.length; i++) {
        await this.postsImagesService.createPostImage({
          post,
          order: i,
          path: body.images[i],
          type: ImageModelType.POST_IMAGE,
        }, qr);
      }

      return this.postsService.getPostById(post.id, qr)
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
  @Roles(RolesEnum.ADMIN)
  deletePost(
      @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.deletePost(id);
  }
}
