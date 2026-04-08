import type { Repository } from 'typeorm';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { FindAllOrganizationInvitesPaginationDto } from '../dto/input/find-all-organization-invites-pagination.dto';
import type { OrganizationInvite } from '../entities/organization-invite.entity';

export interface OrganizationInvitesRepositoryInterface extends Repository<OrganizationInvite> {
	findAllPaginatedByOrganizationId(
		organization_id: string,
		paginationDto: FindAllOrganizationInvitesPaginationDto,
	): Promise<PaginatedResponseDto<OrganizationInvite>>;
	findAllPaginatedByInvitedUserId(userId: string, paginationDto: FindAllOrganizationInvitesPaginationDto): Promise<PaginatedResponseDto<OrganizationInvite>>;
}
