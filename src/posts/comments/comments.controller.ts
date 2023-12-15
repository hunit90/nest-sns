import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {PaginateCommentsDto} from "./dto/paginate-comments.dto";
import {AccessTokenGuard} from "../../auth/guard/bearer-token.guard";
import {CreateCommentsDto} from "./dto/create-comments.dto";
import {UsersModel} from "../../users/entity/users.entity";
import {User} from "../../users/decorator/user.decorator";
import {UpdateCommentDto} from "./dto/update-comment.dto";
import {IsPublic} from "../../common/decorator/is-public.decorator";

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {
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
  postComment(
      @Param('postId', ParseIntPipe) postId: number,
      @Body() body: CreateCommentsDto,
      @User() user: UsersModel,
  ) {
    return this.commentsService.createComment(
        body,
        postId ,
        user,
    )
  }

  @Patch(':commentId')
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
  async deleteComment(
      @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.deleteComment(commentId)
  }

}
