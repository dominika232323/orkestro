from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone

# IDs in bridging tables like event_attendees are redundant and exist because Django can't handle compound primary keys


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.date_joined = timezone.now()
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=100, unique=True)
    name = models.CharField(max_length=50)
    surname = models.CharField(max_length=50)
    date_joined = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    google_user_id = models.CharField(max_length=255, null=True, blank=True)
    google_calendar_id = models.CharField(max_length=1024, blank=True, null=True)
    profile_picture_url = models.URLField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def has_perm(self, perm, obj=None):
        """Return True if the user has the specified permission."""
        return self.is_superuser

    def has_module_perms(self, app_label):
        """Return True if the user has permissions to view the app `app_label`."""
        return self.is_superuser

    def __str__(self):
        return f"{self.name} ({self.email})"

    class Meta:
        managed = False
        db_table = "users"


class Group(models.Model):
    group_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1000, blank=True, null=True)
    supergroup = models.ForeignKey("self", models.CASCADE, blank=True, null=True, related_name="subgroups")

    def __str__(self) -> str:
        return f"{self.name} ({self.group_id})"

    class Meta:
        managed = False
        db_table = "groups"


class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, models.CASCADE, related_name="events")
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1000, blank=True, null=True)
    date = models.DateTimeField()
    place = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"{self.name} ({self.event_id})"

    class Meta:
        managed = False
        db_table = "events"


class Track(models.Model):
    track_id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, models.CASCADE, related_name="tracks")
    name = models.CharField(max_length=100)
    artist = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"{self.name} ({self.track_id})"

    class Meta:
        managed = False
        db_table = "tracks"


class File(models.Model):
    file_id = models.AutoField(primary_key=True)
    track = models.ForeignKey(Track, models.CASCADE, related_name="files")
    name = models.CharField(max_length=100)
    content = models.BinaryField()

    def __str__(self) -> str:
        return f"{self.name} ({self.file_id})"

    class Meta:
        managed = False
        db_table = "files"


class Instrument(models.Model):
    instrument_id = models.AutoField(primary_key=True)
    name_en = models.CharField(max_length=100)
    name_pl = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"{self.name_pl}/{self.name_en} ({self.instrument_id})"

    class Meta:
        managed = False
        db_table = "instruments"


class Message(models.Model):
    message_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.CASCADE, related_name="sent_messages")
    group = models.ForeignKey(Group, models.CASCADE, related_name="messages")
    title = models.CharField(max_length=100)
    content = models.CharField(max_length=2000)
    date = models.DateTimeField()

    def __str__(self) -> str:
        return f"{self.user} → {self.group.name} ({self.message_id})"

    class Meta:
        managed = False
        db_table = "messages"


class EventAttendee(models.Model):
    event_attendee_id = models.AutoField(primary_key=True)
    event = models.ForeignKey(Event, models.CASCADE, related_name="attendees")
    user = models.ForeignKey(User, models.CASCADE, related_name="attended_events")

    def __str__(self) -> str:
        return f"{self.event.name} → {self.user} ({self.event_attendee_id})"

    class Meta:
        managed = False
        db_table = "event_attendees"
        unique_together = (("event", "user"),)


class EventTrack(models.Model):
    event_track_id = models.AutoField(primary_key=True)
    track = models.ForeignKey(Track, models.CASCADE, related_name="events")
    event = models.ForeignKey(Event, models.CASCADE, related_name="tracks")

    def __str__(self) -> str:
        return f"{self.event.name} → {self.track.name} ({self.event_track_id})"

    class Meta:
        managed = False
        db_table = "event_tracks"
        unique_together = (("track", "event"),)


class FileAllowedMember(models.Model):
    file_allowed_member_id = models.AutoField(primary_key=True)
    file = models.ForeignKey(File, models.CASCADE, related_name="allowed_users")
    user = models.ForeignKey(User, models.CASCADE, related_name="allowed_files")

    def __str__(self) -> str:
        return f"{self.file.name} → {self.user} ({self.file_allowed_member_id})"

    class Meta:
        managed = False
        db_table = "file_allowed_members"
        unique_together = (("file", "user"),)


class FileInstrument(models.Model):
    file_instrument_id = models.AutoField(primary_key=True)
    file = models.ForeignKey(File, models.CASCADE, related_name="instruments")
    instrument = models.ForeignKey(Instrument, models.CASCADE, related_name="files")

    def __str__(self) -> str:
        return f"{self.file.name} → {self.instrument.name_pl}/{self.instrument.name_en} ({self.file_instrument_id})"

    class Meta:
        managed = False
        db_table = "file_instruments"
        unique_together = (("file", "instrument"),)


class Invitation(models.Model):
    invitation_id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, models.CASCADE, related_name="invitees")
    user = models.ForeignKey(User, models.CASCADE, related_name="invitations")
    permission_level = models.CharField(max_length=1)

    def __str__(self) -> str:
        return f"{self.group.name} → {self.user} ({self.invitation_id})"

    class Meta:
        managed = False
        db_table = "invitations"
        unique_together = (("group", "user"),)


class Member(models.Model):
    member_id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, models.CASCADE, related_name="members")
    user = models.ForeignKey(User, models.CASCADE, related_name="group_memberships")
    permission_level = models.CharField(max_length=1)

    def __str__(self) -> str:
        return f"{self.group.name} → {self.user} ({self.member_id})"

    class Meta:
        managed = False
        db_table = "members"
        unique_together = (("group", "user"),)


class MessageRecipient(models.Model):
    message_recipient_id = models.AutoField(primary_key=True)
    message = models.ForeignKey(Message, models.CASCADE, related_name="recipients")
    user = models.ForeignKey(User, models.CASCADE, related_name="received_messages")
    is_read = models.BooleanField()

    def __str__(self) -> str:
        return f"{self.message.user} → {self.message.group.name} → {self.user} ({self.message_recipient_id})"

    class Meta:
        managed = False
        db_table = "message_recipients"
        unique_together = (("message", "user"),)


class UserInstrument(models.Model):
    user_instrument_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.CASCADE, related_name="instruments")
    instrument = models.ForeignKey(Instrument, models.CASCADE, related_name="users")

    def __str__(self) -> str:
        return f"{self.user} → {self.instrument.name_pl}/{self.instrument.name_en} ({self.user_instrument_id})"

    class Meta:
        managed = False
        db_table = "user_instruments"
        unique_together = (("instrument", "user"),)
