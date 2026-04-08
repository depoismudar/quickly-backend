import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import type { PaginatedResponseDto, PaginationDto } from '@/shared/dto/pagination.dto';
import { Organization } from '../models/entities/organization.entity';
import type { OrganizationsRepositoryInterface } from '../models/interfaces/repository.interface';

@Injectable()
export class OrganizationsRepository extends Repository<Organization> implements OrganizationsRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(Organization, dataSource.createEntityManager());
	}

	async findAllPaginated(user_id: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Organization>> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const queryBuilder = this.createQueryBuilder('organization')
			.leftJoinAndSelect('organization.owner', 'owner')
			.leftJoin('organization.organization_members', 'organization_member_count', 'organization_member_count.active = true')
			.addSelect('COUNT(organization_member_count.id)', 'members_count');

		this.applyAccessibleOrganizationsFilter(queryBuilder, user_id);

		queryBuilder
			.groupBy('organization.id')
			.addGroupBy('owner.id')
			.orderBy('members_count', 'DESC')
			.addOrderBy('organization.created_at', 'DESC')
			.addOrderBy('organization.id', 'DESC')
			.skip(skip)
			.take(limit);

		const { entities, raw } = await queryBuilder.getRawAndEntities();
		const data = entities.map((organization, index) => {
			const membersCountRaw = raw[index]?.members_count;
			const membersCount = typeof membersCountRaw === 'string' ? Number(membersCountRaw) : 0;
			return Object.assign(organization, { members_count: membersCount });
		});

		const totalQueryBuilder = this.createQueryBuilder('organization');
		this.applyAccessibleOrganizationsFilter(totalQueryBuilder, user_id);
		const total = await totalQueryBuilder.getCount();

		const total_pages = Math.ceil(total / limit);

		return {
			data,
			page,
			limit,
			total,
			total_pages,
		};
	}

	private applyAccessibleOrganizationsFilter(queryBuilder: ReturnType<OrganizationsRepository['createQueryBuilder']>, user_id: string): void {
		queryBuilder.where('organization.owner_id = :user_id', { user_id }).orWhere((subQuery) => {
			const memberSubQuery = subQuery
				.subQuery()
				.select('1')
				.from('organization_members', 'organization_member')
				.where('organization_member.organization_id = organization.id')
				.andWhere('organization_member.user_id = :user_id')
				.andWhere('organization_member.active = true')
				.getQuery();

			return `EXISTS ${memberSubQuery}`;
		});
	}
}
