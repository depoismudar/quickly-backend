import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActiveOrganizationId } from '@/modules/auth/shared/decorators/active-organization-id.decorator';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { TenantScoped } from '@/modules/auth/shared/decorators/tenant-scoped.decorator';
import { OrganizationRole } from '@/shared/constants/organization-roles';
import { CreateOrganizationServiceDto } from '../../models/dto/input/create-organization-service.dto';
import { OrganizationService } from '../../models/entities/organization-service.entity';
import { CreateOrganizationServiceUseCase } from './create-organization-service.use-case';
import { CreateOrganizationServiceDocs } from './docs';

@ApiTags('Organization Services')
@TenantScoped()
@Controller('organization-services')
export class CreateOrganizationServiceController {
	constructor(
		@Inject(CreateOrganizationServiceUseCase)
		private readonly createOrganizationServiceUseCase: CreateOrganizationServiceUseCase,
	) {}

	@Post()
	@Roles(OrganizationRole.OWNER)
	@CreateOrganizationServiceDocs()
	async execute(
		@ActiveOrganizationId() organizationId: string,
		@Body() createOrganizationServiceDto: CreateOrganizationServiceDto,
	): Promise<OrganizationService> {
		return await this.createOrganizationServiceUseCase.execute(organizationId, createOrganizationServiceDto);
	}
}
