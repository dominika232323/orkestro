from django.contrib import admin
from api.models import *
# Register your models here.

classes = [User, Group, Event, Track, File, Instrument, Message, EventAttendee, EventTrack, FileAllowedMember,
           FileInstrument, Invitation, Member, MessageRecipient, UserInstrument]
for model_class in classes:
    admin.site.register(model_class)
