from datetime import datetime
from random import randint, choice
from future.backports.datetime import timedelta

words = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split()
instruments = {
    1: [1, 2],
    2: [3, 4],
    3: [5, 6],
    4: [7, 8],
    5: [9, 10, 11],
    6: [12],
    7: [13],
    8: [14, 15, 16],
    9: [17],
    # 10: [18, 19],
}
instrument_names = ["inny", "skrzypce", "altowka", "wiolonczela", "kontrabas", "gitara_klasyczna", "gitara_elektryczna", "perkusja", "pianino", "fortepian", "flet_prosty", "flet_poprzeczny", "saksofon", "klarnet", "puzon", "trabka", "tuba", "akordeon", "syntezator"]
last_message_day = datetime(2024, 12, 12)
message_count = 256
track_names = ["IX Symfonia", "Dla Elizy", "Sonata księżycowa", "Missa solemnis", 'III Symfonia "Eroica"', 'V Symfonia "Losu"', "Etiuda c-moll Rewolucyjna", "Koncert fortepianowy e-moll", "Nokturn Es-dur", "II Sonata fortepianowa b-moll", "Preludium e-moll", "Polonez As-dur Heroiczny", "Eine Kleine Nachtmusik", "Czarodziejski flet", "Requiem d-moll", "Wesele Figara", "Don Giovanni", "XL symfonia", "Jezioro łabędzie", "Rok 1812", "Pory roku", "Koncert skrzypcowy", "VI symfonia", "Romeo i Julia"]
artists = ["Ludwig van Beethoven", "Fryderyk Chopin", "Wolfgang Amadeusz Mozart", "Piotr Czajkowski"]

def generate_datetime(days_earlier):
    day = last_message_day - timedelta(days=(message_count - days_earlier), hours=randint(0, 24), minutes=randint(0, 60), seconds=randint(0, 60))
    return day.strftime("%Y-%m-%d %H:%M:%S")

def messages():
    for i in range(message_count):
        title = choice(words)
        for _ in range(randint(1, 4)):
            title += " " + choice(words)
        text = choice(words)
        for _ in range(randint(5, 49)):
            text += " " + choice(words)
        print(f"INSERT INTO messages (user_id, group_id, title, content, date) VALUES ({(i % 4) + 1}, {((i // 2) % 2) + 3}, '{title}', '{text}', '{generate_datetime(i)}');")


def recipients():
    for i in range(1, message_count + 1):
        is_read = "FALSE" if i in [message_count - 1, message_count] else "TRUE"
        print(f"INSERT INTO message_recipients (message_id, user_id, is_read) VALUES ({i}, 1, {is_read});")
        print(f"INSERT INTO message_recipients (message_id, user_id, is_read) VALUES ({i}, 2, {is_read});")
        print(f"INSERT INTO message_recipients (message_id, user_id, is_read) VALUES ({i}, 3, {is_read});")
        print(f"INSERT INTO message_recipients (message_id, user_id, is_read) VALUES ({i}, 4, {is_read});")
        print(f"INSERT INTO message_recipients (message_id, user_id, is_read) VALUES ({i}, 5, {is_read});")
        print(f"INSERT INTO message_recipients (message_id, user_id, is_read) VALUES ({i}, {(i % 2) + 6}, {is_read});")
        print(f"INSERT INTO message_recipients (message_id, user_id, is_read) VALUES ({i}, {(i % 2) + 8}, {is_read});")


def event_attendees():
    for i in range(1, 25):
        for j in range(1, 10):
            print(f"INSERT INTO event_attendees (event_id, user_id) VALUES ({i}, {j});")


def tracks_and_files():
    tracks, event_tracks, files, file_allowed_members, file_instruments = [], [], [], [], []
    file_id = 1
    for i in range(1, 25):
        group, event_offset, admin_offset = (3, 0, 0) if i <= 12 else (4, 12, 2)

        tracks.append(f"INSERT INTO tracks (group_id, name, artist) VALUES ({group}, '{track_names[i - 1]}', '{artists[(i - 1) // 6]}');")
        if (i - 1) % 12 <= 6:
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {1 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {2 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {3 + event_offset});")
        else:
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {4 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {5 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {6 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {7 + event_offset});")
        if ((i - 1) % 12) % 2 == 0:
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {8 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {9 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {10 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {11 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {12 + event_offset});")

        instr = [choice(instruments[x]) for x in instruments.keys()]
        files.append(f"INSERT INTO files (track_id, name, content) VALUES ({i}, 'nagranie.mp3', decode('', 'hex'));")
        files.append(f"INSERT INTO files (track_id, name, content) VALUES ({i}, 'info.txt', decode('7A61776172746F736320706C696B752070727A656B617A756A61636120646F6461746B6F776520696E666F726D61636A65206F207574776F727A65', 'hex'));")
        for j in range(1, 10):
            file_allowed_members.append(f"INSERT INTO file_allowed_members (file_id, user_id) VALUES ({file_id}, {j});")
            file_instruments.append(f"INSERT INTO file_instruments (file_id, instrument_id) VALUES ({file_id}, {instr[j - 1]});")
            file_allowed_members.append(f"INSERT INTO file_allowed_members (file_id, user_id) VALUES ({file_id + 1}, {j});")
            file_instruments.append(f"INSERT INTO file_instruments (file_id, instrument_id) VALUES ({file_id + 1}, {instr[j - 1]});")

            files.append(f"INSERT INTO files (track_id, name, content) VALUES ({i}, 'nuty_{instrument_names[instr[j - 1] - 1]}.pdf', decode('', 'hex'));")
            file_instruments.append(f"INSERT INTO file_instruments (file_id, instrument_id) VALUES ({file_id + 1 + j}, {instr[j - 1]});")
            file_allowed_members.append(f"INSERT INTO file_allowed_members (file_id, user_id) VALUES ({file_id + 1 + j}, {j});")
            if j != 1 + admin_offset:
                file_allowed_members.append(f"INSERT INTO file_allowed_members (file_id, user_id) VALUES ({file_id + 1 + j}, {1 + admin_offset});")
            if j != 2 + admin_offset:
                file_allowed_members.append(f"INSERT INTO file_allowed_members (file_id, user_id) VALUES ({file_id + 1 + j}, {2 + admin_offset});")
        file_id += 11

    for line in tracks + [""] + event_tracks + [""] + files + [""] + file_allowed_members + [""] + file_instruments:
        print(line)


if __name__ == "__main__":
    tracks_and_files()
