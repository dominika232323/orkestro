CREATE TABLE event_attendees (
    event_id INTEGER NOT NULL,
    user_id  INTEGER NOT NULL
);

ALTER TABLE event_attendees ADD CONSTRAINT event_attendees_pk PRIMARY KEY ( event_id, user_id );

CREATE TABLE event_tracks (
    track_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL
);

ALTER TABLE event_tracks ADD CONSTRAINT event_tracks_pk PRIMARY KEY ( track_id, event_id );

CREATE TABLE events (
    event_id          SERIAL NOT NULL,
    group_id          INTEGER NOT NULL,
    event_name        VARCHAR(100) NOT NULL,
    event_description VARCHAR(1000),
    date              TIMESTAMP NOT NULL,
    place             VARCHAR(100) NOT NULL
);

ALTER TABLE events ADD CONSTRAINT events_pk PRIMARY KEY ( event_id );

CREATE TABLE file_allowed_members (
    file_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL
);

ALTER TABLE file_allowed_members ADD CONSTRAINT file_allowed_members_pk PRIMARY KEY ( file_id, user_id );

CREATE TABLE file_instruments (
    file_id       INTEGER NOT NULL,
    instrument_id INTEGER NOT NULL
);

ALTER TABLE file_instruments ADD CONSTRAINT file_instruments_pk PRIMARY KEY ( file_id, instrument_id );

CREATE TABLE files (
    file_id       SERIAL NOT NULL,
    track_id      INTEGER NOT NULL,
    file_name     VARCHAR(100) NOT NULL,
    file_content  BYTEA NOT NULL
);

ALTER TABLE files ADD CONSTRAINT files_pk PRIMARY KEY ( file_id );

CREATE TABLE groups (
    group_id          SERIAL NOT NULL,
    group_name        VARCHAR(100) NOT NULL,
    group_description VARCHAR(1000),
    super_group_id    INTEGER
);

ALTER TABLE groups ADD CONSTRAINT groups_pk PRIMARY KEY ( group_id );

CREATE TABLE instruments (
    instrument_id   SERIAL NOT NULL,
    instrument_name VARCHAR(100) NOT NULL
);

ALTER TABLE instruments ADD CONSTRAINT instruments_pk PRIMARY KEY ( instrument_id );

CREATE TABLE invitations (
    group_id         INTEGER NOT NULL,
    user_id          INTEGER NOT NULL,
    permission_level CHAR(1) NOT NULL
);

ALTER TABLE invitations ADD CONSTRAINT invitations_pk PRIMARY KEY ( group_id, user_id );

CREATE TABLE members (
    group_id         INTEGER NOT NULL,
    user_id          INTEGER NOT NULL,
    permission_level CHAR(1) NOT NULL
);

ALTER TABLE members ADD CONSTRAINT members_pk PRIMARY KEY ( group_id, user_id );

CREATE TABLE message_recipients (
    message_id INTEGER NOT NULL,
    user_id    INTEGER NOT NULL
);

ALTER TABLE message_recipients ADD CONSTRAINT message_recipients_pk PRIMARY KEY ( message_id, user_id );

CREATE TABLE messages (
    message_id SERIAL NOT NULL,
    user_id    INTEGER NOT NULL,
    group_id   INTEGER NOT NULL,
    content    VARCHAR(2000) NOT NULL
);

ALTER TABLE messages ADD CONSTRAINT messages_pk PRIMARY KEY ( message_id );

CREATE TABLE tracks (
    track_id SERIAL NOT NULL,
    group_id INTEGER NOT NULL,
    name     VARCHAR(100) NOT NULL,
    artist   VARCHAR(100) NOT NULL
);

ALTER TABLE tracks ADD CONSTRAINT tracks_pk PRIMARY KEY ( track_id );

CREATE TABLE user_instruments (
    user_id       INTEGER NOT NULL,
    instrument_id INTEGER NOT NULL
);

ALTER TABLE user_instruments ADD CONSTRAINT user_instruments_pk PRIMARY KEY ( instrument_id, user_id );

CREATE TABLE users (
    user_id            SERIAL NOT NULL,
    user_name          VARCHAR(50) NOT NULL,
    user_surname       VARCHAR(50) NOT NULL,
    user_email         VARCHAR(100) NOT NULL,
    google_user_id     VARCHAR(255) NOT NULL,
    google_calendar_id VARCHAR(1024)
);

ALTER TABLE users ADD CONSTRAINT users_pk PRIMARY KEY ( user_id );

