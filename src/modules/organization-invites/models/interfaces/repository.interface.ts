import type { Repository } from 'typeorm';
import type { PaginatedResponseDto, PaginationDto } from '@/shared/dto/pagination.dto';
import type { OrganizationInvite } from '../entities/organization-invite.entity';

export interface OrganizationInvitesRepositoryInterface extends Repository<OrganizationInvite> {
	findAllPaginatedByOrganizationId(organization_id: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<OrganizationInvite>>;
	findAllPaginatedByInvitedUserId(userId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<OrganizationInvite>>;
}
