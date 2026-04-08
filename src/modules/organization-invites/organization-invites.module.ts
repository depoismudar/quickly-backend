import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailModule } from '../email/email.module';
import { OrganizationMembersModule } from '../organization-members/organization-members.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { OrganizationInvite } from './models/entities/organization-invite.entity';
import { OrganizationInvitesRepository } from './repository/organization-invites.repository';
import { ORGANIZATION_INVITE_REPOSITORY_INTERFACE_KEY } from './shared/constants/repository-interface-key';
import { AcceptOrganizationInviteController } from './use-cases/accept-organization-invite/accept-organization-invite.controller';
import { AcceptOrganizationInviteUseCase } from './use-cases/accept-organization-invite/accept-organization-invite.use-case';
import { CancelOrganizationInviteController } from './use-cases/cancel-organization-invite/cancel-organization-invite.controller';
import { CancelOrganizationInviteUseCase } from './use-cases/cancel-organization-invite/cancel-organization-invite.use-case';
import { CreateOrganizationInviteController } from './use-cases/create-organization-invite/create-organization-invite.controller';
import { CreateOrganizationInviteUseCase } from './use-cases/create-organization-invite/create-organization-invite.use-case';
import { GetExistingOrganizationInviteUseCase } from './use-cases/get-existing-organization-invite/get-existing-organization-invite.use-case';
import { GetOrganizationInviteByIdController } from './use-cases/get-organization-invite-by-id/get-organization-invite-by-id.controller';
import { GetOrganizationInviteByIdUseCase } from './use-cases/get-organization-invite-by-id/get-organization-invite-by-id.use-case';
import { ListOrganizationInvitesByOrganizationController } from './use-cases/list-organization-invites-by-organization/list-organization-invites-by-organization.controller';
import { ListOrganizationInvitesByOrganizationUseCase } from './use-cases/list-organization-invites-by-organization/list-organization-invites-by-organization.use-case';
import { ListReceivedOrganizationInvitesController } from './use-cases/list-received-organization-invites/list-received-organization-invites.controller';
import { ListReceivedOrganizationInvitesUseCase } from './use-cases/list-received-organization-invites/list-received-organization-invites.use-case';
import { RejectOrganizationInviteController } from './use-cases/reject-organization-invite/reject-organization-invite.controller';
import { RejectOrganizationInviteUseCase } from './use-cases/reject-organization-invite/reject-organization-invite.use-case';
import { SendOrganizationInviteEmailUseCase } from './use-cases/send-organization-invite-email/send-organization-invite-email.use-case';

@Module({
	imports: [TypeOrmModule.forFeature([OrganizationInvite]), OrganizationMembersModule, OrganizationsModule, UsersModule, EmailModule],
	controllers: [
		CreateOrganizationInviteController,
		AcceptOrganizationInviteController,
		RejectOrganizationInviteController,
		CancelOrganizationInviteController,
		ListOrganizationInvitesByOrganizationController,
		ListReceivedOrganizationInvitesController,
		GetOrganizationInviteByIdController,
	],
	providers: [
		{
			provide: ORGANIZATION_INVITE_REPOSITORY_INTERFACE_KEY,
			useFactory: (dataSource: DataSource) => {
				return new OrganizationInvitesRepository(dataSource);
			},
			inject: [DataSource],
		},
		GetExistingOrganizationInviteUseCase,
		GetOrganizationInviteByIdUseCase,
		CreateOrganizationInviteUseCase,
		AcceptOrganizationInviteUseCase,
		RejectOrganizationInviteUseCase,
		CancelOrganizationInviteUseCase,
		ListOrganizationInvitesByOrganizationUseCase,
		ListReceivedOrganizationInvitesUseCase,
		SendOrganizationInviteEmailUseCase,
	],
	exports: [ORGANIZATION_INVITE_REPOSITORY_INTERFACE_KEY],
})
export class OrganizationInvitesModule {}
