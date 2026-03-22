# Service Date Feature

Organize tasks by Sunday service dates.

## 📅 Schema Addition

Add `serviceDate` field to the Task model:

```prisma
model Task {
  id          String    @id @default(uuid())
  // ... existing fields ...
  serviceDate DateTime?  // Which Sunday service (e.g., 2026-03-24 10:00 AM)
}
```

## 🎯 Use Case: Sunday Services

### Workflow
1. **Create task for specific Sunday**
   - Title: "Setup Media Room"
   - Service Date: Sunday, March 24, 2026 @ 10:00 AM
   - Assign to: Media Manager

2. **View task board filtered by service date**
   - Click "This Sunday" to see all tasks for the upcoming service
   - Filter by status: "What still needs to be done?"
   - Quick mobile view: "Who's doing what this Sunday?"

3. **During service**
   - Update task status (Assigned → In Progress → Review → Published)
   - Track attendance via access logs

4. **Post-service**
   - Archive completed tasks
   - Reference for next Sunday's prep

## 📊 Filtering Examples

### Frontend Queries
```typescript
// Get all tasks for a specific Sunday
const getTassk(teamId, serviceDate) => {
  return axios.get('/api/tasks', {
    params: { teamId, serviceDate }
  });
};

// Get this Sunday's tasks
const getThisSundaysTasks(teamId) => {
  const thisSunday = getUpcomingSunday();
  return getTasks(teamId, thisSunday);
};

// Get all tasks without a service date (general/recurring)
const getGeneralTasks(teamId) => {
  return axios.get('/api/tasks', {
    params: { teamId, hasServiceDate: false }
  });
};
```

### Backend Implementation
```typescript
// List tasks filtered by serviceDate
app.get('/api/tasks', (req, res) => {
  const { teamId, serviceDate } = req.query;
  
  let where = { teamId };
  
  if (serviceDate) {
    // Filter by date range (entire day)
    const startOfDay = new Date(serviceDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(serviceDate);
    endOfDay.setHours(23, 59, 59);
    
    where.serviceDate = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }
  
  const tasks = prisma.task.findMany({ where });
  res.json(tasks);
});
```

## 🗓️ UI Components

### Service Date Picker (Frontend)
```typescript
// In CreateTaskScreen & TaskDetailScreen
<View>
  <Text>Service Date (Sunday)</Text>
  <DatePicker
    value={serviceDate}
    onChange={setServiceDate}
    placeholder="Select Sunday"
  />
</View>
```

### Task Board with Service Date Filter
```typescript
// In HomeScreen
<View style={styles.filterRow}>
  <Button
    title={`This Sunday (${getDisplayDate()})`}
    onPress={() => filterByThisSunday()}
  />
  <Button
    title="General Tasks"
    onPress={() => filterByGeneral()}
  />
  <Button
    title="All Dates"
    onPress={() => clearFilter()}
  />
</View>
```

## 💡 Examples

### Sunday, March 24, 2026 @ 10:00 AM Service Tasks
| Task | Assigned To | Status | Service Date |
|------|-------------|--------|--------------|
| Setup Media Room | John | Assigned | Mar 24, 10 AM |
| Sound Check | Sarah | In Progress | Mar 24, 10 AM |
| Greeting Team | Mike | Assigned | Mar 24, 10 AM |
| Video Stream | Alex | Assigned | Mar 24, 10 AM |

### General Tasks (No Service Date)
| Task | Assigned To | Status | Service Date |
|------|-------------|--------|--------------|
| Update Assets | Design Team | Review | — |
| Maintenance | Tech Lead | In Progress | — |

## 🔄 Recurring Services

For recurring Sunday services, consider adding:

```prisma
model ServiceTemplate {
  id          String   @id @default(uuid())
  teamId      String   @relation("Team")
  name        String   // "Sunday Service", "Wednesday Night"
  recurrence  String   // "weekly", "monthly"
  timeOfDay   DateTime // Time portion (10:00 AM)
}
```

Then clone tasks from the template each Sunday.

## 🚀 Future Enhancements

- **Calendar view:** Visual Sunday service schedule
- **Recurring templates:** Auto-create tasks from template
- **Notifications:** Remind team 24 hours before service
- **Pre-service checklist:** Task must-haves before each Sunday
- **Post-service report:** Summary of completed tasks & attendance
