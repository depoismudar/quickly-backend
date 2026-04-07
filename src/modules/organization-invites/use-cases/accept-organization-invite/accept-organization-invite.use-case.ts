import { Inject, Injectable } from '@nestjs/common';
import { ActivateOrganizationMemberUseCase } from '@/modules/organization-members/use-cases/activate-organization-member/activate-organization-member.use-case';
import { CreateOrganizationMemberUseCase } from '@/modules/organization-members/use-cases/create-organization-member/create-organization-member.use-case';
import { GetExistingOrganizationMemberUseCase } from '@/modules/organization-members/use-cases/get-existing-organization-member/get-existing-organization-member.use-case';
import { OrganizationRole } from '@/shared/constants/organization-roles';
import { InvalidOrganizationInviteException } from '../../errors/invalid-organization-invite.error';
import type { OrganizationInvitesRepositoryInterface } from '../../models/interfaces/repository.interface';
import { ORGANIZATION_INVITE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { INVITE_STATUS } from '../../shared/interfaces/invite-status';
import { GetExistingOrganizationInviteUseCase } from '../get-existing-organization-invite/get-existing-organization-invite.use-case';

@Injectable()
export class AcceptOrganizationInviteUseCase {
	constructor(
		@Inject(ORGANIZATION_INVITE_REPOSITORY_INTERFACE_KEY)
		private readonly organizationInvitesRepository: OrganizationInvitesRepositoryInterface,
		@Inject(GetExistingOrganizationMemberUseCase)
		private readonly getExistingOrganizationMemberUseCase: GetExistingOrganizationMemberUseCase,
		@Inject(CreateOrganizationMemberUseCase)
		private readonly createOrganizationMemberUseCase: CreateOrganizationMemberUseCase,
		@Inject(GetExistingOrganizationInviteUseCase)
		private readonly getExistingOrganizationInviteUseCase: GetExistingOrganizationInviteUseCase,
		@Inject(ActivateOrganizationMemberUseCase)
		private readonly activateOrganizationMemberUseCase: ActivateOrganizationMemberUseCase,
	) {}

	async execute(id: string, userId: string): Promise<{ message: string }> {
		const invite = await this.getExistingOrganizationInviteUseCase.execute({
			where: { id },
			relations: ['organization'],
		});

		if (invite.status !== INVITE_STATUS.PENDING) {
			throw new InvalidOrganizationInviteException('Convite não está mais pendente.');
		}

		const expirationDate = new Date(invite.expiration_date);
		if (expirationDate < new Date()) {
			await this.organizationInvitesRepository.update(invite.id, { status: INVITE_STATUS.EXPIRED });
			throw new InvalidOrganizationInviteException('Convite expirado.');
		}

		const existingOrganizationMember = await this.getExistingOrganizationMemberUseCase.execute(
			{
				where: {
					user_id: userId,
					organization_id: invite.organization_id,
				},
			},
			{ throwIfFound: false, throwIfNotFound: false },
		);

		if (existingOrganizationMember) {
			await this.activateOrganizationMemberUseCase.execute(existingOrganizationMember.id);
		} else {
			await this.createOrganizationMemberUseCase.execute(invite.organization_id, {
				user_id: userId,
				role: OrganizationRole.PROFESSIONAL,
			});
		}

		await this.organizationInvitesRepository.update(invite.id, { status: INVITE_STATUS.ACCEPTED });

		return { message: 'Convite aceito com sucesso. Usuário vinculado à organização.' };
	}
}
