/* ============================================================================
   NAKAHIWALAY NA FARE CONFIGURATION AT MGA FORMULA
   (Madaling baguhin o i-update ang mga rate nang hindi ginagalaw ang UI)
   ============================================================================ */

const FARE_CONFIG = {
  tricycle: {
    serviceName: "Traysikel",
    source: "City Ordinance No. 2914, Series of 2025 (Lucena City Tricycle Fare Calculator ng grupo)",
    lastVerified: "Nobyembre 2026",
    baseKm: 2,
    regular: {
      label: "Regular Trip",
      baseFare: 20,
      perAdditionalKm: 5
    },
    special: {
      label: "Special Trip",
      baseFare: 60,
      perAdditionalKm: 10
    },
    studentDiscountRate: 0.20
  },

  maxim: {
    serviceName: "Maxim MotoTaxi",
    source: "Screenshot ng Maxim MotoTaxi City Tariff na nakalap ng mga mananaliksik",
    lastVerified: "Nobyembre 2026 (Paunang konfigurasyon; nakabinbin ang opisyal na kumpirmasyon sa bracket computation)",
    minimumFare: 20,
    minimumIncludedKm: 0.0,
    rateUnder1Km: 20,
    rateFrom1Km: 8,
    rateFrom7Km: 12,
    additionalCompensation: 10,
    applyAdditionalCompensation: false, // Huwag idagdag sa ordinaryong biyahe
    // Opsyon: "bracketed_city_estimate" | "base_plus_segments"
    calculationMode: "bracketed_city_estimate",
    roundToWholePeso: true
  },

  joyride: {
    serviceName: "JoyRide MC Taxi",
    source: "Paunang modelo mula sa 30 fare quotations na nakalap ng grupo sa JoyRide app sa Lucena City",
    lastVerified: "Nobyembre 2026 (Paunang mathematical model; may 3 high outlier quotations ₱391, ₱380, ₱346 na biniberipika pa)",
    minimumFare: 50,
    startingComponent: 45,
    perKmCharge: 5,
    roundToWholePeso: true
  }
};

function calculateTricycleFare(distanceKm, options = { tripType: "regular", isStudent: false }) {
  if (typeof distanceKm !== "number" || Number.isNaN(distanceKm) || distanceKm < 0) {
    return { available: false, serviceName: FARE_CONFIG.tricycle.serviceName };
  }

  const cfg = FARE_CONFIG.tricycle;
  const tier = options.tripType === "special" ? cfg.special : cfg.regular;
  const additionalDistance = Math.max(0, distanceKm - cfg.baseKm);
  const additionalCharge = additionalDistance * tier.perAdditionalKm;
  const computedFare = tier.baseFare + additionalCharge;
  const finalFare = options.isStudent ? computedFare * (1 - cfg.studentDiscountRate) : computedFare;
  const roundedFinal = Math.round(finalFare * 100) / 100;

  return {
    available: true,
    serviceName: cfg.serviceName,
    fare: roundedFinal,
    computedFareBeforeDiscount: Math.round(computedFare * 100) / 100,
    tripTypeLabel: tier.label,
    baseKm: cfg.baseKm,
    baseFare: tier.baseFare,
    perAdditionalKm: tier.perAdditionalKm,
    additionalDistance,
    additionalCharge: Math.round(additionalCharge * 100) / 100,
    isStudent: Boolean(options.isStudent),
    discountAmount: options.isStudent ? Math.round((computedFare - finalFare) * 100) / 100 : 0,
    source: cfg.source,
    lastVerified: cfg.lastVerified
  };
}

function calculateMaximFare(distanceKm) {
  if (typeof distanceKm !== "number" || Number.isNaN(distanceKm) || distanceKm < 0) {
    return { available: false, serviceName: FARE_CONFIG.maxim.serviceName };
  }

  const cfg = FARE_CONFIG.maxim;
  let rawFare = cfg.minimumFare;
  const kmUnder1 = Math.min(distanceKm, 1);
  const km1To7 = Math.max(0, Math.min(distanceKm, 7) - 1);
  const km7Plus = Math.max(0, distanceKm - 7);

  const chargeUnder1 = kmUnder1 * cfg.rateUnder1Km;
  const charge1To7 = km1To7 * cfg.rateFrom1Km;
  const charge7Plus = km7Plus * cfg.rateFrom7Km;

  if (cfg.calculationMode === "base_plus_segments") {
    rawFare = cfg.minimumFare + chargeUnder1 + charge1To7 + charge7Plus;
  } else {
    const segmentTotal = chargeUnder1 + charge1To7 + charge7Plus;
    rawFare = Math.max(cfg.minimumFare, segmentTotal);
  }

  if (cfg.applyAdditionalCompensation) {
    rawFare += cfg.additionalCompensation;
  }

  const finalFare = cfg.roundToWholePeso ? Math.round(rawFare) : Math.round(rawFare * 100) / 100;

  return {
    available: true,
    serviceName: cfg.serviceName,
    fare: finalFare,
    rawFare: Math.round(rawFare * 100) / 100,
    calculationMode: cfg.calculationMode,
    kmUnder1,
    km1To7,
    km7Plus,
    chargeUnder1: Math.round(chargeUnder1 * 100) / 100,
    charge1To7: Math.round(charge1To7 * 100) / 100,
    charge7Plus: Math.round(charge7Plus * 100) / 100,
    minimumFare: cfg.minimumFare,
    additionalCompensationApplied: cfg.applyAdditionalCompensation,
    source: cfg.source,
    lastVerified: cfg.lastVerified
  };
}

function calculateJoyRideFare(distanceKm) {
  if (typeof distanceKm !== "number" || Number.isNaN(distanceKm) || distanceKm < 0) {
    return { available: false, serviceName: FARE_CONFIG.joyride.serviceName };
  }

  const cfg = FARE_CONFIG.joyride;
  const additionalDistanceCharge = cfg.perKmCharge * distanceKm;
  const linearEstimate = cfg.startingComponent + additionalDistanceCharge;
  const rawFare = Math.max(cfg.minimumFare, linearEstimate);
  const finalFare = cfg.roundToWholePeso ? Math.round(rawFare) : Math.round(rawFare * 100) / 100;

  return {
    available: true,
    serviceName: cfg.serviceName,
    fare: finalFare,
    startingComponent: cfg.startingComponent,
    perKmCharge: cfg.perKmCharge,
    additionalDistanceCharge: Math.round(additionalDistanceCharge * 100) / 100,
    linearEstimate: Math.round(linearEstimate * 100) / 100,
    minimumFloorApplied: linearEstimate < cfg.minimumFare,
    minimumFare: cfg.minimumFare,
    source: cfg.source,
    lastVerified: cfg.lastVerified
  };
}