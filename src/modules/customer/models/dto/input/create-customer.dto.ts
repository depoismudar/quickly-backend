import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUUID } from 'class-validator';

export class CreateCustomerDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The customer name' })
	name: string;

	@IsNotEmpty()
	@IsEmail({}, { message: 'O email deve ser um email válido.' })
	@ApiProperty({ description: 'The customer email' })
	email: string;

	@IsString()
	@IsOptional()
	@IsPhoneNumber('BR', { message: 'O telefone deve ser um número de telefone válido.' })
	@ApiPropertyOptional({ description: 'The customer phone' })
	phone: string;

	@IsUUID()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The user ID to link (optional, can be linked later)' })
	user_id?: string;
}
