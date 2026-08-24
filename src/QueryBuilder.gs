// LINQ-like deferred query pipeline: 
// builder methods queue operations, terminal methods execute them once.
Query = {}
Query.items = []
Query.operations = []
// Creates a new Query object with a copy of the given list. The original list is not modified.
Query.ctor = function(list)
    result = new Query
    result.items = list[:]
    result.operations = []
    return result
end function

Query.where = function(predicate)
    self.operations.push({"type": "where", "predicate": @predicate})
    return self
end function

Query.whereEquals = function(selector, value)
    self.operations.push({"type": "where_eq", "selector": @selector, "value": value})
    return self
end function

Query.whereNotEquals = function(selector, value)
    self.operations.push({"type": "where_neq", "selector": @selector, "value": value})
    return self
end function

Query.whereIn = function(selector, values)
    self.operations.push({"type": "where_in", "selector": @selector, "values": values})
    return self
end function

Query.whereNotIn = function(selector, values)
    self.operations.push({"type": "where_not_in", "selector": @selector, "values": values})
    return self
end function

Query.whereGreaterThan = function(selector, value)
    self.operations.push({"type": "where_gt", "selector": @selector, "value": value})
    return self
end function

Query.whereLessThan = function(selector, value)
    self.operations.push({"type": "where_lt", "selector": @selector, "value": value})
    return self
end function

Query.select = function(selector)
    self.operations.push({"type": "select", "selector": @selector})
    return self
end function

Query.selectMany = function(selector)
    self.operations.push({"type": "selectMany", "selector": @selector})
    return self
end function

Query.take = function(count)
    self.operations.push({"type": "take", "count": count})
    return self
end function

Query.skip = function(count)
    self.operations.push({"type": "skip", "count": count})
    return self
end function

Query.sort = function(selector = null)
    return self.sortBy(@selector, null, false)
end function

Query.sortDesc = function(selector = null)
    return self.sortBy(@selector, null, true)
end function

Query.sortBy = function(selector = null, comparator = null, descending = false)
    op = {"type": "sortBy", "selector": @selector, "descending": descending}
    if @comparator != null then op.comparator = @comparator else op.comparator = null
    self.operations.push(op)
    return self
end function

Query.groupBy = function(selector)
    op = {"type": "groupBy", "selector": @selector}
    self.operations.push(op)
    return self
end function

Query.mapBy = function(selector)
    op = {"type": "mapBy", "selector": @selector}
    self.operations.push(op)
    return self
end function

Query.distinct = function(selector = null)
    op = {"type": "distinct"}
    if @selector != null then op.selector = @selector else op.selector = null
    self.operations.push(op)
    return self
end function

Query.reverse = function()
    self.operations.push({"type": "reverse"})
    return self
end function

Query.handleSelector = function(item, selector)
    if @selector == null then return item
    if typeof(@selector) == "function" then 
        return selector(item)
    else
        return item[selector]
    end if
end function

Query.applyWhere = function(list, predicate)
    result = []
    for item in list
        if predicate(item) then result.push(item)
    end for
    return result
end function

Query.applyWhereEquals = function(list, selector, value, equals)
    result = []
    for item in list
        if equals then
            if self.handleSelector(item, @selector) == value then result.push(item)
        else
            if self.handleSelector(item, @selector) != value then result.push(item)
        end if
    end for
    return result
end function

Query.applyWhereIn = function(list, selector, values, inList)
    result = []
    for item in list
        if inList then
            if values.indexOf(self.handleSelector(item, @selector)) != null then result.push(item)
        else
            if values.indexOf(self.handleSelector(item, @selector)) == null then result.push(item)
        end if
    end for
    return result
end function

Query.applyWhereCompare = function(list, selector, value, isGreater)
    result = []
    for item in list
        if isGreater then
            if self.handleSelector(item, @selector) > value then result.push(item)
        else
            if self.handleSelector(item, @selector) < value then result.push(item)
        end if
    end for
    return result
end function

Query.applySelect = function(list, selector)
    result = []
    for item in list
        result.push(self.handleSelector(item, @selector))
    end for
    return result
end function

Query.applySelectMany = function(list, selector)
    result = []
    for item in list
        sublist = self.handleSelector(item, @selector)
        if typeof(sublist) != "list" then
            print("<color=#ff0000>Type error, expected list but got " + typeof(sublist) + " using selector " + @selector + " for item " + item + "</color>")
            exit(1)
        end if
        for subitem in sublist
            result.push(subitem)
        end for
    end for
    return result
    end function

// built-in list.sort
Query.applyOrderBy = function(list, keySelector, descending)
    tuples = []
    for item in list
        tuples.push({"key": self.handleSelector(item, @keySelector), "value": item})
    end for
    tuples.sort("key", not descending)
    result = []
    for tuple in tuples
        result.push(tuple.value)
    end for
    return result
end function

