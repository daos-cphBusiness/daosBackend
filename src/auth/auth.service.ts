import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { User } from 'src/users/schemas/user.schema';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const { username, password } = signInDto;

    const user = await this.validateUser(username, password);

    const payload = { username: user.username };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async signUp(createUserDto: CreateUserDto): Promise<User | null> {
    const { username, email } = createUserDto;
    const uniqueEmailCheck = await this.usersService.findByEmail(email);
    const uniqueUsernameCheck =
      await this.usersService.findByUsername(username);

    if (uniqueEmailCheck || uniqueUsernameCheck) {
      throw new Error('Email or Username is already taken');
    } else {
      const user = this.usersService.createUser(createUserDto);
      if (!user) {
        console.log('User could not be created');
      }
      return user;
    }
  }
}
