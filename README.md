# QueryBuilder

A LINQ-like, deferred query pipeline for GreyScript (Grey Hack). Build a chain of
operations against a list, then run it once with a terminal method. Nothing is
executed until a terminal method is called.

## Import

```greyscript
import_code("/lib/QueryBuilder.gs")
```

## Quick start

```greyscript
users = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 35},
    {"name": "Diana", "age": 28}
]

names = QueryBuilder.from(users).sort("age").select("name").toList()
print(names)
```

## Selectors

Most methods accept a **selector**, which can be either:
- a **string key** — looks up `item[key]` (e.g. `"age"`)
- a **function reference** — called as `selector(item)` (must be passed with `@`, e.g. `@ageSelector`)

Passing `null` (where allowed) means "use the item itself".

## API

### `QueryBuilder.from(list)`

Creates a new `Query` from a copy of `list`. The original list is never mutated.

```greyscript
query = QueryBuilder.from(users)
```

### Builder methods

All builder methods queue an operation and return `self`, so they can be chained.
Nothing runs until a terminal method is called.

| Method | Description |
|---|---|
| `where(predicate)` | Keeps items where `predicate(item)` is truthy. `predicate` must be a function reference. |
| `whereEquals(selector, value)` | Keeps items where `selector(item) == value`. |
| `whereNotEquals(selector, value)` | Keeps items where `selector(item) != value`. |
| `whereIn(selector, values)` | Keeps items where `selector(item)` is found in the `values` list. |
| `whereNotIn(selector, values)` | Keeps items where `selector(item)` is **not** found in the `values` list. |
| `whereGreaterThan(selector, value)` | Keeps items where `selector(item) > value`. |
| `whereLessThan(selector, value)` | Keeps items where `selector(item) < value`. |
| `select(selector)` | Projects each item through `selector`. |
| `selectMany(selector)` | Projects each item through `selector`, where each projection must be a list, then flattens all projected lists into a single result list. |
| `take(count)` | Keeps only the first `count` items. |
| `skip(count)` | Skips the first `count` items. |
| `sort(selector = null)` | Sorts ascending by `selector` (or by item value if `null`). |
| `sortDesc(selector = null)` | Sorts descending by `selector` (or by item value if `null`). |
| `sortBy(selector = null, comparator = null, descending = false)` | Sorts using an optional custom `comparator(a, b)` function reference; falls back to the built-in sort when `comparator` is `null`. |
| `groupBy(selector)` | Groups items into a map of `key -> list of items`. |
| `mapBy(selector)` | Builds a map of `key -> item` (last item wins on duplicate keys). |
| `concat(list)` |  Concatenates the current list with another list. |
| `distinct(selector = null)` | Removes duplicates, comparing by `selector` (or by item value if `null`). |
| `reverse()` | Reverses the current item order. |

### Terminal methods

Terminal methods execute the queued pipeline once, store the result back into
the query's items, clear the pipeline, and return a result.

| Method | Description |
|---|---|
| `execute()` | Runs the pipeline and returns the result. Use this after `groupBy`/`mapBy`, since their result is a map rather than a list. |
| `toList()` | Alias for `execute()`. Prefer this when the pipeline ends with a list-producing operation. |
| `first()` | Returns the first item, or `null` if the result is empty. |
| `any()` | Returns `true` if the result has at least one item. |
| `count()` | Returns the number of items in the result. |
| `sum(selector = null)` | Sums `selector(item)` (or `item` itself if `null`) across the result. |
| `min(selector = null)` | Returns the minimum value, or `null` if the result is empty. |
| `max(selector = null)` | Returns the maximum value, or `null` if the result is empty. |
| `average(selector = null)` | Returns the average value, or `0` if the result is empty. |

> After a terminal method runs, the query's operation queue is cleared. You can
> keep chaining new builder methods on the same query object, and the next
> terminal call will operate on the previously computed result list.

## Examples

See the [examples](examples) directory for runnable, self-contained scripts:

- [examples/basic_filtering.gs](examples/basic_filtering.gs) — `where`, `whereEquals`, `whereGreaterThan`
- [examples/sorting_and_projection.gs](examples/sorting_and_projection.gs) — `sort`, `sortDesc`, `sortBy` with a custom comparator, `select`
- [examples/grouping_and_mapping.gs](examples/grouping_and_mapping.gs) — `groupBy`, `mapBy`, `distinct`
- [examples/aggregations.gs](examples/aggregations.gs) — `count`, `sum`, `min`, `max`, `average`, `first`, `any`

## License

[MIT](LICENSE)
