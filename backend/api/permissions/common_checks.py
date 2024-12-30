"""
Contains segments of code used in multiple x_permissions.py files:
- checking permissions of the calling user within a group
- finding an object's group (if the object is invalid, None is returned, which fails is_... checks)
"""

from api.models import Event, Message

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

def get_group_by_event_id(event_id):
    try:
        event = Event.objects.get(event_id=event_id).select_related("group")
        return event.group.group_id
    except Event.DoesNotExist:
        return None

def get_group_by_message_id(message_id):
    try:
        message = Message.objects.get(message_id=message_id).select_related("group")
        return message.group.group_id
    except Message.DoesNotExist:
        return None
