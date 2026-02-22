import { router } from '@/lib/trpc';
import { userRouter } from './user';
import { listingRouter } from './listing';
import { swipeRouter } from './swipe';
import { matchRouter } from './match';
import { messageRouter } from './message';
import { dropZoneRouter } from './dropZone';
import { circleRouter } from './circle';
import { communityRouter } from './community';
import { karmaRouter } from './karma';
import { offerRouter } from './offer';
import { travelSwapRouter } from './travelswap';

export const appRouter = router({
    user: userRouter,
    listing: listingRouter,
    swipe: swipeRouter,
    match: matchRouter,
    message: messageRouter,
    dropZone: dropZoneRouter,
    circle: circleRouter,
    community: communityRouter,
    karma: karmaRouter,
    offer: offerRouter,
    travelSwap: travelSwapRouter,
});

export type AppRouter = typeof appRouter;

