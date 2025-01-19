"""
Functions to use Google Calendar API
"""

from api.models import Event, EventAttendee, User
import re
from datetime import datetime, timedelta
from django.conf import settings
import requests
from django.utils import timezone


def refresh_gcalendar_token(user: User):
    """Refresh the Google Calendar OAuth2 access token using the refresh token."""

    try:
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "refresh_token": user.gcalendar_refresh_token,
            "grant_type": "refresh_token",
        }

        response = requests.post(token_url, data=payload)
        new_token_data = response.json()

        user.gcalendar_access_token = new_token_data["access_token"]
        user.gcalendar_token_expiry = timezone.now() + timedelta(seconds=new_token_data["expires_in"])
        user.save()
        return new_token_data["access_token"]

    except Exception as e:
        raise Exception("Failed to refresh Google Calendar token") from e


def get_valid_gcalendar_token(user: User):
    """Get valid Google Calendar OAuth2 token. Refresh it first if needed."""

    if not user.gcalendar_is_linked:
        raise Exception(f"Google Calendar is not linked for user {user.email}")

    if user.gcalendar_token_expiry and timezone.now() < user.gcalendar_token_expiry:
        return user.gcalendar_access_token
    else:
        return refresh_gcalendar_token(user)


def get_calendar_list(user: User):
    """Fetches a list of user's Google Calendars."""

    access_token = get_valid_gcalendar_token(user)

    url = "https://www.googleapis.com/calendar/v3/users/me/calendarList"
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(url, headers=headers)
    return response.json()


def create_orkestro_calendar(user: User):
    """Creates a new Orkestro Google Calendar for the user."""

    access_token = get_valid_gcalendar_token(user)

    calendar_data = {
        "summary": "Orkestro",
        "timeZone": settings.TIME_ZONE
    }

    url = "https://www.googleapis.com/calendar/v3/calendars"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=calendar_data, headers=headers)
    return response.json()


def get_orkestro_calendar_id(user: User):
    """Retrieves ID of the Orkestro calendar for the user, creating it if it doesn't exist."""

    calendar_list = get_calendar_list(user)

    orkestro_calendar = next(
        (cal for cal in calendar_list["items"] if cal["summary"] == "Orkestro"),
        None
    )

    if orkestro_calendar is None:
        orkestro_calendar = create_orkestro_calendar(user)

    return orkestro_calendar["id"]


def get_calendar_events(user: User):
    """Fetches events from the user's Orkestro calendar."""

    access_token = get_valid_gcalendar_token(user)
    calendar_id = get_orkestro_calendar_id(user)

    url = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(url, headers=headers)
    return response.json()


def create_calendar_event(access_token, calendar_id, summary, description, start: datetime, end: datetime):
    """Creates a new event in the specified Google Calendar."""

    event_data = {
        "summary": summary,
        "description": description,
        "start": {
            "dateTime": start.isoformat(),
            "timeZone": settings.TIME_ZONE,
        },
        "end": {
            "dateTime": end.isoformat(),
            "timeZone": settings.TIME_ZONE,
        }
    }

    url = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=event_data, headers=headers)
    return response.json()


def create_calendar_orkestro_event(user: User, event: Event):
    """Creates a new event in the user's Orkestro Google Calendar."""

    access_token = get_valid_gcalendar_token(user)
    calendar_id = get_orkestro_calendar_id(user)

    summary = event.name
    if event.description:
        description = f"{event.description}\n(id: {event.event_id})"
    else:
        description = f"(id: {event.event_id})"
    start = event.date
    end = start + timedelta(hours=1)

    return create_calendar_event(access_token, calendar_id, summary, description, start, end)


def delete_calendar_event(access_token, calendar_id, calendar_event_id):
    """Deletes given event in the specified Google Calendar."""

    url = f"https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events/{calendar_event_id}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.delete(url, headers=headers)
    if response.status_code == 204:
        return {"message": "Event deleted successfully"}
    else:
        return response.json()


def sync_calendar_events(user: User):
    """Synchronizes user's Orkestro events with their Google Calendar."""

    access_token = get_valid_gcalendar_token(user)
    calendar_id = get_orkestro_calendar_id(user)
    calendar_events = get_calendar_events(user)["items"]

    calendar_event_ids = set()
    calendar_events_dict = {}
    for cal_event in calendar_events:
        # find e.g. (id: 12) at the end of description
        description = cal_event["description"]
        match = re.search(r'\(id:\s*(\d+)\)$', description)
        if match:
            id_value = int(match.group(1))
            calendar_event_ids.add(id_value)
            calendar_events_dict[id_value] = cal_event

    user_participations = EventAttendee.objects.filter(user=user).select_related("event")
    user_event_ids = {p.event.event_id for p in user_participations}

    not_added = user_event_ids - calendar_event_ids
    for event_id in not_added:
        event = Event.objects.get(event_id=event_id)
        create_calendar_orkestro_event(user, event)

    added_redundant = calendar_event_ids - user_event_ids
    for event_id in added_redundant:
        calendar_event_id = calendar_events_dict[event_id]["id"]
        delete_calendar_event(access_token, calendar_id, calendar_event_id)

    return {
        "cal": calendar_event_ids,
        "user": user_event_ids,
        "not_added": not_added,
        "added_redundant": added_redundant
    }
