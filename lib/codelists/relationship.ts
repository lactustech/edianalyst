import type { CodeList } from "./types";

/**
 * INS02 — the member's relationship to the subscriber.
 * Wording is our own plain-English phrasing.
 */
export const relationship: CodeList = {
  "01": "Spouse",
  "03": "Father or mother",
  "04": "Grandparent",
  "05": "Grandchild",
  "07": "Niece or nephew",
  "09": "Adopted child",
  "10": "Foster child",
  "15": "Ward of the subscriber",
  "17": "Stepchild",
  "18": "Self (the subscriber)",
  "19": "Child",
  "23": "Sponsored dependent",
  "24": "Dependent of a minor dependent",
  "25": "Ex-spouse",
  "26": "Guardian",
  "31": "Court-appointed guardian",
  "38": "Collateral dependent",
  "53": "Life partner",
  "60": "Annuitant",
  "D2": "Other relationship",
  G8: "Other relative",
};