Query.applySortBy = function(list, selector, comparator, descending)
    if @comparator == null then
        result = self.applyOrderBy(list, @selector, descending)
        return result
    end if
    return self.insertionSortBy(list, @selector, @comparator, descending)
end function

// insertion sort for cases with custom comparators
Query.insertionSortBy = function(list, selector, comparator, descending)
    result = list[:]
    if result.len < 2 then return result
    for i in range(1, result.len - 1)
        current = result[i]
        j = i - 1
        if descending then
            while j >= 0 and comparator(self.handleSelector(current, @selector), self.handleSelector(result[j], @selector))
                result[j + 1] = result[j]
                j = j - 1
            end while
        else
            while j >= 0 and comparator(self.handleSelector(result[j], @selector), self.handleSelector(current, @selector))
                result[j + 1] = result[j]
                j = j - 1
            end while
        end if
        result[j + 1] = current
    end for
    return result
end function

Query.applyGroupBy = function(list, selector)
    groups = {}
    for item in list
        key = self.handleSelector(item, @selector)
        if not groups.hasIndex(key) then groups[key] = []
        groups[key].push(item)
    end for
    return groups
end function

// Default behavior: if multiple items have the same key, the last one wins. 
Query.applyMapBy = function(list, selector)
    result = {}
    for item in list
        key = self.handleSelector(item, @selector)
        if not result.hasIndex(key) then result[key] = item
        result[key] = item
    end for
    return result
end function

Query.applyDistinct = function(list, selector)
    result = []
    seenKeys = []
    for item in list
        if @selector == null then key = item else key = self.handleSelector(item, @selector)
        if seenKeys.indexOf(key) == null then
            seenKeys.push(key)
            result.push(item)
        end if
    end for
    return result
end function

Query.applyReverse = function(list)
    if list.len == 0 then return []
    result = []
    for i in range(list.len - 1, 0)
        result.push(list[i])
    end for
    return result
end function

Query.applyOperation = function(list, op)
    if op.type == "where" then
        return self.applyWhere(list, @op.predicate)
    else if op.type == "where_eq" then
        return self.applyWhereEquals(list, @op.selector, @op.value, true)
    else if op.type == "where_neq" then
        return self.applyWhereEquals(list, @op.selector, @op.value, false)
    else if op.type == "where_in" then
        return self.applyWhereIn(list, @op.selector, op.values, true)
    else if op.type == "where_not_in" then
        return self.applyWhereIn(list, @op.selector, op.values, false)
    else if op.type == "where_gt" then
        return self.applyWhereCompare(list, @op.selector, @op.value, true)
    else if op.type == "where_lt" then
        return self.applyWhereCompare(list, @op.selector, @op.value, false)
    else if op.type == "select" then
        return self.applySelect(list, @op.selector)
    else if op.type == "selectMany" then
        return self.applySelectMany(list, @op.selector)
    else if op.type == "sortBy" then
        return self.applySortBy(list, @op.selector, @op.comparator, op.descending)
    else if op.type == "groupBy" then
        return self.applyGroupBy(list, @op.selector)
    else if op.type == "mapBy" then
        return self.applyMapBy(list, @op.selector)
    else if op.type == "distinct" then
        return self.applyDistinct(list, @op.selector)
    else if op.type == "reverse" then
        return self.applyReverse(list)
    else if op.type == "take" then
        return list[:op.count]
    else if op.type == "skip" then
        return list[op.count:]
    end if
    return list
end function

// runs the queued pipeline once, folds the result back into items and clears the pool
Query.execute = function()
    working = self.items
    for op in self.operations
        working = self.applyOperation(working, op)
    end for
    self.items = working
    self.operations = []
    return working
end function

Query.toList = function()
    return self.execute()
end function

Query.first = function()
    list = self.execute()
    if list.len == 0 then return null
    return list[0]
end function

Query.any = function()
    return self.execute().len > 0
end function

Query.count = function()
    return self.execute().len
end function

// selector picks the value to aggregate; defaults to the item itself
Query.sum = function(selector = null)
    list = self.execute()
    total = 0
    for item in list
        if @selector == null then value = item else value = self.handleSelector(item, @selector)
        total = total + value
    end for
    return total
end function

Query.min = function(selector = null)
    list = self.execute()
    if list.len == 0 then return null
    best = null
    for item in list
        if @selector == null then value = item else value = self.handleSelector(item, @selector)
        if best == null or value < best then best = value
    end for
    return best
end function

Query.max = function(selector = null)
    list = self.execute()
    if list.len == 0 then return null
    best = null
    for item in list
        if @selector == null then value = item else value = self.handleSelector(item, @selector)
        if best == null or value > best then best = value
    end for
    return best
end function

Query.average = function(selector = null)
    list = self.execute()
    if list.len == 0 then return 0
    total = 0
    for item in list
        if @selector == null then value = item else value = self.handleSelector(item, @selector)
        total = total + value
    end for
    return total / list.len
end function

QueryBuilder = {}
QueryBuilder.from = function(list)
    return Query.ctor(list)
end function