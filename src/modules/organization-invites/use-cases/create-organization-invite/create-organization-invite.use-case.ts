import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetExistingOrganizationMemberUseCase } from '@/modules/organization-members/use-cases/get-existing-organization-member/get-existing-organization-member.use-case';
import { GetExistingOrganizationUseCase } from '@/modules/organizations/use-cases/get-existing-organization/get-existing-organization.use-case';
import { GetExistingUserUseCase } from '@/modules/users/use-cases/get-existing-user/get-existing-user.use-case';
import type { CreateOrganizationInviteDto } from '../../models/dto/input/create-organization-invite.dto';
import { OrganizationInvite } from '../../models/entities/organization-invite.entity';
import { INVITE_STATUS } from '../../shared/interfaces/invite-status';
import { GetExistingOrganizationInviteUseCase } from '../get-existing-organization-invite/get-existing-organization-invite.use-case';
import { SendOrganizationInviteEmailUseCase } from '../send-organization-invite-email/send-organization-invite-email.use-case';

@Injectable()
export class CreateOrganizationInviteUseCase {
	constructor(
		@Inject(DataSource)
		private readonly dataSource: DataSource,
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
		@Inject(GetExistingOrganizationInviteUseCase)
		private readonly getExistingOrganizationInviteUseCase: GetExistingOrganizationInviteUseCase,
		@Inject(GetExistingOrganizationMemberUseCase)
		private readonly getExistingOrganizationMemberUseCase: GetExistingOrganizationMemberUseCase,
		@Inject(GetExistingOrganizationUseCase)
		private readonly getExistingOrganizationUseCase: GetExistingOrganizationUseCase,
		@Inject(SendOrganizationInviteEmailUseCase)
		private readonly sendOrganizationInviteEmailUseCase: SendOrganizationInviteEmailUseCase,
	) {}

	async execute(organizationId: string, inviterId: string, createOrganizationInviteDto: CreateOrganizationInviteDto): Promise<OrganizationInvite> {
		await this.getExistingOrganizationInviteUseCase.execute(
			{
				where: {
					email: createOrganizationInviteDto.email,
					organization_id: organizationId,
					status: INVITE_STATUS.PENDING,
				},
			},
			{ throwIfFound: true },
		);

		const user = await this.getExistingUserUseCase.execute(
			{
				where: { email: createOrganizationInviteDto.email },
			},
			{ throwIfNotFound: false },
		);

		if (user) {
			await this.getExistingOrganizationMemberUseCase.execute(
				{
					where: {
						user_id: user.id,
						organization_id: organizationId,
						active: true,
					},
				},
				{ throwIfFound: true },
			);
		}

		const organization = await this.getExistingOrganizationUseCase.execute({
			where: { id: organizationId },
		});

		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 7);

		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const organizationInvite = queryRunner.manager.create(OrganizationInvite, {
				...createOrganizationInviteDto,
				organization_id: organizationId,
				inviter_id: inviterId,
				invited_user_id: user?.id ?? null,
				expiration_date: expirationDate,
				status: INVITE_STATUS.PENDING,
			});

			const invite = queryRunner.manager.create(OrganizationInvite, organizationInvite);

			await queryRunner.manager.save(invite);

			await this.sendOrganizationInviteEmailUseCase.execute({
				email: createOrganizationInviteDto.email,
				inviteId: invite.id,
				organizationId: organization.id,
			});

			await queryRunner.commitTransaction();

			return invite;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		} finally {
			await queryRunner.release();
		}
	}
}
