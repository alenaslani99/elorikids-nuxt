/**
 * Bex Express API client.
 *
 * Two endpoints on two different hosts:
 *   postShipments           -> POST https://api.bex.rs:62503/ship/api/Ship/postShipments
 *   getLabelWithProperties   -> GET  https://integrations.bexexpress.rs/api/Shipments/getLabelWithProperties
 *
 * Auth is a custom header, NOT Bearer:  X-Auth-Token: <BEX_API_TOKEN>.
 *
 * The sender (shop) is identified to Bex by KlijentId alone
 * (NameType=3, Name1=BEX_CLIENT_ID). Bex knows our pickup address and
 * contact phone from the contract, so we send no sender name/street.
 *
 * Receiver address is free text (AdressType=1) using exactly what the
 * customer typed at checkout. The DB stores combined "Ulica Broj" in a
 * single `address` column; we split it back into Street + HouseNumber(int)
 * + Apartment(string) here.
 *
 * The shop is cash-on-delivery only, so payType=2 (receiver pays cash)
 * and payToSender = order grandTotal in RSD (the otkup amount, max 100k).
 */
import type { H3Event } from "h3";

// ── Bex config ──────────────────────────────────────────────────────

export interface BexConfig {
  token: string;
  clientId: string;
  postShipmentsUrl: string;
  getLabelUrl: string;
}

/**
 * Read Bex config from the Cloudflare env (production) or process.env
 * (local dev). Returns null if token or clientId are unset - callers
 * should surface a friendly error in that case.
 */
export function getBexConfig(event: H3Event): BexConfig | null {
  const cloudflare = (event.context as any).cloudflare;
  const env = cloudflare?.env ?? (globalThis as any).process?.env ?? {};

  const token = env.BEX_API_TOKEN;
  const clientId = env.BEX_CLIENT_ID;
  if (!token || !clientId) return null;

  return {
    token,
    clientId,
    postShipmentsUrl:
      env.BEX_POST_SHIPMENTS_URL ||
      "https://api.bex.rs:62503/ship/api/Ship/postShipments",
    getLabelUrl:
      env.BEX_GET_LABEL_URL ||
      "https://integrations.bexexpress.rs/api/Shipments/getLabelWithProperties",
  };
}

// ── Types for postShipments ──────────────────────────────────────────

interface BexTask {
  Type: number;
  NameType: number;
  Name1: string;
  Name2: string;
  TaxId: string;
  AdressType: number;
  Municipalities: number;
  Place: string;
  Street: string;
  HouseNumber: number;
  Apartment: string;
  ContactPerson: string;
  Phone: string;
}

interface BexShipment {
  shipmentId: number;
  serviceSpeed: number;
  shipmentType: number;
  shipmentCategory: number;
  shipmentWeight: number;
  totalPackages: number;
  invoiceAmount: number;
  shipmentContents: number;
  commentPublic: string;
  commentPrivate: string;
  payType: number;
  payToSender: number;
  tasks: BexTask[];
}

interface PostShipmentsResponse {
  shipmentsResultList?: Array<{
    state: boolean;
    shipmentId: number;
    err: string;
  }>;
  reqstate?: boolean;
  reqerr?: string;
}

// ── Address splitting ───────────────────────────────────────────────

/**
 * The orders.address column stores combined "Ulica Broj", e.g.
 * "Bulevar oslobođenja 13", "Bulevar oslobođenja 13/7", or "... BB".
 * The street number is always the LAST space-separated token
 * (enforced by checkout: a separate streetNumber field is validated
 * against /^(\d+|\d+\/\d+|bb)$/i before being concatenated).
 *
 * Bex wants: HouseNumber (int, 0 if none) + Apartment (string, the
 * non-numeric remainder like "7" or "a/23"). "BB" has no number.
 */
function splitAddress(combined: string): {
  street: string;
  houseNumber: number;
  apartment: string;
} {
  const trimmed = combined.trim();
  const lastSpace = trimmed.lastIndexOf(" ");

  // No space at all - treat the whole string as a street name, no number.
  if (lastSpace === -1) {
    return { street: trimmed, houseNumber: 0, apartment: "" };
  }

  const street = trimmed.slice(0, lastSpace);
  const rawNumber = trimmed.slice(lastSpace + 1);
  const upper = rawNumber.toUpperCase();

  // "BB" (bez broja / no number) - no house number.
  if (upper === "BB") {
    return { street, houseNumber: 0, apartment: "" };
  }

  // "13"       -> house 13, no apartment.
  // "13/7"     -> house 13, apartment "7".
  // "13/7a/23" -> house 13, apartment "7a/23" (slash-separated parts).
  const slashIdx = rawNumber.indexOf("/");
  if (slashIdx === -1) {
    const num = Number(rawNumber);
    return {
      street,
      houseNumber: Number.isFinite(num) ? num : 0,
      apartment: "",
    };
  }

  const numPart = rawNumber.slice(0, slashIdx);
  const aptPart = rawNumber.slice(slashIdx + 1);
  const num = Number(numPart);
  return {
    street,
    houseNumber: Number.isFinite(num) ? num : 0,
    apartment: aptPart.slice(0, 8), // Bex Apartment field max 8 chars
  };
}

/**
 * The orders.customer_name column stores a single full-name string
 * ("Ime Prezime"). Bex's NameType=1 (physical person) wants Name1 = last
 * name, Name2 = first name. We treat the LAST word as the surname.
 */
