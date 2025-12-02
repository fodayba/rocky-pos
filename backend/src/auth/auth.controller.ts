import { Controller, Post, Get, Body, UseGuards, Patch, Param, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SignupDto } from './dto/signup.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User, UserRole } from '../schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user._id.toString());
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get('users/:id/preferences')
  @UseGuards(JwtAuthGuard)
  async getUserPreferences(@Param('id') userId: string, @CurrentUser() user: User) {
    // Users can only access their own preferences unless they're admin
    if (userId !== user._id.toString() && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Cannot access other user preferences');
    }
    return this.authService.getUserPreferences(userId);
  }

  @Patch('users/:id/preferences')
  @UseGuards(JwtAuthGuard)
  async updateUserPreferences(
    @Param('id') userId: string,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
    @CurrentUser() user: User,
  ) {
    // Users can only update their own preferences unless they're admin
    if (userId !== user._id.toString() && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Cannot update other user preferences');
    }
    return this.authService.updateUserPreferences(userId, updatePreferencesDto.locale);
  }
}
