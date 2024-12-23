from rest_framework import serializers

from .models import User, Group, Event, Track, File, Instrument, Message, EventAttendee, EventTrack, FileAllowedMember, \
    FileInstrument, Invitation, Member, MessageRecipient, UserInstrument


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


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
    class Meta:
        model = Invitation
        fields = "__all__"


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = "__all__"


class MessageRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageRecipient
        fields = "__all__"


class UserInstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInstrument
        fields = "__all__"
