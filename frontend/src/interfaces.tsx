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

export interface GroupWithSubgroups {
  group_id: number;
  name: string;
  description: string;
  subgroups: GroupWithSubgroups[];
}

export interface Invitation {
  invitation_id: number;
  group: number;
  group_details: Group;
  user: number;
  permission_level: string;
}

export interface Instrument {
  instrument_id: number;
  name_pl: string;
  name_en: string;
}

export interface UserInstrument {
  user_instrument_id: number;
  user: number;
  instrument: number;
  instrument_details: Instrument;
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

export interface MessageRecipientPaged {
  messages: MessageRecipient[];
  page_number: number;
  total_pages: number;
}

export interface Event {
  event_id: number;
  group: number;
  name: string;
  description: string;
  date: Date;
  place: string;
}

export interface EventPaged {
  events: Event[];
  page_number: number;
  total_pages: number;
}

export interface Member {
  member_id: number;
  group: number;
  user: number;
  user_details: User;
  permission_level: string;
}

export interface Track {
  track_id: number;
  group: number;
  name: string;
  artist: string;
}

export interface File {
  file_id: number;
  track: number;
  track_details: Track;
  name: string;
}
