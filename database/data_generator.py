from random import randrange, choice

words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split()
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
#   10: [18, 19],
}
instrument_names = ['inny', 'skrzypce', 'altowka', 'wiolonczela', 'kontrabas', 'gitara_klasyczna', 'gitara_elektryczna', 'perkusja', 'pianino', 'fortepian', 'flet_prosty', 'flet_poprzeczny', 'saksofon', 'klarnet', 'puzon', 'trabka', 'tuba', 'akordeon', 'syntezator']

def messages():
    for i in range(32):
        text = choice(words)
        for _ in range(randrange(5, 50)):
            text += " " + choice(words)
        print(f"INSERT INTO messages (user_id, group_id, content) VALUES ({(i % 4) + 1}, {((i // 2) % 2) + 3}, '{text}');")

def recipients():
    for i in range(1, 33):
        print(f"INSERT INTO message_recipients (message_id, user_id) VALUES ({i}, 1);")
        print(f"INSERT INTO message_recipients (message_id, user_id) VALUES ({i}, 2);")
        print(f"INSERT INTO message_recipients (message_id, user_id) VALUES ({i}, 3);")
        print(f"INSERT INTO message_recipients (message_id, user_id) VALUES ({i}, 4);")
        print(f"INSERT INTO message_recipients (message_id, user_id) VALUES ({i}, 5);")
        print(f"INSERT INTO message_recipients (message_id, user_id) VALUES ({i}, {(i % 2) + 6});")
        print(f"INSERT INTO message_recipients (message_id, user_id) VALUES ({i}, {(i % 2) + 8});")

def event_attendees():
    for i in range(1, 25):
        for j in range(1, 10):
            print(f"INSERT INTO event_attendees (event_id, user_id) VALUES ({i}, {j});")

def tracks_and_files():
    tracks = []
    event_tracks = []
    files = []
    file_allowed_members = []
    file_instruments = []

    file_id = 1
    for i in range(1, 111):
        group = 3 if i <= 55 else 4
        event_offset = 0 if group == 3 else 12
        admin_offset = 0 if group == 3 else 2
        make_files = False

        tracks.append(f"INSERT INTO tracks (group_id, name, artist) VALUES ({group}, '{choice(words)} {choice(words)} {choice(words)}', '{choice(words)}');")
        if (i-1) % 55 <= 7:
            make_files = True
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {1 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {2 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {3 + event_offset});")
        if (i-1) % 55 >= 52:
            make_files = True
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {4 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {5 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {6 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {7 + event_offset});")
        if ((i-1) % 55) % 10 == 3:
            make_files = True
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {8 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {9 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {10 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {11 + event_offset});")
            event_tracks.append(f"INSERT INTO event_tracks (track_id, event_id) VALUES ({i}, {12 + event_offset});")

        if make_files:
            instr = [choice(instruments[x]) for x in instruments.keys()]
            files.append(f"INSERT INTO files (track_id, file_name, file_content) VALUES ({i}, 'nagranie.mp3', decode('', 'hex'));") #TODO content
            files.append(f"INSERT INTO files (track_id, file_name, file_content) VALUES ({i}, 'info.txt', decode('7A61776172746F736320706C696B752070727A656B617A756A61636120646F6461746B6F776520696E666F726D61636A65206F207574776F727A65', 'hex'));")
            for j in range (1, 10):
                file_allowed_members.append(f"INSERT INTO file_allowed_members (file_id, user_id) VALUES ({file_id}, {j});")
                file_instruments.append(f"INSERT INTO file_instruments (file_id, instrument_id) VALUES ({file_id}, {instr[j - 1]});")
                file_allowed_members.append(f"INSERT INTO file_allowed_members (file_id, user_id) VALUES ({file_id + 1}, {j});")
                file_instruments.append(f"INSERT INTO file_instruments (file_id, instrument_id) VALUES ({file_id + 1}, {instr[j - 1]});")

                files.append(f"INSERT INTO files (track_id, file_name, file_content) VALUES ({i}, 'nuty_{instrument_names[instr[j - 1] - 1]}.pdf', decode('', 'hex'));")
                file_instruments.append(f"INSERT INTO file_instruments (file_id, instrument_id) VALUES ({file_id + 1 + j}, {instr[j - 1]});")
                file_allowed_members.append(f"INSERT INTO file_allowed_members (file_id, user_id) VALUES ({file_id + 1 + j}, {j});")
                if j != 1 + admin_offset:
                    file_allowed_members.append(f"INSERT INTO file_allowed_members (file_id, user_id) VALUES ({file_id + 1 + j}, {1 + admin_offset});")
                if j != 2 + admin_offset:
                    file_allowed_members.append(f"INSERT INTO file_allowed_members (file_id, user_id) VALUES ({file_id + 1 + j}, {2 + admin_offset});")
            file_id += 11

    for track in tracks:
        print(track)
    print()
    for track in event_tracks:
        print(track)
    print()
    for file in files:
        print(file)
    print()
    for file in file_allowed_members:
        print(file)
    print()
    for file in file_instruments:
        print(file)

if __name__ == "__main__":
    tracks_and_files()
