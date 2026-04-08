import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SessionUser } from '@/modules/auth/models/interfaces/session-user.interface';
import { CurrentUser } from '@/modules/auth/shared/decorators/current-user.decorator';
import { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import { FindAllOrganizationInvitesPaginationDto } from '../../models/dto/input/find-all-organization-invites-pagination.dto';
import { OrganizationInviteDto } from '../../models/dto/output/organization-invite.dto';
import { ListReceivedOrganizationInvitesDocs } from './docs';
import { ListReceivedOrganizationInvitesUseCase } from './list-received-organization-invites.use-case';

@ApiTags('Organization Invites')
@ApiCookieAuth()
@Controller('organization-invites')
export class ListReceivedOrganizationInvitesController {
	constructor(
		@Inject(ListReceivedOrganizationInvitesUseCase)
		private readonly listReceivedOrganizationInvitesUseCase: ListReceivedOrganizationInvitesUseCase,
	) {}

	@Get('received')
	@ListReceivedOrganizationInvitesDocs()
	async execute(
		@CurrentUser() currentUser: SessionUser,
		@Query() paginationDto: FindAllOrganizationInvitesPaginationDto,
	): Promise<PaginatedResponseDto<OrganizationInviteDto>> {
		return await this.listReceivedOrganizationInvitesUseCase.execute(currentUser.userId, paginationDto);
	}
}
