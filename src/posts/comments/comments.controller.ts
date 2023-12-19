import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {PaginateCommentsDto} from "./dto/paginate-comments.dto";
import {AccessTokenGuard} from "../../auth/guard/bearer-token.guard";
import {CreateCommentsDto} from "./dto/create-comments.dto";
import {UsersModel} from "../../users/entity/users.entity";
import {User} from "../../users/decorator/user.decorator";
import {UpdateCommentDto} from "./dto/update-comment.dto";
import {IsPublic} from "../../common/decorator/is-public.decorator";
import {IsCommentMineOrAdminGuard} from "./guard/is-comment-mine-or-admin.guard";
import {TransactionInterceptor} from "../../common/interceptor/transaction.interceptor";
import {QueryRunner} from "../../common/decorator/query-runner.decorator";
import {QueryRunner as QR} from "typeorm"
import {PostsService} from "../posts.service";

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService,
              private readonly postsService: PostsService) {
  }

  @Get()
  @IsPublic()
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PaginateCommentsDto,
  ) {
    return this.commentsService.paginateComments(
        query,
        postId,
    )
  }

  @Get(':commentId')
  @IsPublic()
  getComment(
      @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postComment(
      @Param('postId', ParseIntPipe) postId: number,
      @Body() body: CreateCommentsDto,
      @User() user: UsersModel,
      @QueryRunner() qr: QR,
  ) {
    const res = await this.commentsService.createComment(
        body,
        postId ,
        user,
        qr,
    )

    await this.postsService.incrementCommentCount(
        postId,
        qr,
    )

    return res;
  }

  @Patch(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  async patchComment(
      @Param('commentId', ParseIntPipe) commentId: number,
      @Body() body: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(
        body,
        commentId,
    )
  }

  @Delete(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  @UseInterceptors(TransactionInterceptor)
  async deleteComment(
      @Param('commentId', ParseIntPipe) commentId: number,
      @Param('postId', ParseIntPipe) postId: number,
      @QueryRunner() qr: QR,
  ) {
    const res = this.commentsService.deleteComment(commentId)

    await this.postsService.decrementCommentCount(postId, qr)

    return res
  }

}
