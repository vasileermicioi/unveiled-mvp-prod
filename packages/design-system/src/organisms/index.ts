export * from "./_shared/loading-skeleton";
export * from "./admin";
export * from "./auth";
export * from "./bookings";
export * from "./discovery";
export * from "./landing/landing-footer";
export * from "./landing/landing-header";
export * from "./landing/landing-hero";
export * from "./landing/landing-template";
export * from "./members";
export * from "./partner-portal";
export * from "./payments";
export * from "./shell";

import * as LoadingSkeleton from "./_shared/loading-skeleton";
import * as Admin from "./admin";
import * as Auth from "./auth";
import * as Bookings from "./bookings";
import * as Discovery from "./discovery";
import * as LandingFooter from "./landing/landing-footer";
import * as LandingHeader from "./landing/landing-header";
import * as LandingHero from "./landing/landing-hero";
import * as LandingTemplate from "./landing/landing-template";
import * as Members from "./members";
import * as PartnerPortal from "./partner-portal";
import * as Payments from "./payments";
import * as Shell from "./shell";

export const Organisms = {
  ...Admin,
  ...Auth,
  ...Bookings,
  ...Discovery,
  ...LandingFooter,
  ...LandingHeader,
  ...LandingHero,
  ...LandingTemplate,
  ...LoadingSkeleton,
  ...Members,
  ...PartnerPortal,
  ...Payments,
  ...Shell,
} as const;
