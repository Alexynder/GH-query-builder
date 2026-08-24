// Aggregations with QueryBuilder.
import_code("../src/QueryBuilder.gs")
clear_screen()
transactions = [
    {"account": "alice", "amount": 250},
    {"account": "bob", "amount": 75},
    {"account": "alice", "amount": 120},
    {"account": "carol", "amount": 500},
    {"account": "bob", "amount": 40}
]

total = QueryBuilder.from(transactions).sum("amount")
print("Total transferred: " + total)

biggest = QueryBuilder.from(transactions).max("amount")
smallest = QueryBuilder.from(transactions).min("amount")
print("Biggest transaction: " + biggest)
print("Smallest transaction: " + smallest)

avg = QueryBuilder.from(transactions).average("amount")
print("Average transaction: " + avg)

aliceTxCount = QueryBuilder.from(transactions).whereEquals("account", "alice").count()
print("Alice's transaction count: " + aliceTxCount)

hasBigTx = QueryBuilder.from(transactions).whereGreaterThan("amount", 400).any()
print("Has a transaction over 400: " + hasBigTx)

firstOverHundred = QueryBuilder.from(transactions).whereGreaterThan("amount", 100).first()
print("First transaction over 100:")
print(firstOverHundred)
