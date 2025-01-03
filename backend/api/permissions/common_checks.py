"""
Contains segments of code used in x_permissions.py files:
- checking permissions of the calling user within a group
- checking whether the calling user is the author of the message in message_recipient
- checking whether two users share a group
- finding an object's group (if the object is invalid, None is returned, which fails is_... checks)
"""

from api.models import Event, Message, Track, File, Member


def is_manager(request, group_id):
    if group_id is None:
        return False
    group_membership = request.user.group_memberships.filter(group=group_id)
    return group_membership.exists() and group_membership[0].permission_level == "A"


def is_moderator(request, group_id):
    if group_id is None:
        return False
    group_membership = request.user.group_memberships.filter(group=group_id)
    return group_membership.exists() and group_membership[0].permission_level in ["A", "B"]


def is_member(request, group_id):
    if group_id is None:
        return False
    return request.user.group_memberships.filter(group=group_id).exists()


def is_author(request, message_id):
    try:
        message = Message.objects.get(message_id=message_id)
        return request.user.user_id == message.user_id
    except Message.DoesNotExist:
        return None


def have_common_group(caller_id, user_id):
    caller_memberships = Member.objects.filter(user_id=caller_id)
    user_memberships = Member.objects.filter(user_id=user_id)
    for cm in caller_memberships:
        for um in user_memberships:
            if cm.group_id == um.group_id:
                return True
    return False


def get_group_by_event_id(event_id):
    try:
        event = Event.objects.get(event_id=event_id)
        return event.group.group_id
    except Event.DoesNotExist:
        return None


def get_group_by_message_id(message_id):
    try:
        message = Message.objects.get(message_id=message_id)
        return message.group.group_id
    except Message.DoesNotExist:
        return None


def get_group_by_track_id(track_id):
    try:
        track = Track.objects.get(track_id=track_id)
        return track.group.group_id
    except Track.DoesNotExist:
        return None


def get_group_by_file_id(file_id):
    try:
        file = File.objects.get(file_id=file_id)
        return file.track.group.group_id
    except File.DoesNotExist:
        return None
