import { Inject, Injectable } from '@nestjs/common';
import { GetExistingOrganizationUseCase } from '@/modules/organizations/use-cases/get-existing-organization/get-existing-organization.use-case';
import { GetExistingUserUseCase } from '@/modules/users/use-cases/get-existing-user/get-existing-user.use-case';
import { OrganizationRole } from '@/shared/constants/organization-roles';
import type { CreateOrganizationMemberDto } from '../../models/dto/input/create-organization-member.dto';
import type { OrganizationMember } from '../../models/entities/organization-member.entity';
import type { OrganizationMembersRepositoryInterface } from '../../models/interfaces/repository.interface';
import { ORGANIZATION_MEMBER_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class CreateOrganizationMemberUseCase {
	constructor(
		@Inject(ORGANIZATION_MEMBER_REPOSITORY_INTERFACE_KEY)
		private readonly organizationMembersRepository: OrganizationMembersRepositoryInterface,
		@Inject(GetExistingOrganizationUseCase)
		private readonly getExistingOrganizationUseCase: GetExistingOrganizationUseCase,
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
	) {}

	async execute(organizationId: string, createOrganizationMemberDto: CreateOrganizationMemberDto): Promise<OrganizationMember> {
		const [organization, user] = await Promise.all([
			this.getExistingOrganizationUseCase.execute({ where: { id: organizationId } }),
			this.getExistingUserUseCase.execute({ where: { id: createOrganizationMemberDto.user_id } }),
		]);

		const organizationMember = this.organizationMembersRepository.create({
			organization_id: organization.id,
			user_id: user.id,
			role: createOrganizationMemberDto.role ?? OrganizationRole.PROFESSIONAL,
		});

		return await this.organizationMembersRepository.save(organizationMember);
	}
}
