import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { User } from 'src/users/schemas/user.schema';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    signInDto: SignInDto,
  ): Promise<{ user: User; access_token: string }> {
    const { username, password } = signInDto;
    const user = await this.validateUser(username, password);

    const payload = { username: user.username }; //creating a JavaScript object named payload with a single property username,
    //  and its value is set to the username property of the user object.
    const access_token = await this.jwtService.signAsync(payload);

    return { user, access_token };
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async signUp(createUserDto: CreateUserDto): Promise<User | null> {
    const { username, email } = createUserDto;

    await this.usersService.findByEmailWithConflictCheck(email);

    await this.usersService.findByUsernameWithConflictCheck(username);

    const user = this.usersService.createUser(createUserDto);
    if (!user) {
      console.log('User could not be created');
    }
    return user;
  }
}
