import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionUser } from '@/modules/auth/models/interfaces/session-user.interface';
import { CurrentUser } from '@/modules/auth/shared/decorators/current-user.decorator';
import { RequestEmailChangeDto } from '../../models/dto/input/request-email-change.dto';
import { RequestEmailChangeDocs } from './docs';
import { RequestEmailChangeUseCase } from './request-email-change.use-case';

@ApiTags('Email Confirmation')
@Controller('email-confirmation')
export class RequestEmailChangeController {
	constructor(
		@Inject(RequestEmailChangeUseCase)
		private readonly requestEmailChangeUseCase: RequestEmailChangeUseCase,
	) {}

	@Post('request-email-change')
	@RequestEmailChangeDocs()
	async execute(
		@CurrentUser() currentUser: SessionUser,
		@Body() requestEmailChangeDto: RequestEmailChangeDto,
	): Promise<{ message: string }> {
		await this.requestEmailChangeUseCase.execute(currentUser.userId, requestEmailChangeDto);
		return { message: 'Código OTP enviado para o email atual.' };
	}
}
