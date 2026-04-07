import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActiveOrganizationId } from '@/modules/auth/shared/decorators/active-organization-id.decorator';
import { TenantScoped } from '@/modules/auth/shared/decorators/tenant-scoped.decorator';
import { CreateCustomerDto } from '../../models/dto/input/create-customer.dto';
import { Customer } from '../../models/entities/customer.entity';
import { CreateCustomerUseCase } from './create-customer.use-case';
import { CreateCustomerDocs } from './docs';

@ApiTags('Customers')
@TenantScoped()
@Controller('customers')
export class CreateCustomerController {
	constructor(
		@Inject(CreateCustomerUseCase)
		private readonly createCustomerUseCase: CreateCustomerUseCase,
	) {}

	@Post()
	@CreateCustomerDocs()
	async execute(@ActiveOrganizationId() organizationId: string, @Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
		return await this.createCustomerUseCase.execute(organizationId, createCustomerDto);
	}
}
