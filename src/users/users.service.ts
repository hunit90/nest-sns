import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UsersModel} from "./entity/users.entity";
import {QueryRunner, Repository} from "typeorm";
import {UserFollowersModel} from "./entity/user-followers.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersModel)
        private readonly usersRepository: Repository<UsersModel>,
        @InjectRepository(UserFollowersModel)
        private readonly userFollowersRepository: Repository<UserFollowersModel>,
    ) {}

    getUsersRepository(qr?: QueryRunner) {
        return qr ? qr.manager.getRepository<UsersModel>(UsersModel) : this.usersRepository;
    }

    getUserFollowRepository(qr?: QueryRunner){
        return qr ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel) : this.userFollowersRepository
    }

    async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
        const nicknameExists = await this.usersRepository.exist({
            where: {
                nickname: user.nickname,
            }
        });

        if (nicknameExists) {
            throw new BadRequestException('이미 존재하는 nickname 입니다.');
        }

        const emailExists = await this.usersRepository.exist({
            where: {
                email: user.email,
            }
        })

        if (emailExists) {
            throw new BadRequestException('이미 가입한 이메일 입니다.')
        }

        const userObject = this.usersRepository.create({
            nickname: user.nickname,
            email: user.email,
            password: user.password,
        });

        const newUser = await this.usersRepository.save(userObject);

        return newUser;
    }

    async getAllUsers() {
        return this.usersRepository.find();
    }

    async getUserByEmail(email: string) {
        return this.usersRepository.findOne({
            where: {
                email,
            }
        })
    }

    async followUser(followerId: number, followeeId: number, qr?: QueryRunner) {
        const userFollowersRepository = this.getUserFollowRepository(qr);

        await userFollowersRepository.save({
            follower: {
                id: followerId,
            },
            followee: {
                id: followeeId,
            }
        })

        return true
    }

    async getFollowers(userId: number, includeNotConfirmed: boolean) {
        const where = {
            followee: {
                id: userId,
            }
        }

        if(!includeNotConfirmed) {
            where['isConfirmed'] = true;
        }
        const result = await this.userFollowersRepository.find({
            where: {
                followee: {
                    id: userId,
                }
            },
            relations: {
                follower: true,
                followee: true,
            }
        })

        return result.map((x) => ({
            id: x.follower.id,
            nickname: x.follower.nickname,
            email: x.follower.email,
            isConfirmed: x.isConfirmed,
        }));
    }

    async confirmFollow(followerId: number, followeeId: number, qr?: QueryRunner) {
        const userFollowersRepository = this.getUserFollowRepository(qr);

        const existing = await userFollowersRepository.findOne({
            where: {
                follower: {
                    id: followerId,
                },
                followee: {
                    id: followeeId,
                },
            },
            relations: {
                follower: true,
                followee: true,
            },
        })

        if (!existing) {
            throw new BadRequestException(
                '존재하지 않는 팔로우 요청입니다.'
            )
        }

        await userFollowersRepository.save({
            ...existing,
            isConfirmed: true,
        })

        return true;
    }

    async deleteFollow(
        followerId: number,
        followeeId: number,
        qr?: QueryRunner,
    ) {
        const userFollowersRepository = this.getUserFollowRepository(qr)

        await userFollowersRepository.delete({
            follower: {
                id: followerId,
            },
            followee: {
                id: followeeId,
            }
        })

        return true;
    }

    async incrementFollowerCount(userId: number, qr?: QueryRunner) {
        const userRepository = this.getUsersRepository(qr)

        await userRepository.increment({
            id: userId,
        }, 'followerCount', 1)
    }

    async decrementFollowerCount(userId: number, qr?: QueryRunner) {
        const userRepository = this.getUsersRepository(qr)

        await userRepository.decrement({
            id: userId,
        }, 'followerCount', 1)
    }
}
