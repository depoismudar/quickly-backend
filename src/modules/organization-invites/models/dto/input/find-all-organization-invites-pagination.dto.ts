import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { INVITE_STATUS } from '@/modules/organization-invites/shared/interfaces/invite-status';
import { PaginationDto } from '@/shared/dto/pagination.dto';

export class FindAllOrganizationInvitesPaginationDto extends PaginationDto {
	@IsEnum(INVITE_STATUS, { each: true, message: 'Cada status deve ser um status válido.' })
	@IsOptional()
	@IsArray()
	@Transform(({ value }) => {
		if (Array.isArray(value)) return value;
		if (typeof value === 'string') return value.split(',').map((v) => v.trim());
		return [value].filter(Boolean);
	})
	@ApiPropertyOptional({ description: 'Filter by status', example: [INVITE_STATUS.PENDING, INVITE_STATUS.ACCEPTED], isArray: true, enum: INVITE_STATUS })
	status?: INVITE_STATUS[];
}
