export interface User {
    user_id: number;
    email: string;
    name: string;
    surname: string;
    google_user_id: string;
    google_calendar_id: string;
    profile_picture_url: string;
}

export interface Group {
    group_id: number;
    name: string;
    description: string;
    supergroup: number;
}

export interface Invitation {
    invitation_id: number;
    group: number;
    group_details: Group;
    user: number;
    permission_level: string;
}

export interface Message {
    message_id: number;
    user: number;
    user_details: User;
    group: number;
    group_details: Group;
    title: string;
    content: string;
    date: Date;
}

export interface MessageRecipient {
    message_recipient_id: number;
    message: number;
    message_details: Message;
    user: number;
    user_details: User;
    is_read: boolean;
}
