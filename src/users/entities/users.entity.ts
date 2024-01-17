import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {RolesEnum} from "../const/roles.const";
import {PostsModel} from "../../posts/entities/posts.entity";

@Entity()
export class UsersModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 20,
        unique: true,
    })
    nickname: string;

    @Column({
        unique: true,
    })
    email: string;

    @Column()
    password: string;

    @Column({
        enum: Object.values(RolesEnum),
        default: RolesEnum.USER,
    })
    role: RolesEnum;

    @OneToMany(() => PostsModel, (post) => post.author)
    posts: PostsModel[];

    @UpdateDateColumn()
    updatedAt: Date

    @CreateDateColumn()
    createdAt: Date;
}