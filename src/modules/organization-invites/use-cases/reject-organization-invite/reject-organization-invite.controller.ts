import { Controller, Inject, Param, Patch } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SessionUser } from '@/modules/auth/models/interfaces/session-user.interface';
import { CurrentUser } from '@/modules/auth/shared/decorators/current-user.decorator';
import { RejectOrganizationInviteDocs } from './docs';
import { RejectOrganizationInviteUseCase } from './reject-organization-invite.use-case';

@ApiTags('Organization Invites')
@ApiCookieAuth()
@Controller('organization-invites')
export class RejectOrganizationInviteController {
	constructor(
		@Inject(RejectOrganizationInviteUseCase)
		private readonly rejectOrganizationInviteUseCase: RejectOrganizationInviteUseCase,
	) {}

	@Patch(':id/reject')
	@RejectOrganizationInviteDocs()
	async execute(@Param('id') id: string, @CurrentUser() currentUser: SessionUser): Promise<void> {
		return await this.rejectOrganizationInviteUseCase.execute(id, currentUser.userId);
	}
}
