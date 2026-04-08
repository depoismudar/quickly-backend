import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { OrganizationInvitesRepositoryInterface } from '../../models/interfaces/repository.interface';
import { ORGANIZATION_INVITE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { INVITE_STATUS } from '../../shared/interfaces/invite-status';
import { GetExistingOrganizationInviteUseCase } from '../get-existing-organization-invite/get-existing-organization-invite.use-case';

@Injectable()
export class RejectOrganizationInviteUseCase {
	constructor(
		@Inject(ORGANIZATION_INVITE_REPOSITORY_INTERFACE_KEY)
		private readonly organizationInvitesRepository: OrganizationInvitesRepositoryInterface,
		@Inject(GetExistingOrganizationInviteUseCase)
		private readonly getExistingOrganizationInviteUseCase: GetExistingOrganizationInviteUseCase,
	) {}

	async execute(id: string, userId: string): Promise<void> {
		const invite = await this.getExistingOrganizationInviteUseCase.execute({
			where: { id },
		});

		if (invite.status !== INVITE_STATUS.PENDING) {
			throw new BadRequestException('Convite não está mais pendente.');
		}

		await this.organizationInvitesRepository.update(invite.id, { invited_user_id: invite.invited_user_id ?? userId, status: INVITE_STATUS.REFUSED });
	}
}
