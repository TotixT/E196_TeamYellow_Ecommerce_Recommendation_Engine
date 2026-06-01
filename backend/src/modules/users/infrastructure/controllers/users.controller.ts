import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { ToggleUserStatusUseCase } from '../../application/use-cases/toggle-user-status.use-case';
import { UpdateProfileDto } from '../../application/dtos/update-profile.dto';
import { ChangePasswordDto } from '../../application/dtos/change-password.dto';
import { UsersQueryDto } from '../../application/dtos/users-query.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly toggleUserStatusUseCase: ToggleUserStatusUseCase,
  ) {}

  // EIE-004: GET /api/v1/users/me
  @Get('users/me')
  getProfile(@CurrentUser() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.getProfileUseCase.execute(user.id);
  }

  // EIE-004 escenario 1: PUT /api/v1/users/me
  @Put('users/me')
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.updateProfileUseCase.execute(user.id, dto);
  }

  // EIE-004 escenarios 2 y 3: PUT /api/v1/users/me/password
  @Put('users/me/password')
  @HttpCode(HttpStatus.OK)
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.changePasswordUseCase.execute(user.id, dto);
  }

  // EIE-005 escenario 1: GET /api/v1/admin/users  (admin only)
  @Get('admin/users')
  @Roles('admin')
  @UseGuards(RolesGuard)
  listUsers(@Query() query: UsersQueryDto) {
    return this.listUsersUseCase.execute(query);
  }

  // EIE-005 escenario 3: PATCH /api/v1/admin/users/:id/activate  (admin only)
  @Patch('admin/users/:id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RolesGuard)
  activateUser(@Param('id', ParseIntPipe) id: number) {
    return this.toggleUserStatusUseCase.execute(id, 'activate');
  }

  // EIE-005 escenario 2: PATCH /api/v1/admin/users/:id/deactivate  (admin only)
  @Patch('admin/users/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RolesGuard)
  deactivateUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.toggleUserStatusUseCase.execute(
      id,
      'deactivate',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      currentUser.id,
    );
  }
}
