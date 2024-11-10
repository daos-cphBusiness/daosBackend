import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findByUsername(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  //   async signUp(email: string, username: string, pass: string) {
  //     const existingUser = await this.usersService.create(email, username);
  //     if (existingUser) {
  //       throw new Error('Email or username is already taken');
  //     }
  //TODO
  // need too add sign up
  //also use the create user dto for sign up that alredy exists
  // create a sign in DTO for the existing sign in function
}