function splitName(fullName: string): { lastName: string; firstName: string } {
  const trimmed = fullName.trim();
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace === -1) {
    // Single token - treat it as the last name, first name empty.
    return { lastName: trimmed.slice(0, 50), firstName: "" };
  }
  return {
    lastName: trimmed.slice(lastSpace + 1, lastSpace + 51).slice(0, 50),
    firstName: trimmed.slice(0, lastSpace).slice(0, 50),
  };
}

// ── Order input (what the caller passes to createShipment) ──────────

export interface BexOrderInput {
  trackNumber: string;
  customerName: string;
  phone: string;
  address: string; // combined "Ulica Broj"
  city: string;
  grandTotal: number; // RSD, the otkup amount
  note?: string | null; // customer note from checkout
}

/**
 * Build the postShipments request body for a single COD shipment.
 */
function buildShipmentBody(
  order: BexOrderInput,
  clientId: string,
): { shipmentslist: BexShipment[] } {
  const { street, houseNumber, apartment } = splitAddress(order.address);
  const { lastName, firstName } = splitName(order.customerName);

  // Sender (Type=1): identified by KlijentID only. All other fields
  // left at default - Bex resolves the pickup from the contract.
  const senderTask: BexTask = {
    Type: 1,
    NameType: 3,
    Name1: clientId,
    Name2: "",
    TaxId: "",
    AdressType: 1,
    Municipalities: 0,
    Place: "",
    Street: "",
    HouseNumber: 0,
    Apartment: "",
    ContactPerson: "",
    Phone: "",
  };

  // Receiver (Type=2): physical person, free-text address.
  const receiverTask: BexTask = {
    Type: 2,
    NameType: 1,
    Name1: lastName,
    Name2: firstName,
    TaxId: "",
    AdressType: 1,
    Municipalities: 0,
    Place: order.city.slice(0, 45),
    Street: street.slice(0, 50),
    HouseNumber: houseNumber,
    Apartment: apartment,
    ContactPerson: "",
    Phone: order.phone.slice(0, 50),
  };

  return {
    shipmentslist: [
      {
        shipmentId: 0,
        serviceSpeed: 1,
        shipmentType: 1,
        shipmentCategory: 1,
        shipmentWeight: 0,
        totalPackages: 1,
        invoiceAmount: 0,
        shipmentContents: 22, // TODO: confirm enum value for books
        commentPublic: (order.note ?? "").slice(0, 255), // printed on the label
        commentPrivate: order.trackNumber.slice(0, 255), // internal cross-reference
        payType: 2, // Primalac gotovina = COD
        payToSender: order.grandTotal, // otkup amount (max 100,000 RSD)
        tasks: [senderTask, receiverTask],
      },
    ],
  };
}

/**
 * Create a shipment in Bex and return the Bex shipmentId.
 * Throws createError with a user-friendly Serbian message on failure.
 */
export async function createShipment(
  event: H3Event,
  order: BexOrderInput,
): Promise<number> {
  const config = getBexConfig(event);
  if (!config) {
    throw createError({
      statusCode: 503,
      statusMessage:
        "Bex API nije konfigurisan (nedostaju BEX_API_TOKEN ili BEX_CLIENT_ID).",
    });
  }

  const body = buildShipmentBody(order, config.clientId);

  let res: Response;
  try {
    res = await fetch(config.postShipmentsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        "X-Auth-Token": config.token,
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Network failure - retry once.
    try {
      res = await fetch(config.postShipmentsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "X-Auth-Token": config.token,
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw createError({
        statusCode: 502,
        statusMessage: "Bex API nije dostupan.",
      });
    }
  }

  if (!res.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: `Bex API greška: ${res.status}.`,
    });
  }

  const data = (await res.json()) as PostShipmentsResponse;

  // Whole-request failure.
  if (data.reqstate === false) {
    throw createError({
      statusCode: 502,
      statusMessage: `Bex: ${data.reqerr || "zahtev odbijen."}`,
    });
  }

  const result = data.shipmentsResultList?.[0];
  if (!result || result.state === false) {
    throw createError({
      statusCode: 502,
      statusMessage: `Bex: ${result?.err || "pošiljka odbijena."}`,
    });
  }

  return result.shipmentId;
}

// ── getLabelWithProperties ───────────────────────────────────────────

interface GetLabelResponse {
  state?: boolean;
  shipmentId?: number;
  parcelLabel?: string;
  err?: string | null;
}

/**
 * Fetch the A6 PDF label (base64) for a shipment and return raw PDF bytes.
 * Throws createError with a user-friendly Serbian message on failure.
 */
export async function getLabel(
  event: H3Event,
  shipmentId: number,
): Promise<Uint8Array> {
  const config = getBexConfig(event);
  if (!config) {
    throw createError({
      statusCode: 503,
      statusMessage:
        "Bex API nije konfigurisan (nedostaju BEX_API_TOKEN ili BEX_CLIENT_ID).",
    });
  }

  const url = `${config.getLabelUrl}?pageSize=6&pagePosition=0&shipmentId=${shipmentId}&parcelNo=0`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        "X-Auth-Token": config.token,
      },
    });
  } catch {
    try {
      res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "X-Auth-Token": config.token,
        },
      });
    } catch {
      throw createError({
        statusCode: 502,
        statusMessage: "Bex API nije dostupan.",
      });
    }
  }

  if (!res.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: `Bex API greška: ${res.status}.`,
    });
  }

  const data = (await res.json()) as GetLabelResponse;

  if (data.state !== true || !data.parcelLabel) {
    throw createError({
      statusCode: 502,
      statusMessage: `Bex: ${data.err || "adresnica nije generisana."}`,
    });
  }

  // parcelLabel is a base64-encoded PDF. Decode to raw bytes.
  try {
    const binary = atob(data.parcelLabel);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Bex: neispravan PDF format adresnice.",
    });
  }
}
