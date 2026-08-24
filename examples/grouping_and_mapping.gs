// Grouping and mapping with QueryBuilder.
import_code("../src/QueryBuilder.gs")
clear_screen()
processes = [
    {"pid": 101, "user": "root", "cmd": "sshd"},
    {"pid": 102, "user": "root", "cmd": "cron"},
    {"pid": 103, "user": "guest", "cmd": "bash"},
    {"pid": 104, "user": "guest", "cmd": "top"},
    {"pid": 105, "user": "www-data", "cmd": "nginx"}
]

// group processes by owning user
byUser = QueryBuilder.from(processes).groupBy("user").execute()
print("Processes grouped by user:")
print(byUser)

// map processes by pid for quick lookup
byPid = QueryBuilder.from(processes).mapBy("pid").execute()
print("Process 103:")
print(byPid[103])

// distinct list of users with running processes
uniqueUsers = QueryBuilder.from(processes).select("user").distinct().toList()
print("Unique users:")
print(uniqueUsers)
