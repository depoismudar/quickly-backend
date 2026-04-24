import { Inject, Injectable } from '@nestjs/common';
import type { Media } from '@/modules/media/models/entities/media.entity';
import { ListMediaUseCase } from '@/modules/media/use-cases/list-media/list-media.use-case';
import type { Organization } from '@/modules/organizations/models/entities/organization.entity';
import { GetExistingOrganizationUseCase } from '@/modules/organizations/use-cases/get-existing-organization/get-existing-organization.use-case';
import type { User } from '../../models/entities/user.entity';
import { GetExistingUserUseCase } from '../get-existing-user/get-existing-user.use-case';

export interface GetCurrentUserInput {
	user_id: string;
	organization_id: string | null;
}

export type UserWithActiveTenantContext = User & {
	medias: Media[];
	currentOrganization: Organization | null;
};

@Injectable()
export class GetCurrentUserUseCase {
	constructor(
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
		@Inject(ListMediaUseCase)
		private readonly listMediaUseCase: ListMediaUseCase,
		@Inject(GetExistingOrganizationUseCase)
		private readonly getExistingOrganizationUseCase: GetExistingOrganizationUseCase,
	) {}

	async execute(input: GetCurrentUserInput): Promise<UserWithActiveTenantContext> {
		const user = await this.getExistingUserUseCase.execute({ where: { id: input.user_id } });

		if (!input.organization_id) {
			return Object.assign(user, { medias: [], currentOrganization: null }) as UserWithActiveTenantContext;
		}

		const currentOrganization = await this.getExistingOrganizationUseCase.execute({ where: { id: input.organization_id } });
		const medias = await this.listMediaUseCase.execute({ where: { user_id: input.user_id, organization_id: input.organization_id }, order: { created_at: 'DESC' } });

		return Object.assign(user, { medias, currentOrganization }) as UserWithActiveTenantContext;
	}
}
