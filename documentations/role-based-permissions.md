# Role-Based Permissions System

Define what each role can do in the app and door access system.

## 🔐 Roles

### SuperAdmin (Editor)
**Permission Level:** Full control

Capabilities:
- ✅ Create, edit, delete all tasks
- ✅ Assign tasks to any team member
- ✅ Change task status (all stages)
- ✅ Manage team roster (add/remove members)
- ✅ Issue and revoke access cards
- ✅ Grant/revoke door location access
- ✅ View all access logs
- ✅ View team analytics

### Admin (Manager)
**Permission Level:** Operational control

Capabilities:
- ✅ Create, edit tasks (own & assigned)
- ✅ Assign tasks to team members
- ✅ Reassign tasks if SuperAdmin unavailable
- ✅ Change task status (In Progress → Review → Published)
- ⚠️ Cannot delete tasks (need SuperAdmin approval)
- ✅ Manage door access for their zone(s)
- ✅ View access logs for assigned areas

### Member
**Permission Level:** Task execution

Capabilities:
- ✅ View assigned tasks
- ✅ Update own task status (Assigned → In Progress)
- ✅ Request status change (In Progress → Review)
- ✅ Add comments to tasks
- ⚠️ Cannot create or assign tasks
- ✅ View own access logs
- ⚠️ Cannot manage access cards

## 🛡️ Permission Checks (Middleware)

### Task Management
```javascript
canCreateTask(user, task) {
  return user.role === 'superadmin' || user.role === 'admin';
}

canEditTask(user, task) {
  return user.role === 'superadmin' || 
         (user.role === 'admin' && task.assigneeId === user.id);
}

canDeleteTask(user, task) {
  return user.role === 'superadmin';
}

canChangeStatus(user, task, newStatus) {
  if (user.role === 'superadmin') return true;
  if (user.role === 'admin') {
    // Admins can move to Review/Published but not back to Assigned
    return ['in_progress', 'review', 'published'].includes(newStatus);
  }
  if (user.role === 'member') {
    // Members can only mark as In Progress
    return newStatus === 'in_progress';
  }
  return false;
}
```

### Door Access Management
```javascript
canIssueCard(user) {
  return user.role === 'superadmin';
}

canGrantAccess(user, location) {
  if (user.role === 'superadmin') return true;
  if (user.role === 'admin') {
    // Admin can grant access to their assigned zones
    return user.assignedZones?.includes(location.zone);
  }
  return false;
}

canViewAccessLog(user, locationId) {
  if (user.role === 'superadmin') return true;
  if (user.role === 'admin') {
    const location = getLocation(locationId);
    return user.assignedZones?.includes(location.zone);
  }
  return false;
}
```

## 🔧 Implementation

Add role checks in middleware before processing requests:

```typescript
// Example middleware
app.use('/api/tasks', async (req, res, next) => {
  const user = await getUser(req.headers['x-user-id']);
  
  if (req.method === 'POST') {
    if (!canCreateTask(user)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
  }
  
  next();
});
```

## 🎯 Sunday Service Workflow with Roles

**Scenario:** Sunday service at 10 AM

1. **SuperAdmin** creates tasks for the service
   - "Setup Media Room" → assign to Media Manager
   - "Greeting at Main Entrance" → assign to Greeter
   - "Run Video Stream" → assign to Video Operator

2. **SuperAdmin** issues access cards (if new members)
   - Creates card for each attendee
   - Grants location access based on role

3. **Admin (Manager)** can cover if SuperAdmin unavailable
   - Reassign tasks if someone is late
   - Approve task completions (move to Published)

4. **Members** execute their tasks
   - Update status as they work
   - Leave comments for other team members
   - Use their access card to enter assigned areas

5. **SuperAdmin** posts-service review
   - Check access logs for attendance
   - Mark tasks as Published
   - Plan for next Sunday
