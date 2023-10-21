import { Body, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }
    async signup(@Body() dto: AuthDto) {
        const hash = await argon.hash(dto.password)
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                }
            })
            delete user.hash
            return user
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code = 'P2002') {
                    throw new ForbiddenException('Email already exist')
                }
            }
            throw error;
        }
    }

    async signin(@Body() dto: AuthDto) {
        // find user with email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if (!user) {
            throw new ForbiddenException("User not found")
        }
        // compare password, if pwd doesn't match - throw error
        const pMatch = await argon.verify(user.hash, dto.password)
        if (!pMatch) {
            throw new ForbiddenException("Invalid Credentials")
        }
        return user
    }
}
