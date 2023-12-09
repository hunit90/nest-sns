import {Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {PaginateCommentsDto} from "../../common/dto/paginate-comments.dto";
import {AccessTokenGuard} from "../../auth/guard/bearer-token.guard";
import {CreateCommentsDto} from "./dto/create-comments.dto";
import {UsersModel} from "../../users/entity/users.entity";
import {User} from "../../users/decorator/user.decorator";

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {
  }

  @Get()
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
  getComment(
      @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
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
}
