/**
 * Swiss Education Domain Configuration
 *
 * This file contains the whitelist of Swiss education-related email domains
 * that qualify for automatic teacher verification.
 */

// Generic Swiss education domains (suffix matching)
const SWISS_EDUCATION_SUFFIXES = [".edu.ch", ".school.ch", ".schule.ch", ".schulen.ch"];

// Cantonal and municipal school domains
const CANTONAL_SCHOOL_DOMAINS = [
  // Zurich
  "schulen.zuerich.ch",
  "stadt-zuerich.ch",
  "schule-zuerich.ch",
  "schule.zuerich.ch",
  "kloten.ch",
  "schule-uster.ch",
  "schule-winterthur.ch",

  // Basel
  "edubs.ch", // Erziehungsdepartement Basel-Stadt
  "sbl.ch", // Schulen Basel-Landschaft

  // Bern
  "schulen-bern.ch",
  "erz.be.ch", // Erziehungsdirektion Bern

  // Geneva
  "edu.ge.ch",
  "etat.ge.ch",

  // Vaud
  "edu.vd.ch",
  "vd.ch",

  // Neuchâtel
  "rpn.ch", // Réseau pédagogique neuchâtelois
  "ne.ch",

  // Fribourg
  "edufr.ch",
  "fr.ch",

  // Valais
  "edu.vs.ch",
  "vs.ch",

  // Ticino
  "edu.ti.ch",
  "ti.ch",

  // St. Gallen
  "sg.ch",
  "schule-sg.ch",

  // Aargau
  "ag.ch",
  "schulen-aargau.ch",

  // Lucerne
  "lu.ch",
  "stadtluzern.ch",

  // Other cantons
  "so.ch", // Solothurn
  "sh.ch", // Schaffhausen
  "tg.ch", // Thurgau
  "gr.ch", // Graubünden
  "gl.ch", // Glarus
  "sz.ch", // Schwyz
  "ow.ch", // Obwalden
  "nw.ch", // Nidwalden
  "ur.ch", // Uri
  "zg.ch", // Zug
  "ai.ch", // Appenzell Innerrhoden
  "ar.ch", // Appenzell Ausserrhoden
  "ju.ch", // Jura
];

// Universities and Pädagogische Hochschulen (PH)
const UNIVERSITY_DOMAINS = [
  // Pädagogische Hochschulen
  "phzh.ch", // PH Zürich
  "phbern.ch", // PH Bern
  "fhnw.ch", // Fachhochschule Nordwestschweiz (includes PH)
  "phlu.ch", // PH Luzern
  "phsg.ch", // PH St. Gallen
  "phgr.ch", // PH Graubünden
  "supsi.ch", // PH Ticino (SUPSI-DFA)
  "hepvs.ch", // HEP Valais
  "hepl.ch", // HEP Lausanne
  "hep-bejune.ch", // HEP BEJUNE
  "phsh.ch", // PH Schaffhausen
  "phtg.ch", // PH Thurgau
  "phsz.ch", // PH Schwyz
  "hfh.ch", // Interkantonale Hochschule für Heilpädagogik
  "kphvie.ac.at", // For cross-border teachers

  // Universities
  "uzh.ch", // Universität Zürich
  "ethz.ch", // ETH Zürich
  "unibe.ch", // Universität Bern
  "unibas.ch", // Universität Basel
  "unisg.ch", // Universität St. Gallen
  "unifr.ch", // Université de Fribourg
  "unige.ch", // Université de Genève
  "unil.ch", // Université de Lausanne
  "unine.ch", // Université de Neuchâtel
  "usi.ch", // Università della Svizzera italiana
  "epfl.ch", // EPF Lausanne
  "unilu.ch", // Universität Luzern

  // Fachhochschulen
  "zhaw.ch", // ZHAW
  "hslu.ch", // Hochschule Luzern
  "bfh.ch", // Berner Fachhochschule
  "ost.ch", // OST - Ostschweizer Fachhochschule
  "hes-so.ch", // HES-SO
];

// Swiss national education domains
const NATIONAL_EDUCATION_DOMAINS = [
  "educa.ch", // Swiss education platform
  "educanet2.ch",
  "swissuniversities.ch",
  "sbfi.admin.ch", // State Secretariat for Education
  "edk.ch", // Swiss Conference of Cantonal Ministers of Education
];

// Combine all known domains
const ALL_KNOWN_DOMAINS = [
  ...CANTONAL_SCHOOL_DOMAINS,
  ...UNIVERSITY_DOMAINS,
  ...NATIONAL_EDUCATION_DOMAINS,
];

/**
 * Check if an email address belongs to a Swiss education institution
 *
 * @param email - The email address to check
 * @returns true if the email domain is a recognized Swiss education domain
 */
export function isSwissEducationDomain(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailLower = email.toLowerCase().trim();
  const atIndex = emailLower.lastIndexOf("@");

  if (atIndex === -1) {
    return false;
  }

  const domain = emailLower.substring(atIndex + 1);

  // Check exact domain matches first
  if (ALL_KNOWN_DOMAINS.includes(domain)) {
    return true;
  }

  // Check suffix matches (e.g., .edu.ch, .school.ch)
  for (const suffix of SWISS_EDUCATION_SUFFIXES) {
    if (domain.endsWith(suffix)) {
      return true;
    }
  }

  // Check additional domains from environment variable
  const additionalDomains = process.env.ADDITIONAL_EDUCATION_DOMAINS;
  if (additionalDomains) {
    const extraDomains = additionalDomains.split(",").map((d) => d.trim().toLowerCase());
    if (extraDomains.includes(domain)) {
      return true;
    }
    // Also check suffix matches for additional domains
    for (const extraDomain of extraDomains) {
      if (extraDomain.startsWith(".") && domain.endsWith(extraDomain)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get the verification method based on the email domain
 *
 * @param email - The email address
 * @returns The verification method identifier
 */
export function getVerificationMethod(email: string): "email_domain" | null {
  if (isSwissEducationDomain(email)) {
    return "email_domain";
  }
  return null;
}

// Export domain lists for testing and admin purposes
export const swissEducationDomains = {
  suffixes: SWISS_EDUCATION_SUFFIXES,
  cantonal: CANTONAL_SCHOOL_DOMAINS,
  universities: UNIVERSITY_DOMAINS,
  national: NATIONAL_EDUCATION_DOMAINS,
};
