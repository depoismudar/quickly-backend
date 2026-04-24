import { Controller, Get, Inject } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { SessionUser } from '@/modules/auth/models/interfaces/session-user.interface';
import { CurrentUser } from '@/modules/auth/shared/decorators/current-user.decorator';
import { GetCurrentUserDocs } from './docs';
import { GetCurrentUserUseCase, type UserWithActiveTenantContext } from './get-current-user.use-case';

@ApiTags('Users')
@ApiCookieAuth()
@Controller('users')
export class GetCurrentUserController {
	constructor(
		@Inject(GetCurrentUserUseCase)
		private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
	) {}

	@Get('me')
	@GetCurrentUserDocs()
	async execute(@CurrentUser() sessionUser: SessionUser): Promise<UserWithActiveTenantContext> {
		return await this.getCurrentUserUseCase.execute({
			user_id: sessionUser.userId,
			organization_id: sessionUser.activeOrganizationId,
		});
	}
}
