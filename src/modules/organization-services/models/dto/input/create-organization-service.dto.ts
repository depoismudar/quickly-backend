import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';

export class CreateOrganizationServiceDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The name of the service' })
	name: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The description of the service' })
	description?: string;

	@IsNumber({}, { message: 'O preço deve ser um número válido' })
	@IsPositive({ message: 'O preço deve ser maior que zero' })
	@IsNotEmpty()
	@ApiProperty({ description: 'The price of the service' })
	price: number;

	@IsNumber()
	@IsPositive()
	@Min(1)
	@IsNotEmpty()
	@ApiProperty({ description: 'The estimated duration of the service in minutes' })
	duration_minutes: number;

	@IsUUID()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The service category ID' })
	service_category_id?: string;

	@IsBoolean()
	@IsOptional()
	@ApiPropertyOptional({ description: 'Whether the service is active', default: true })
	active?: boolean;
}
