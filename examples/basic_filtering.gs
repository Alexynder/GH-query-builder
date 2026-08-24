// Basic filtering with QueryBuilder.
import_code("../src/QueryBuilder.gs")
clear_screen()
files = [
    {"name": "passwd", "size": 12, "dir": "/etc"},
    {"name": "shadow", "size": 8, "dir": "/etc"},
    {"name": "readme.txt", "size": 340, "dir": "/home/user"},
    {"name": "notes.txt", "size": 96, "dir": "/home/user"},
    {"name": "backup.zip", "size": 20480, "dir": "/var/backups"}
]

// keep files bigger than 100 bytes
big = QueryBuilder.from(files).whereGreaterThan("size", 100).toList()
print("Files bigger than 100 bytes:")
print(big)

// keep files that live in /etc
inEtc = QueryBuilder.from(files).whereEquals("dir", "/etc").select("name").toList()
print("Files in /etc:")
print(inEtc)

// custom predicate: names ending with ".txt"
isTextFile = function(file)
    name = file.name
    return name[-4:] == ".txt"
end function

textFiles = QueryBuilder.from(files).where(@isTextFile).select("name").toList()
print("Text files:")
print(textFiles)
