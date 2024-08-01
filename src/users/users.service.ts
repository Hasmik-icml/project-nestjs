import { BadRequestException, Injectable } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from './../prisma/prisma.service';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }

  signup(user: Partial<User>) {
    const hashedPassword = this.hashPassword(user.password);

    const userExists = this.prismaService.user.findUnique({ where: { email: user.email } });

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    return this.prismaService.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
      }
    });
  }

  async signin(user: Partial<User>) {
    const userExists = await this.prismaService.user.findFirst({ where: { email: user.email } });

    if (!userExists) {
      throw new BadRequestException('Invalid email or password');
    }

    const validPassword = bcrypt.compare(user.password, userExists.password);

    if (!validPassword) {
      throw new BadRequestException('Invalid email or password');
    }

    const accessToken = jwt.sign(
      { userId: userExists.id, email: userExists.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { userId: userExists.id, email: userExists.email },
      process.env.JWT_REFRESH_KEY!,
      { expiresIn: '1d' }
    );

    await this.prismaService.token.upsert({
      where: { token: refreshToken }, 
      update: {
        expiryDate: new Date(),
        userId: userExists.id, 
      },
      create: {
        token: refreshToken,
        expiryDate: new Date(),
        userId: userExists.id,
      },
    });

    return { accessToken, refreshToken };
  }
  findAll() {
    return `This action returns all users`;
  }

  findOne(idOrEmail: string) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [
          { id: idOrEmail },
          { email: idOrEmail },
        ]
      }
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return this.prismaService.user.delete({ where: { id } });
  }

  private hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
  }
}
