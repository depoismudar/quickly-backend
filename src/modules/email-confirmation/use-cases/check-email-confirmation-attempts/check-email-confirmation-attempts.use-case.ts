import { Inject, Injectable } from '@nestjs/common';
import { In, MoreThanOrEqual } from 'typeorm';
import { EmailConfirmationAttemptsExceededException } from '../../errors/email-confirmation-attempts-exceeded.error';
import type { EmailConfirmationRepositoryInterface } from '../../models/interfaces/email-confirmation-repository.interface';
import { EMAIL_CONFIRMATION_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/email-confirmation-repository-interface-key';
import { EMAIL_CONFIRMATION_STATUS } from '../../shared/interfaces/email-confirmation-status';
import type { EMAIL_CONFIRMATION_TYPE } from '../../shared/interfaces/email-confirmation-type';

@Injectable()
export class CheckEmailConfirmationAttemptsUseCase {
	private static readonly MAX_ATTEMPTS = 3;
	private static readonly ATTEMPT_WINDOW_HOURS = 24;

	constructor(
		@Inject(EMAIL_CONFIRMATION_REPOSITORY_INTERFACE_KEY)
		private readonly emailConfirmationRepository: EmailConfirmationRepositoryInterface,
	) {}

	async execute(userId: string, type: EMAIL_CONFIRMATION_TYPE): Promise<void> {
		const oneDayAgo = new Date();
		oneDayAgo.setHours(oneDayAgo.getHours() - CheckEmailConfirmationAttemptsUseCase.ATTEMPT_WINDOW_HOURS);

		const attemptsCount = await this.emailConfirmationRepository.count({
			where: {
				user_id: userId,
				type,
				status: In([EMAIL_CONFIRMATION_STATUS.EXPIRED, EMAIL_CONFIRMATION_STATUS.USED, EMAIL_CONFIRMATION_STATUS.PENDING]),
				created_at: MoreThanOrEqual(oneDayAgo),
			},
		});

		if (attemptsCount >= CheckEmailConfirmationAttemptsUseCase.MAX_ATTEMPTS) {
			throw new EmailConfirmationAttemptsExceededException(
				CheckEmailConfirmationAttemptsUseCase.MAX_ATTEMPTS,
				CheckEmailConfirmationAttemptsUseCase.ATTEMPT_WINDOW_HOURS,
			);
		}
	}
}
