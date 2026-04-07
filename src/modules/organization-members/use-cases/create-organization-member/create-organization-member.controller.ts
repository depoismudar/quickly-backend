import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActiveOrganizationId } from '@/modules/auth/shared/decorators/active-organization-id.decorator';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { TenantScoped } from '@/modules/auth/shared/decorators/tenant-scoped.decorator';
import { OrganizationRole } from '@/shared/constants/organization-roles';
import { CreateOrganizationMemberDto } from '../../models/dto/input/create-organization-member.dto';
import { OrganizationMember } from '../../models/entities/organization-member.entity';
import { CreateOrganizationMemberUseCase } from './create-organization-member.use-case';
import { CreateOrganizationMemberDocs } from './docs';

@ApiTags('Organization Members')
@TenantScoped()
@Controller('organization-members')
export class CreateOrganizationMemberController {
	constructor(
		@Inject(CreateOrganizationMemberUseCase)
		private readonly createOrganizationMemberUseCase: CreateOrganizationMemberUseCase,
	) {}

	@Post()
	@Roles(OrganizationRole.OWNER)
	@CreateOrganizationMemberDocs()
	async execute(
		@ActiveOrganizationId() organizationId: string,
		@Body() createOrganizationMemberDto: CreateOrganizationMemberDto,
	): Promise<OrganizationMember> {
		return await this.createOrganizationMemberUseCase.execute(organizationId, createOrganizationMemberDto);
	}
}
