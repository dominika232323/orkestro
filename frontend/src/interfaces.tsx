export interface OrkestroUser {
  user_id: number;
  email: string;
  name: string;
  surname: string;
  google_user_id: string;
  google_calendar_id: string;
  profile_picture_url: string;
  is_staff: boolean;
}

export interface OrkestroGroup {
  group_id: number;
  name: string;
  description: string;
  supergroup: number;
}

export interface OrkestroGroupWithSubgroups {
  group_id: number;
  name: string;
  description: string;
  subgroups: OrkestroGroupWithSubgroups[];
}

export interface OrkestroRole {
  is_manager: boolean;
  is_moderator: boolean;
}

export interface OrkestroInvitation {
  invitation_id: number;
  group: number;
  group_details: OrkestroGroup;
  user: number;
  permission_level: string;
}

export interface OrkestroInstrument {
  instrument_id: number;
  name_pl: string;
  name_en: string;
}

export interface OrkestroUserInstrument {
  user_instrument_id: number;
  user: number;
  instrument: number;
  instrument_details: OrkestroInstrument;
}

export interface OrkestroMessage {
  message_id: number;
  user: number;
  user_details: OrkestroUser;
  group: number;
  group_details: OrkestroGroup;
  title: string;
  content: string;
  date: Date;
}

export interface OrkestroMessageRecipient {
  message_recipient_id: number;
  message: number;
  message_details: OrkestroMessage;
  user: number;
  user_details: OrkestroUser;
  is_read: boolean;
}

export interface OrkestroEvent {
  event_id: number;
  group: number;
  name: string;
  description: string;
  date: Date;
  place: string;
}

export interface OrkestroMember {
  member_id: number;
  group: number;
  user: number;
  user_details: OrkestroUser;
  permission_level: string;
}

export interface OrkestroTrack {
  track_id: number;
  group: number;
  name: string;
  artist: string;
}

export interface OrkestroFile {
  file_id: number;
  track: number;
  track_details: OrkestroTrack;
  name: string;
}

export interface Paged<T> {
  items: T[];
  page_number: number;
  total_pages: number;
}

export interface OrkestroTrackEvent {
  event: number;
  event_details: OrkestroEvent;
  event_track_id: number;
  track: number;
  track_details: OrkestroTrack;
}

export interface OrkestroFileInstrument {
  file: number;
  file_instrument_id: number;
  instrument: number;
  instrument_details: OrkestroInstrument;
}
