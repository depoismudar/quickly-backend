import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateOrganizationInviteDto {
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({ description: 'The email of the invited user' })
	email: string;
}
