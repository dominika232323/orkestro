export interface User {
    email: string;
    name: string;
    surname: string;
    google_user_id: string;
    google_calendar_id: string;
}

export interface Group {
    group_id: number;
    name: string;
    description: string;
    supergroup: number;
}

export interface Invitation {
    invitation_id: number;
    group: Group;
    user: number;
    permission_level: string;
}