ALTER TABLE event_attendees ADD CONSTRAINT event_attendees_events_fk FOREIGN KEY ( event_id ) REFERENCES events ( event_id );
ALTER TABLE event_attendees ADD CONSTRAINT event_attendees_users_fk FOREIGN KEY ( user_id ) REFERENCES users ( user_id );
ALTER TABLE event_tracks ADD CONSTRAINT event_tracks_events_fk FOREIGN KEY ( event_id ) REFERENCES events ( event_id );
ALTER TABLE event_tracks ADD CONSTRAINT event_tracks_tracks_fk FOREIGN KEY ( track_id ) REFERENCES tracks ( track_id );
ALTER TABLE events ADD CONSTRAINT events_groups_fk FOREIGN KEY ( group_id ) REFERENCES groups ( group_id );
ALTER TABLE file_allowed_members ADD CONSTRAINT file_allowed_members_files_fk FOREIGN KEY ( file_id ) REFERENCES files ( file_id );
ALTER TABLE file_allowed_members ADD CONSTRAINT file_allowed_members_users_fk FOREIGN KEY ( user_id ) REFERENCES users ( user_id );
ALTER TABLE file_instruments ADD CONSTRAINT file_instruments_files_fk FOREIGN KEY ( file_id ) REFERENCES files ( file_id );
ALTER TABLE file_instruments ADD CONSTRAINT file_instruments_instruments_fk FOREIGN KEY ( instrument_id ) REFERENCES instruments ( instrument_id );
ALTER TABLE files ADD CONSTRAINT files_instruments_fk FOREIGN KEY ( track_id ) REFERENCES tracks ( track_id );
ALTER TABLE groups ADD CONSTRAINT groups_groups_fk FOREIGN KEY ( super_group_id ) REFERENCES groups ( group_id );
ALTER TABLE invitations ADD CONSTRAINT invitations_groups_fk FOREIGN KEY ( group_id ) REFERENCES groups ( group_id );
ALTER TABLE invitations ADD CONSTRAINT invitations_users_fk FOREIGN KEY ( user_id ) REFERENCES users ( user_id );
ALTER TABLE members ADD CONSTRAINT members_groups_fk FOREIGN KEY ( group_id ) REFERENCES groups ( group_id );
ALTER TABLE members ADD CONSTRAINT members_users_fk FOREIGN KEY ( user_id ) REFERENCES users ( user_id );
ALTER TABLE message_recipients ADD CONSTRAINT message_recipients_messages_fk FOREIGN KEY ( message_id ) REFERENCES messages ( message_id );
ALTER TABLE message_recipients ADD CONSTRAINT message_recipients_users_fk FOREIGN KEY ( user_id ) REFERENCES users ( user_id );
ALTER TABLE messages ADD CONSTRAINT messages_groups_fk FOREIGN KEY ( group_id ) REFERENCES groups ( group_id );
ALTER TABLE messages ADD CONSTRAINT messages_users_fk FOREIGN KEY ( user_id ) REFERENCES users ( user_id );
ALTER TABLE tracks ADD CONSTRAINT tracks_groups_fk FOREIGN KEY ( group_id ) REFERENCES groups ( group_id );
ALTER TABLE user_instruments ADD CONSTRAINT user_instruments_instruments_fk FOREIGN KEY ( instrument_id ) REFERENCES instruments ( instrument_id );
ALTER TABLE user_instruments ADD CONSTRAINT user_instruments_users_fk FOREIGN KEY ( user_id ) REFERENCES users ( user_id );

CREATE INDEX index_users ON users USING hash (google_user_id);
CREATE INDEX index_user_instruments ON user_instruments USING hash (user_id);
CREATE INDEX index_members_user_id ON members USING hash (user_id);
CREATE INDEX index_invitations ON invitations USING hash (user_id);
CREATE INDEX index_message_recipients ON message_recipients USING hash (user_id);
CREATE INDEX index_event_attendees ON event_attendees USING hash (user_id);
CREATE INDEX index_groups ON groups USING hash (group_id);
CREATE INDEX index_members_group_id ON members USING hash (group_id);
CREATE INDEX index_messages ON messages USING hash (group_id);
CREATE INDEX index_events ON events USING hash (group_id);
CREATE INDEX index_tracks ON tracks USING hash (group_id);
CREATE INDEX index_event_tracks ON event_tracks USING hash (event_id);
CREATE INDEX index_files ON files USING hash (track_id);
CREATE INDEX index_instruments ON instruments USING hash (instrument_id);
CREATE INDEX index_file_allowed_members ON file_allowed_members USING hash (file_id);
CREATE INDEX index_file_instruments ON file_instruments USING hash (file_id);

