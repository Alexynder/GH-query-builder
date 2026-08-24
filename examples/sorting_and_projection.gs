// Sorting and projection with QueryBuilder.
import_code("../src/QueryBuilder.gs")
clear_screen()
users = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 35},
    {"name": "Diana", "age": 28}
]

// sort ascending by age, keep only names
youngestFirst = QueryBuilder.from(users).sort("age").select("name").toList()
print("Youngest first:")
print(youngestFirst)

// sort descending by age
oldestFirst = QueryBuilder.from(users).sortDesc("age").select("name").toList()
print("Oldest first:")
print(oldestFirst)

// sortBy with a custom comparator: sort names by length
byNameLength = function(a, b)
    return a.len > b.len
end function

nameSelector = function(user)
    return user.name
end function

shortestNameFirst = QueryBuilder.from(users).sortBy(@nameSelector, @byNameLength, false).select(@nameSelector).toList()
print("Shortest name first:")
print(shortestNameFirst)
