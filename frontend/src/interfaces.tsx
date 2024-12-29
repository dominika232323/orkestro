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

export interface Message {
    message_id: number;
    user: User;
    group: Group;
    title: string;
    content: string;
    date: Date;
}

export interface MessageRecipient {
    message_recipient_id: number;
    message: Message;
    user: User;
    is_read: boolean;
}
