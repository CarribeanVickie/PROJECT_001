# Door Access Card System

Future feature for managing physical access cards for Sunday services and building areas.

## 📋 Overview

The door access card system tracks:
- Which team members have physical access cards
- Which doors/zones each card can access
- When cards are issued, expire, or are revoked
- Access logs (who accessed what door, when)

## 🗂️ Data Models

### DoorLocation
Represents a physical door, room, or area in the building.

```typescript
{
  id: string                 // UUID
  teamId: string            // FK to Team
  name: string              // "Main Entrance", "Media Room", etc.
  description?: string      // Optional details
  zone: string              // Grouping (default: "main")
  cardAccess: CardLocationAccess[]  // Which cards can access
  logs: AccessLog[]         // Access history
  createdAt: DateTime
  updatedAt: DateTime
}
```

### DoorAccessCard
Represents a physical RFID or key card issued to a user.

```typescript
{
  id: string                // UUID
  teamId: string           // FK to Team
  userId: string           // FK to User (1:1 relationship)
  cardNumber: string       // Unique card ID (e.g., RFID number)
  cardType: string         // "rfid", "keycard", "badge" (default: "rfid")
  status: string           // "active", "inactive", "revoked"
  locations: CardLocationAccess[]  // Which doors/zones this card can access
  issuedAt: DateTime       // When card was issued
  expiresAt?: DateTime     // Optional expiration date
  createdAt: DateTime
  updatedAt: DateTime
  logs: AccessLog[]        // Access history
}
```

### CardLocationAccess (Junction Table)
Links cards to locations, enabling many-to-many access assignments.

```typescript
{
  id: string               // UUID
  cardId: string          // FK to DoorAccessCard
  locationId: string      // FK to DoorLocation
  grantedAt: DateTime     // When access was granted
  revokedAt?: DateTime    // When access was revoked (NULL = active)
}
```

### AccessLog
Records every access attempt (success or failure).

```typescript
{
  id: string              // UUID
  teamId: string         // FK to Team
  cardId: string         // FK to DoorAccessCard
  locationId: string     // FK to DoorLocation
  accessTime: DateTime   // When access occurred
  status: string         // "allowed", "denied", "unauthorized"
  createdAt: DateTime
}
```

## 🎯 Use Cases

### 1) Issue a Card to a Team Member
```sql
-- Create card
INSERT INTO DoorAccessCard (id, teamId, userId, cardNumber, cardType, status)
VALUES ('card_1', 'team_1', 'user_1', 'RFID-123456', 'rfid', 'active');

-- Grant access to Media Room
INSERT INTO CardLocationAccess (cardId, locationId, grantedAt)
VALUES ('card_1', 'location_media_room', now());
```

### 2) Grant Access to a Door
```sql
-- User's card can now access Main Entrance + Media Room
INSERT INTO CardLocationAccess (cardId, locationId)
VALUES ('card_1', 'location_main_entrance');
```

### 3) Revoke Access
```sql
-- Mark access as revoked
UPDATE CardLocationAccess SET revokedAt = now()
WHERE cardId = 'card_1' AND locationId = 'location_media_room';

-- Or deactivate the entire card
UPDATE DoorAccessCard SET status = 'revoked' WHERE id = 'card_1';
```

### 4) Track Access
```sql
-- View all access logs for a location
SELECT * FROM AccessLog
WHERE locationId = 'location_main_entrance'
ORDER BY accessTime DESC;

-- View all access by a user
SELECT * FROM AccessLog
INNER JOIN DoorAccessCard ON AccessLog.cardId = DoorAccessCard.id
WHERE DoorAccessCard.userId = 'user_1'
ORDER BY AccessLog.accessTime DESC;
```

## 🔄 Workflow for Sunday Services

1. **Assign roles** in the app (SuperAdmin, Admin, Member)
2. **Create tasks** for Sunday service (e.g., "Setup Media Room", "Greeting at Main Entrance")
3. **Issue access cards** based on assigned task locations
4. **Grant location access** via CardLocationAccess
5. **Monitor access logs** during service
6. **Audit** who accessed what, and when

Example:
- **SuperAdmin (Editor):** Full access to all zones
- **Admin (Manager):** Media Room + Control Room
- **Member (Greeter):** Main Entrance only

## 🚀 Future Enhancements

- **Door hardware integration:** API calls to physical door systems (Salto, Schindler, etc.)
- **Mobile app updates:** Show card status, request access, etc.
- **Scheduled access:** Auto-grant/revoke for specific dates/times
- **QR code badges:** Alternative to RFID cards
- **Mobile credentials:** Digital wallet access (Apple Wallet, Android Wallet)
- **Analytics:** Badge usage heatmaps, peak access times

## 🔗 Related Models

- **User:** issueAt → User (1:1)
- **Team:** owns → DoorLocation, DoorAccessCard, AccessLog
- **Task:** could link to required DoorLocation access
