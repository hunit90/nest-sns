import {Column, Entity, ManyToOne} from "typeorm";
import {BaseModel} from "../../../common/entity/base.entity";
import {UsersModel} from "../../../users/entity/users.entity";
import {IsNumber, IsString} from "class-validator";
import {stringValidationMessage} from "../../../common/validation-message/string-validation.message";
import {PostsModel} from "../../entity/posts.entity";

@Entity()
export class CommentsModel extends BaseModel {
    @ManyToOne(() => UsersModel, (user) => user.postComments, {
        nullable: false,
    })
    author: UsersModel;

    @ManyToOne(() => PostsModel, (post) => post.comments)
    post: PostsModel;

    @Column()
    @IsString()
    comment: string;

    @Column({
        default: 0
    })
    @IsNumber()
    likeCount: number;

}