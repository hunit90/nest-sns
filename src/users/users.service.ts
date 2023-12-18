import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UsersModel} from "./entity/users.entity";
import {Repository} from "typeorm";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersModel)
        private readonly usersRepository: Repository<UsersModel>
    ) {}

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

    async follwUser(followerId: number, followeeId: number) {
        const user = await this.usersRepository.findOne({
            where: {
                id: followerId,
            },
            relations: {
                followees: true,
            }
        })

        if (!user) {
            throw new BadRequestException(
                '존재하지 않는 팔로워입니다.',
            )
        }

        await this.usersRepository.save({
            ...user,
            followees: [
                ...user.followees,
                {
                    id:followerId,
                }
            ]
        })
    }

    async getFollowers(userId: number): Promise<UsersModel[]> {
        const user = await this.usersRepository.findOne({
            where: {
                id: userId,
            },
            relations: {
                followers: true,
            }
        })

        return user.followers;
    }
}
