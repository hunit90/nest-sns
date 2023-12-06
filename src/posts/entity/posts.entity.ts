import {Column, Entity, ManyToOne, OneToMany} from "typeorm";
import {UsersModel} from "../../users/entity/users.entity";
import {BaseModel} from "../../common/entity/base.entity";
import {IsString} from "class-validator";
import {stringValidationMessage} from "../../common/validation-message/string-validation.message";
import {Transform} from "class-transformer";
import {POST_PUBLIC_IMAGE_PATH} from "../../common/const/path.const";
import {join} from "path";
import {ImageModel} from "../../common/entity/image.entity";
import {CommentsModel} from "../comments/entity/comments.entity";

@Entity()
export class PostsModel extends BaseModel {
    @ManyToOne(()=> UsersModel, (user) => user.posts, {
        nullable: false,
    })
    author: UsersModel;

    @Column()
    @IsString({
        message: stringValidationMessage,
    })
    title: string;

    @Column()
    @IsString({
        message: stringValidationMessage,
    })
    content: string;


    @Column()
    likeCount: number;

    @Column()
    commentCount: number;

    @OneToMany((type) => ImageModel, (image) => image.post)
    images: ImageModel[]

    @OneToMany(() => CommentsModel, (comment) => comment.post)
    comments: CommentsModel[]
}