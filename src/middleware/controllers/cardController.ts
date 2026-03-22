import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

// Issue a new access card to a user
export async function issueCard(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, teamId, cardNumber, cardType } = req.body;

    if (!userId || !teamId || !cardNumber) {
      return res.status(400).json({ error: 'userId, teamId, and cardNumber are required' });
    }

    const card = await prisma.doorAccessCard.create({
      data: {
        teamId,
        userId,
        cardNumber,
        cardType: cardType || 'rfid',
        status: 'active',
      },
    });

    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
}

// Grant access to a specific location
export async function grantAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const { cardId, locationId } = req.body;

    if (!cardId || !locationId) {
      return res.status(400).json({ error: 'cardId and locationId are required' });
    }

    const access = await prisma.cardLocationAccess.create({
      data: {
        cardId,
        locationId,
      },
    });

    res.status(201).json(access);
  } catch (err) {
    next(err);
  }
}

// Revoke access to a location
export async function revokeAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const { cardId, locationId } = req.body;

    const access = await prisma.cardLocationAccess.update({
      where: {
        cardId_locationId: { cardId, locationId },
      },
      data: {
        revokedAt: new Date(),
      },
    });

    res.json(access);
  } catch (err) {
    next(err);
  }
}

// List all cards for a team
export async function listCards(req: Request, res: Response, next: NextFunction) {
  try {
    const teamId = req.query.teamId as string;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    const cards = await prisma.doorAccessCard.findMany({
      where: { teamId },
      include: { user: true, locations: true },
    });

    res.json(cards);
  } catch (err) {
    next(err);
  }
}

// Get a single card
export async function getCard(req: Request, res: Response, next: NextFunction) {
  try {
    const cardId = Array.isArray(req.params.cardId) ? req.params.cardId[0] : req.params.cardId;

    const card = await prisma.doorAccessCard.findUnique({
      where: { id: cardId },
      include: { user: true, locations: true, logs: true },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(card);
  } catch (err) {
    next(err);
  }
}

// Deactivate a card
export async function deactivateCard(req: Request, res: Response, next: NextFunction) {
  try {
    const cardId = Array.isArray(req.params.cardId) ? req.params.cardId[0] : req.params.cardId;

    const card = await prisma.doorAccessCard.update({
      where: { id: cardId },
      data: { status: 'revoked' },
    });

    res.json(card);
  } catch (err) {
    next(err);
  }
}

// List all door locations
export async function listLocations(req: Request, res: Response, next: NextFunction) {
  try {
    const teamId = req.query.teamId as string;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    const locations = await prisma.doorLocation.findMany({
      where: { teamId },
    });

    res.json(locations);
  } catch (err) {
    next(err);
  }
}

// Create a new door location
export async function createLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const { teamId, name, description, zone } = req.body;

    if (!teamId || !name) {
      return res.status(400).json({ error: 'teamId and name are required' });
    }

    const location = await prisma.doorLocation.create({
      data: {
        teamId,
        name,
        description,
        zone: zone || 'main',
      },
    });

    res.status(201).json(location);
  } catch (err) {
    next(err);
  }
}

// Get access logs
export async function getAccessLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const teamId = req.query.teamId as string;
    const locationId = req.query.locationId as string;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    let where: any = { teamId };
    if (locationId) {
      where.locationId = locationId;
    }

    const logs = await prisma.accessLog.findMany({
      where,
      include: { card: { include: { user: true } }, location: true },
      orderBy: { accessTime: 'desc' },
      take: 100,
    });

    res.json(logs);
  } catch (err) {
    next(err);
  }
}
