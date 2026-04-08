import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionUser } from '@/modules/auth/models/interfaces/session-user.interface';
import { CurrentUser } from '@/modules/auth/shared/decorators/current-user.decorator';
import { ValidateEmailConfirmationOtpDto } from '../../models/dto/input/validate-email-confirmation-otp.dto';
import { ConfirmEmailUseCase } from './confirm-email.use-case';
import { ConfirmEmailDocs } from './docs';

@ApiTags('Email Confirmation')
@Controller('email-confirmation')
export class ConfirmEmailController {
	constructor(
		@Inject(ConfirmEmailUseCase)
		private readonly confirmEmailUseCase: ConfirmEmailUseCase,
	) {}

	@Post('confirm')
	@ConfirmEmailDocs()
	async execute(
		@CurrentUser() currentUser: SessionUser,
		@Body() validateEmailConfirmationOtpDto: ValidateEmailConfirmationOtpDto,
	): Promise<{ message: string }> {
		return await this.confirmEmailUseCase.execute(currentUser.userId, validateEmailConfirmationOtpDto);
	}
}
