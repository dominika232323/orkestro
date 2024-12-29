from rest_framework import serializers

from .models import User, Group, Event, Track, File, Instrument, Message, EventAttendee, EventTrack, FileAllowedMember, \
    FileInstrument, Invitation, Member, MessageRecipient, UserInstrument


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["user_id", "email", "name", "surname", "google_user_id", "google_calendar_id", "profile_picture_url"]


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = "__all__"


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"


class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = "__all__"


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = "__all__"


class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = "__all__"


class MessageSerializer(serializers.ModelSerializer):
    # on read serialize nested objects
    user_details = UserSerializer(source="user", read_only=True)
    group_details = GroupSerializer(source="group", read_only=True)

    class Meta:
        model = Message
        fields = "__all__"


class EventAttendeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventAttendee
        fields = "__all__"


class EventTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventTrack
        fields = "__all__"


class FileAllowedMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileAllowedMember
        fields = "__all__"


class FileInstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileInstrument
        fields = "__all__"


class InvitationSerializer(serializers.ModelSerializer):
    # on read serialize nested group
    group_details = GroupSerializer(source="group", read_only=True)

    class Meta:
        model = Invitation
        fields = "__all__"


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = "__all__"


class MessageRecipientSerializer(serializers.ModelSerializer):
    # on read serialize nested message
    message_details = MessageSerializer(source="message", read_only=True)

    class Meta:
        model = MessageRecipient
        fields = "__all__"


class UserInstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInstrument
        fields = "__all__"
