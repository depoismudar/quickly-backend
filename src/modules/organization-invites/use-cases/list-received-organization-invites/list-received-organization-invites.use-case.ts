import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { PaginatedResponseDto, PaginationDto } from '@/shared/dto/pagination.dto';
import type { OrganizationInviteDto } from '../../models/dto/output/organization-invite.dto';
import type { OrganizationInvitesRepositoryInterface } from '../../models/interfaces/repository.interface';
import { ORGANIZATION_INVITE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

const isOrganizationInviteDto = (organizationInvite: OrganizationInviteDto): boolean => {
	return 'inviter' in organizationInvite && 'organization' in organizationInvite;
};

@Injectable()
export class ListReceivedOrganizationInvitesUseCase {
	constructor(
		@Inject(ORGANIZATION_INVITE_REPOSITORY_INTERFACE_KEY)
		private readonly organizationInvitesRepository: OrganizationInvitesRepositoryInterface,
	) {}

	async execute(userId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<OrganizationInviteDto>> {
		const result = await this.organizationInvitesRepository.findAllPaginatedByInvitedUserId(userId, paginationDto);

		const mappedData = result.data.map((organizationInvite) => {
			if (!isOrganizationInviteDto(organizationInvite))
				throw new InternalServerErrorException('Organization invite is not a OrganizationInviteDto');

			return organizationInvite;
		});

		return {
			...result,
			data: mappedData,
		};
	}
}
