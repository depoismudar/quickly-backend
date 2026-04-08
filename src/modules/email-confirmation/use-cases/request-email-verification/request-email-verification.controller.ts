import { Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionUser } from '@/modules/auth/models/interfaces/session-user.interface';
import { CurrentUser } from '@/modules/auth/shared/decorators/current-user.decorator';
import { RequestEmailVerificationDocs } from './docs';
import { RequestEmailVerificationUseCase } from './request-email-verification.use-case';

@ApiTags('Email Confirmation')
@Controller('email-confirmation')
export class RequestEmailVerificationController {
	constructor(
		@Inject(RequestEmailVerificationUseCase)
		private readonly requestEmailVerificationUseCase: RequestEmailVerificationUseCase,
	) {}

	@Post('request-email-verification')
	@RequestEmailVerificationDocs()
	async execute(@CurrentUser() currentUser: SessionUser): Promise<{ message: string }> {
		await this.requestEmailVerificationUseCase.execute(currentUser.userId);
		return { message: 'Código OTP enviado para o email.' };
	}
}
