import { Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { GetExistingOrganizationMemberUseCase } from '@/modules/organization-members/use-cases/get-existing-organization-member/get-existing-organization-member.use-case';
import { AlreadyLoggedInOrganizationException } from '../../errors/already-logged-in-organization.error';
import { NotMemberOfOrganizationException } from '../../errors/not-member-of-organization.error';
import type { SwitchOrganizationDto } from '../../models/dto/input/switch-organization.dto';
import type { SessionUser } from '../../models/interfaces/session-user.interface';
import { getSessionUser, saveSession } from '../../shared/helpers/session.helper';

@Injectable()
export class SwitchOrganizationUseCase {
	constructor(
		@Inject(GetExistingOrganizationMemberUseCase)
		private readonly getExistingOrganizationMemberUseCase: GetExistingOrganizationMemberUseCase,
	) {}

	async execute(request: Request, switchDto: SwitchOrganizationDto): Promise<SessionUser> {
		const currentUser = getSessionUser(request);

		const membership = await this.getExistingOrganizationMemberUseCase.execute(
			{
				where: {
					user_id: currentUser.userId,
					organization_id: switchDto.organization_id,
					active: true,
				},
			},
			{ throwIfFound: false, throwIfNotFound: false },
		);

		if (!membership) {
			throw new NotMemberOfOrganizationException();
		}

		if (request.session.activeOrganizationId === membership.organization_id) {
			throw new AlreadyLoggedInOrganizationException();
		}

		request.session.activeOrganizationId = membership.organization_id;
		request.session.organizationRole = membership.role;

		await saveSession(request);

		return {
			userId: currentUser.userId,
			email: currentUser.email,
			activeOrganizationId: membership.organization_id,
			organizationRole: membership.role,
		};
	}
}
