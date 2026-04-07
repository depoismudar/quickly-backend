import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActiveOrganizationId } from '@/modules/auth/shared/decorators/active-organization-id.decorator';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { TenantScoped } from '@/modules/auth/shared/decorators/tenant-scoped.decorator';
import { OrganizationRole } from '@/shared/constants/organization-roles';
import { CreateOrganizationAddressDto } from '../../models/dto/input/create-organization-address.dto';
import { OrganizationAddress } from '../../models/entities/organization-address.entity';
import { CreateOrganizationAddressUseCase } from './create-organization-address.use-case';
import { CreateOrganizationAddressDocs } from './docs';

@ApiTags('Organization Addresses')
@TenantScoped()
@Controller('organization-addresses')
export class CreateOrganizationAddressController {
	constructor(
		@Inject(CreateOrganizationAddressUseCase)
		private readonly createOrganizationAddressUseCase: CreateOrganizationAddressUseCase,
	) {}

	@Post()
	@Roles(OrganizationRole.OWNER)
	@CreateOrganizationAddressDocs()
	async execute(
		@ActiveOrganizationId() organizationId: string,
		@Body() createOrganizationAddressDto: CreateOrganizationAddressDto,
	): Promise<OrganizationAddress> {
		return await this.createOrganizationAddressUseCase.execute(organizationId, createOrganizationAddressDto);
	}
}
