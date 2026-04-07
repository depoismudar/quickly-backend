import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCustomerDto } from '../../models/dto/input/create-customer.dto';
import { Customer } from '../../models/entities/customer.entity';

export function CreateCustomerDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Create a new customer',
			description:
				'Creates a new customer for the active organization in the authenticated context. The customer can be anonymous (without user_id) or linked to an existing user.',
		}),
		ApiBody({
			type: CreateCustomerDto,
			description: 'Data for customer creation',
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: 'Customer created successfully.',
			type: Customer,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for customer creation or customer already exists.',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while creating customer.',
		}),
	);
}
