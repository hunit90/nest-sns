import {Controller, Get, Param, ParseIntPipe, Query} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {PaginateCommentsDto} from "../../common/dto/paginate-comments.dto";

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
}
