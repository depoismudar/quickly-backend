import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateOrganizationAddressDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The postal code (CEP)' })
	postal_code: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The street name (logradouro)' })
	street?: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The address complement (complemento)' })
	complement?: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The neighborhood (bairro)' })
	neighborhood?: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The city (localidade)' })
	city?: string;

	@IsString()
	@IsOptional()
	@Length(2, 2)
	@ApiPropertyOptional({ description: 'The state (UF)', maxLength: 2, minLength: 2 })
	state?: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The IBGE code of the municipality' })
	ibge_code?: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The GIA code (used in São Paulo state)' })
	gia_code?: string;

	@IsString()
	@IsOptional()
	@Length(3, 3)
	@ApiPropertyOptional({ description: 'The area code (DDD)', maxLength: 3, minLength: 3 })
	ddd?: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ description: 'The SIAFI code of the municipality' })
	siafi_code?: string;
}
