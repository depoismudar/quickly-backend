import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { GetExistingUserUseCase } from '@/modules/users/use-cases/get-existing-user/get-existing-user.use-case';
import { GetExistingUserWithVerifiedEmailUseCase } from '@/modules/users/use-cases/get-existing-user-with-verified-email/get-existing-user-with-verified-email.use-case';
import { OtpCode } from '@/shared/value-objects/otp-code';
import { EmailAlreadyInUseException } from '../../errors/email-already-in-use.error';
import { SameEmailError } from '../../errors/same-email-error.error';
import type { CreateEmailConfirmationDto } from '../../models/dto/input/create-email-confirmation.dto';
import type { RequestEmailChangeDto } from '../../models/dto/input/request-email-change.dto';
import { EmailConfirmationTemplateType } from '../../models/dto/input/send-email-confirmation-email.dto';
import type { EmailConfirmationRepositoryInterface } from '../../models/interfaces/email-confirmation-repository.interface';
import { EMAIL_CONFIRMATION_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/email-confirmation-repository-interface-key';
import { EMAIL_CONFIRMATION_STATUS } from '../../shared/interfaces/email-confirmation-status';
import { EMAIL_CONFIRMATION_TYPE } from '../../shared/interfaces/email-confirmation-type';
import { CheckEmailConfirmationAttemptsUseCase } from '../check-email-confirmation-attempts/check-email-confirmation-attempts.use-case';
import { GetExistingEmailConfirmationUseCase } from '../get-existing-email-confirmation/get-existing-email-confirmation.use-case';
import { SendEmailConfirmationEmailUseCase } from '../send-email-confirmation-email/send-email-confirmation-email.use-case';
import { UpdateEmailConfirmationUseCase } from '../update-email-confirmation/update-email-confirmation.use-case';

@Injectable()
export class RequestEmailChangeUseCase {
	constructor(
		@Inject(EMAIL_CONFIRMATION_REPOSITORY_INTERFACE_KEY)
		private readonly emailConfirmationRepository: EmailConfirmationRepositoryInterface,
		@Inject(GetExistingUserWithVerifiedEmailUseCase)
		private readonly getExistingUserWithVerifiedEmailUseCase: GetExistingUserWithVerifiedEmailUseCase,
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
		@Inject(GetExistingEmailConfirmationUseCase)
		private readonly getExistingEmailConfirmationUseCase: GetExistingEmailConfirmationUseCase,
		@Inject(CheckEmailConfirmationAttemptsUseCase)
		private readonly checkEmailConfirmationAttemptsUseCase: CheckEmailConfirmationAttemptsUseCase,
		@Inject(UpdateEmailConfirmationUseCase)
		private readonly updateEmailConfirmationUseCase: UpdateEmailConfirmationUseCase,
		@Inject(SendEmailConfirmationEmailUseCase)
		private readonly sendEmailConfirmationEmailUseCase: SendEmailConfirmationEmailUseCase,
	) {}

	async execute(userId: string, requestEmailChangeDto: RequestEmailChangeDto): Promise<void> {
		// 1. Validate User Exists and has a verified email
		const user = await this.getExistingUserWithVerifiedEmailUseCase.execute({
			where: { id: userId },
		});

		// 2. Validate New Email is Different from Current Email
		if (user.email.toLowerCase() === requestEmailChangeDto.newEmail.toLowerCase()) {
			throw new SameEmailError();
		}

		// 3. Validate New Email Availability
		const existingUserWithEmail = await this.getExistingUserUseCase.execute(
			{
				where: { email: requestEmailChangeDto.newEmail },
			},
			{ throwIfNotFound: false },
		);

		if (existingUserWithEmail && existingUserWithEmail.id !== user.id) {
			throw new EmailAlreadyInUseException();
		}

		// 4. Check Attempts
		await this.checkEmailConfirmationAttemptsUseCase.execute(user.id, EMAIL_CONFIRMATION_TYPE.CHANGE_EMAIL);

		// 5. Invalidate Pending Confirmations
		const existingConfirmation = await this.getExistingEmailConfirmationUseCase.execute(
			{
				where: {
					user_id: user.id,
					status: EMAIL_CONFIRMATION_STATUS.PENDING,
					type: EMAIL_CONFIRMATION_TYPE.CHANGE_EMAIL,
				},
			},
			{ throwIfNotFound: false },
		);

		if (existingConfirmation) {
			await this.updateEmailConfirmationUseCase.execute(existingConfirmation.id, {
				status: EMAIL_CONFIRMATION_STATUS.EXPIRED,
			});
		}

		// 6. Generate OTP and Create Entity
		const otpCode = OtpCode.generate();
		const expirationDate = this.generateExpirationDate();

		const createEmailConfirmationDto: CreateEmailConfirmationDto = {
			user_id: user.id,
			new_email: requestEmailChangeDto.newEmail,
			otp_code: otpCode.getValue(),
			expiration_date: expirationDate,
			status: EMAIL_CONFIRMATION_STATUS.PENDING,
			validated: false,
			type: EMAIL_CONFIRMATION_TYPE.CHANGE_EMAIL,
		};

		try {
			const emailConfirmation = this.emailConfirmationRepository.create(createEmailConfirmationDto);
			await this.emailConfirmationRepository.save(emailConfirmation);

			// 7. Send Email to CURRENT email (security: prevent fraud by sending to current email)
			await this.sendEmailConfirmationEmailUseCase.execute({
				email: user.email,
				otpCode: emailConfirmation.otp_code,
				templateType: EmailConfirmationTemplateType.EMAIL_CHANGE_REQUEST,
				newEmail: requestEmailChangeDto.newEmail,
			});
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}

	private generateExpirationDate(): Date {
		const expirationDate = new Date();
		expirationDate.setMinutes(expirationDate.getMinutes() + 15);
		return expirationDate;
	}
}
