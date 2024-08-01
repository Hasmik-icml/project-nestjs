import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Res, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signup(createUserDto);
  }

  @Post('signin')
 async login(@Body() loginUserDto: LoginDto) {
    try {
      console.log("loginUserDto");
      const tokens = await this.usersService.signin(loginUserDto);

      // Best way to use httponly
      return {
        message: 'Login successful',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }
    } catch (error) {
      throw new BadRequestException('Invalid email or password');

    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':idOrEmail')
  findOne(@Param('idOrEmail') idOrEmail: string) {
    return this.usersService.findOne(idOrEmail);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
