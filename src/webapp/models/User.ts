import { Id } from "@eyeseetea/d2-api";
import _ from "lodash";
import { D2Api } from "../../types/d2-api";

export interface UserData {
    id: Id;
    displayName: string;
    username: string;
    organisationUnits: OrganisationUnit[];
    userRoles: UserRole[];
}

interface UserRole {
    id: Id;
    name: string;
}

interface OrganisationUnit {
    id: string;
    path: string;
    level: number;
}

export class User {
    config = {
        feedbackRole: "Feedback",
    };

    public readonly username: string;

    constructor(private data: UserData) {
        this.username = data.username;
    }

    getOrgUnits(): OrganisationUnit[] {
        return this.data.organisationUnits;
    }

    canReportFeedback(): boolean {
        return true;
        //return _(this.data.userRoles).some(userRole => userRole.name === this.config.feedbackRole);
    }

    static async getCurrent(api: D2Api): Promise<User> {
        const currentUser = await api.currentUser
            .get({
                fields: {
                    id: true,
                    displayName: true,
                    organisationUnits: { id: true, path: true, level: true },
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true },
                    },
                },
            })
            .getData();

        const data: UserData = {
            ..._.pick(currentUser, ["id", "displayName", "organisationUnits"]),
            ...currentUser.userCredentials,
        };

        return new User(data);
    }
}
