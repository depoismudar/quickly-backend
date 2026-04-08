import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { FindAllOrganizationInvitesPaginationDto } from '../models/dto/input/find-all-organization-invites-pagination.dto';
import { OrganizationInvite } from '../models/entities/organization-invite.entity';
import type { OrganizationInvitesRepositoryInterface } from '../models/interfaces/repository.interface';

@Injectable()
export class OrganizationInvitesRepository extends Repository<OrganizationInvite> implements OrganizationInvitesRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(OrganizationInvite, dataSource.createEntityManager());
	}

	async findAllPaginatedByOrganizationId(
		organization_id: string,
		paginationDto: FindAllOrganizationInvitesPaginationDto,
	): Promise<PaginatedResponseDto<OrganizationInvite>> {
		const { page = 1, limit = 10, status, search } = paginationDto;
		const skip = (page - 1) * limit;

		const queryBuilder = this.createQueryBuilder('organization_invite');

		if (search) {
			queryBuilder.andWhere('organization_invite.email ILIKE :search', {
				search: `%${search}%`,
			});
		}

		if (status?.length) {
			queryBuilder.andWhere('organization_invite.status IN (:...status)', { status });
		}

		queryBuilder
			.leftJoinAndSelect('organization_invite.inviter', 'inviter')
			.andWhere('organization_invite.organization_id = :organization_id', { organization_id })
			.skip(skip)
			.take(limit)
			.orderBy('organization_invite.created_at', 'DESC');

		const [data, total] = await queryBuilder.getManyAndCount();

		const total_pages = Math.ceil(total / limit);

		return {
			data,
			page,
			limit,
			total,
			total_pages,
		};
	}

	async findAllPaginatedByInvitedUserId(
		userId: string,
		paginationDto: FindAllOrganizationInvitesPaginationDto,
	): Promise<PaginatedResponseDto<OrganizationInvite>> {
		const { page = 1, limit = 1, status, search } = paginationDto;
		const skip = (page - 1) * limit;

		const queryBuilder = this.createQueryBuilder('organization_invite');

		if (search) {
			queryBuilder.andWhere('organization_invite.email ILIKE :search', {
				search: `%${search}%`,
			});
		}

		if (status?.length) {
			queryBuilder.andWhere('organization_invite.status IN (:...status)', { status });
		}

		queryBuilder
			.leftJoinAndSelect('organization_invite.inviter', 'inviter')
			.leftJoinAndSelect('organization_invite.organization', 'organization')
			.andWhere('organization_invite.invited_user_id = :userId', { userId })
			.skip(skip)
			.take(limit)
			.orderBy('organization_invite.created_at', 'DESC');

		const [data, total] = await queryBuilder.getManyAndCount();

		const total_pages = Math.ceil(total / limit);

		return {
			data,
			page,
			limit,
			total,
			total_pages,
		};
	}
}
