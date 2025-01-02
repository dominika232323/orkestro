"""
Serializers for model objects. Extra fields serialize nested objects on read.
"""
from rest_framework import serializers

from .models import User, Group, Event, Track, File, Instrument, Message, EventAttendee, EventTrack, FileAllowedMember, \
    FileInstrument, Invitation, Member, MessageRecipient, UserInstrument


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["user_id", "email", "name", "surname", "google_user_id", "google_calendar_id", "profile_picture_url"]
        read_only_fields = ["user_id", "email", "name", "surname", "google_user_id", "profile_picture_url"]


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = "__all__"
        read_only_fields = ["group_id", "supergroup"]


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = "__all__"


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ["event_id", "group"]


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"


class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = "__all__"
        read_only_fields = ["track_id", "group"]


class TrackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = "__all__"


class FileSerializer(serializers.ModelSerializer):
    track_details = TrackSerializer(source="track", read_only=True)

    class Meta:
        model = File
        fields = ["track_details", "file_id", "track", "name"]


class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = "__all__"


class MessageSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)
    group_details = GroupSerializer(source="group", read_only=True)

    class Meta:
        model = Message
        fields = "__all__"


class EventAttendeeSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)

    class Meta:
        model = EventAttendee
        fields = "__all__"


class EventTrackSerializer(serializers.ModelSerializer):
    event_details = EventSerializer(source="event", read_only=True)

    class Meta:
        model = EventTrack
        fields = "__all__"


class FileAllowedMemberSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)

    class Meta:
        model = FileAllowedMember
        fields = "__all__"


class FileInstrumentSerializer(serializers.ModelSerializer):
    instruments_details = InstrumentSerializer(source="instrument", read_only=True)

    class Meta:
        model = FileInstrument
        fields = "__all__"


class InvitationSerializer(serializers.ModelSerializer):
    group_details = GroupSerializer(source="group", read_only=True)

    class Meta:
        model = Invitation
        fields = "__all__"


class MemberSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)

    class Meta:
        model = Member
        fields = "__all__"
        read_only_fields = ["member_id", "group_id", "user_id"]


class MemberCreateSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)

    class Meta:
        model = Member
        fields = "__all__"


class MessageRecipientSerializer(serializers.ModelSerializer):
    message_details = MessageSerializer(source="message", read_only=True)

    class Meta:
        model = MessageRecipient
        fields = "__all__"


class UserInstrumentSerializer(serializers.ModelSerializer):
    instruments_details = InstrumentSerializer(source="instrument", read_only=True)

    class Meta:
        model = UserInstrument
        fields = "__all__"
