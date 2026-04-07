import { Inject, Injectable } from '@nestjs/common';
import { GetExistingOrganizationUseCase } from '@/modules/organizations/use-cases/get-existing-organization/get-existing-organization.use-case';
import type { CreateServiceCategoryDto } from '../../models/dto/input/create-service-category.dto';
import type { ServiceCategory } from '../../models/entities/service-category.entity';
import type { ServiceCategoriesRepositoryInterface } from '../../models/interfaces/repository.interface';
import { SERVICE_CATEGORY_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class CreateServiceCategoryUseCase {
	constructor(
		@Inject(SERVICE_CATEGORY_REPOSITORY_INTERFACE_KEY)
		private readonly serviceCategoriesRepository: ServiceCategoriesRepositoryInterface,
		@Inject(GetExistingOrganizationUseCase)
		private readonly getExistingOrganizationUseCase: GetExistingOrganizationUseCase,
	) {}

	async execute(organizationId: string, createServiceCategoryDto: CreateServiceCategoryDto): Promise<ServiceCategory> {
		await this.getExistingOrganizationUseCase.execute({
			where: { id: organizationId },
		});

		const serviceCategory = this.serviceCategoriesRepository.create({
			...createServiceCategoryDto,
			organization_id: organizationId,
		});
		await this.serviceCategoriesRepository.save(serviceCategory);

		return serviceCategory;
	}
}
