import {
    Column,
    CreateDateColumn,
    Entity, JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {RolesEnum} from "../const/roles.const";
import {PostsModel} from "../../posts/entity/posts.entity";
import {BaseModel} from "../../common/entity/base.entity";
import {IsEmail, IsString, Length, ValidationArguments} from "class-validator";
import {lengthValidationMessage} from "../../common/validation-message/length-validation.message";
import {stringValidationMessage} from "../../common/validation-message/string-validation.message";
import {emailValidationMessage} from "../../common/validation-message/email-validation.message";
import {Exclude} from "class-transformer";
import {ChatsModel} from "../../chats/entity/chats.entity";
import {MessagesModel} from "../../chats/messages/entity/messages.entity";
import {CommentsModel} from "../../posts/comments/entity/comments.entity";
import {UserFollowersModel} from "./user-followers.entity";

@Entity()
export class UsersModel extends BaseModel {
    @Column({
        length: 20,
        unique: true,
    })
    @IsString({
        message: stringValidationMessage,
    })
    @Length(1, 20, {
        message: lengthValidationMessage,
    })
    nickname: string;

    @Column({
        unique: true
    })
    @IsString({
        message: stringValidationMessage,
    })
    @IsEmail({}, {
        message: emailValidationMessage,
    })
    email: string;

    @Column()
    @IsString({
        message: stringValidationMessage,
    })
    @Length(3, 8, {
        message: lengthValidationMessage,
    })
    @Exclude({
        toPlainOnly: true,
    })
    password: string;

    @Column({
        enum: Object.values(RolesEnum),
        default: RolesEnum.USER,
    })
    role: RolesEnum;

    @OneToMany(() => PostsModel, (post) => post.author)
    posts: PostsModel[];

    @OneToMany(() => CommentsModel, (comment) => comment.author)
    postComments: CommentsModel[];

    @ManyToMany(() => ChatsModel, (chat) => chat.users)
    @JoinTable()
    chats: ChatsModel[];

    @OneToMany(() => MessagesModel, (message) => message.author)
    messages: MessagesModel;

    @OneToMany(() => UserFollowersModel, (ufm) => ufm.follower)
    followers: UserFollowersModel[]

    @OneToMany(() => UserFollowersModel, (ufm) => ufm.followee)
    followees: UserFollowersModel[]

    @Column({
        default: 0
    })
    followerCount: number;

    @Column({
        default: 0
    })
    followeeCount: number;
}