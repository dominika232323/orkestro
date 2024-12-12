from django.db import models
# IDs in bridging tables like event_attendees are redundant and exist because Django can't handle compound primary keys

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=50)
    user_surname = models.CharField(max_length=50)
    user_email = models.CharField(max_length=100)
    google_user_id = models.CharField(max_length=255)
    google_calendar_id = models.CharField(max_length=1024, blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.user_name} ({self.user_id})"

    class Meta:
        managed = False
        db_table = 'users'


class Group(models.Model):
    group_id = models.AutoField(primary_key=True)
    group_name = models.CharField(max_length=100)
    group_description = models.CharField(max_length=1000, blank=True, null=True)
    super_group = models.ForeignKey('self', models.CASCADE, blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.group_name} ({self.group_id})"

    class Meta:
        managed = False
        db_table = 'groups'


class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, models.CASCADE)
    event_name = models.CharField(max_length=100)
    event_description = models.CharField(max_length=1000, blank=True, null=True)
    date = models.DateTimeField()
    place = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"{self.event_name} ({self.event_id})"

    class Meta:
        managed = False
        db_table = 'events'


class Track(models.Model):
    track_id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, models.CASCADE)
    name = models.CharField(max_length=100)
    artist = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"{self.name} ({self.track_id})"

    class Meta:
        managed = False
        db_table = 'tracks'


class File(models.Model):
    file_id = models.AutoField(primary_key=True)
    track = models.ForeignKey(Track, models.CASCADE)
    file_name = models.CharField(max_length=100)
    file_content = models.BinaryField()

    def __str__(self) -> str:
        return f"{self.file_name} ({self.file_id})"

    class Meta:
        managed = False
        db_table = 'files'


class Instrument(models.Model):
    instrument_id = models.AutoField(primary_key=True)
    instrument_name = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"{self.instrument_name} ({self.instrument_id})"

    class Meta:
        managed = False
        db_table = 'instruments'


class Message(models.Model):
    message_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.CASCADE)
    group = models.ForeignKey(Group, models.CASCADE)
    content = models.CharField(max_length=2000)

    def __str__(self) -> str:
        return f"{self.user.user_name} → {self.group.group_name} ({self.message_id})"

    class Meta:
        managed = False
        db_table = 'messages'


class EventAttendee(models.Model):
    event_attendee_id = models.AutoField(primary_key=True)
    event = models.ForeignKey(Event, models.CASCADE)
    user = models.ForeignKey(User, models.CASCADE)

    def __str__(self) -> str:
        return f"{self.event.event_name} → {self.user.user_name} ({self.event_attendee_id})"

    class Meta:
        managed = False
        db_table = 'event_attendees'
        unique_together = (('event', 'user'),)


class EventTrack(models.Model):
    event_track_id = models.AutoField(primary_key=True)
    track = models.ForeignKey(Track, models.CASCADE)
    event = models.ForeignKey(Event, models.CASCADE)

    def __str__(self) -> str:
        return f"{self.event.event_name} → {self.track.name} ({self.event_track_id})"

    class Meta:
        managed = False
        db_table = 'event_tracks'
        unique_together = (('track', 'event'),)


class FileAllowedMember(models.Model):
    file_allowed_member_id = models.AutoField(primary_key=True)
    file = models.ForeignKey(File, models.CASCADE)
    user = models.ForeignKey(User, models.CASCADE)

    def __str__(self) -> str:
        return f"{self.file.file_name} → {self.user.user_name} ({self.file_allowed_member_id})"

    class Meta:
        managed = False
        db_table = 'file_allowed_members'
        unique_together = (('file', 'user'),)


class FileInstrument(models.Model):
    file_instrument_id = models.AutoField(primary_key=True)
    file = models.ForeignKey(File, models.CASCADE)
    instrument = models.ForeignKey(Instrument, models.CASCADE)

    def __str__(self) -> str:
        return f"{self.file.file_name} → {self.instrument.instrument_name} ({self.file_instrument_id})"

    class Meta:
        managed = False
        db_table = 'file_instruments'
        unique_together = (('file', 'instrument'),)


class Invitation(models.Model):
    invitation_id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, models.CASCADE)
    user = models.ForeignKey(User, models.CASCADE)
    permission_level = models.CharField(max_length=1)

    def __str__(self) -> str:
        return f"{self.group.group_name} → {self.user.user_name} ({self.invitation_id})"

    class Meta:
        managed = False
        db_table = 'invitations'
        unique_together = (('group', 'user'),)


class Member(models.Model):
    member_id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, models.CASCADE)
    user = models.ForeignKey(User, models.CASCADE)
    permission_level = models.CharField(max_length=1)

    def __str__(self) -> str:
        return f"{self.group.group_name} → {self.user.user_name} ({self.member_id})"

    class Meta:
        managed = False
        db_table = 'members'
        unique_together = (('group', 'user'),)


class MessageRecipient(models.Model):
    message_recipient_id = models.AutoField(primary_key=True)
    message = models.ForeignKey(Message, models.CASCADE)
    user = models.ForeignKey(User, models.CASCADE)

    def __str__(self) -> str:
        return f"{self.message.user.user_name} → {self.message.group.group_name} → {self.user} ({self.message_recipient_id})"

    class Meta:
        managed = False
        db_table = 'message_recipients'
        unique_together = (('message', 'user'),)


class UserInstrument(models.Model):
    user_instrument_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.CASCADE)
    instrument = models.ForeignKey(Instrument, models.CASCADE)

    def __str__(self) -> str:
        return f"{self.user.user_name} → {self.instrument.instrument_name} ({self.user_instrument_id})"

    class Meta:
        managed = False
        db_table = 'user_instruments'
        unique_together = (('instrument', 'user'),)
