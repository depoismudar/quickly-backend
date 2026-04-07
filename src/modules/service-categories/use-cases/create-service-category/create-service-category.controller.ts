import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActiveOrganizationId } from '@/modules/auth/shared/decorators/active-organization-id.decorator';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { TenantScoped } from '@/modules/auth/shared/decorators/tenant-scoped.decorator';
import { OrganizationRole } from '@/shared/constants/organization-roles';
import { CreateServiceCategoryDto } from '../../models/dto/input/create-service-category.dto';
import { ServiceCategory } from '../../models/entities/service-category.entity';
import { CreateServiceCategoryUseCase } from './create-service-category.use-case';
import { CreateServiceCategoryDocs } from './docs';

@ApiTags('Service Categories')
@TenantScoped()
@Controller('service-categories')
export class CreateServiceCategoryController {
	constructor(
		@Inject(CreateServiceCategoryUseCase)
		private readonly createServiceCategoryUseCase: CreateServiceCategoryUseCase,
	) {}

	@Post()
	@Roles(OrganizationRole.OWNER)
	@CreateServiceCategoryDocs()
	async execute(@ActiveOrganizationId() organizationId: string, @Body() createServiceCategoryDto: CreateServiceCategoryDto): Promise<ServiceCategory> {
		return await this.createServiceCategoryUseCase.execute(organizationId, createServiceCategoryDto);
	}
}
