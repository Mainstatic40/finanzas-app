export type BankStyle = {
  id: string;
  name: string;
  logo: string;
  gradient: string;
  textColor: "white" | "black";
  chipColor: "gold" | "silver";
  logoFilter?: string;
};

export const BANK_STYLES: Record<string, BankStyle> = {
  bbva: {
    id: "bbva",
    name: "BBVA",
    logo: "/bank-logos/bbva.png",
    gradient: "linear-gradient(135deg, #0097a9 0%, #00787a 100%)",
    textColor: "white",
    chipColor: "gold",
  },
  santander: {
    id: "santander",
    name: "Santander",
    logo: "/bank-logos/santander.png",
    gradient: "linear-gradient(135deg, #ec0000 0%, #b50000 100%)",
    textColor: "white",
    chipColor: "gold",
  },
  banorte: {
    id: "banorte",
    name: "Banorte",
    logo: "/bank-logos/banorte.png",
    gradient: "linear-gradient(135deg, #e30613 0%, #b8000f 100%)",
    textColor: "white",
    chipColor: "gold",
  },
  banamex: {
    id: "banamex",
    name: "Citibanamex",
    logo: "/bank-logos/banamex.png",
    gradient: "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)",
    textColor: "white",
    chipColor: "gold",
  },
  hsbc: {
    id: "hsbc",
    name: "HSBC",
    logo: "/bank-logos/hsbc.png",
    gradient: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
    textColor: "black",
    chipColor: "silver",
  },
  scotiabank: {
    id: "scotiabank",
    name: "Scotiabank",
    logo: "/bank-logos/scotiabank.png",
    gradient: "linear-gradient(135deg, #c41230 0%, #8b0000 100%)",
    textColor: "white",
    chipColor: "gold",
  },
  banregio: {
    id: "banregio",
    name: "Banregio",
    logo: "/bank-logos/banregio.png",
    gradient: "linear-gradient(135deg, #ff6b00 0%, #e55d00 100%)",
    textColor: "white",
    chipColor: "gold",
  },
  "banco-azteca": {
    id: "banco-azteca",
    name: "Banco Azteca",
    logo: "/bank-logos/banco-azteca.png",
    gradient: "linear-gradient(135deg, #006341 0%, #004d32 100%)",
    textColor: "white",
    chipColor: "gold",
  },
  bancoppel: {
    id: "bancoppel",
    name: "BanCoppel",
    logo: "/bank-logos/bancoppel.png",
    gradient: "linear-gradient(135deg, #ffd100 0%, #e6bc00 100%)",
    textColor: "black",
    chipColor: "gold",
  },
  nu: {
    id: "nu",
    name: "Nu",
    logo: "/bank-logos/nu.png",
    gradient: "linear-gradient(135deg, #820ad1 0%, #5c078f 100%)",
    textColor: "white",
    chipColor: "silver",
  },
  mercadopago: {
    id: "mercadopago",
    name: "Mercado Pago",
    logo: "/bank-logos/mercadopago.png",
    gradient: "linear-gradient(135deg, #345471 0%, #263d52 100%)",
    textColor: "white",
    chipColor: "gold",
    logoFilter: "none",
  },
  spin: {
    id: "spin",
    name: "Spin",
    logo: "/bank-logos/spin.png",
    gradient: "linear-gradient(135deg, #5c4d9a 0%, #3d3270 100%)",
    textColor: "white",
    chipColor: "silver",
  },
  otro: {
    id: "otro",
    name: "Otro",
    logo: "",
    gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
    textColor: "white",
    chipColor: "silver",
  },
};

export function getBankById(id: string): BankStyle {
  // Normalize ID to lowercase and handle common variations
  const normalizedId = id.toLowerCase().trim();
  return BANK_STYLES[normalizedId] ?? BANK_STYLES["otro"];
}

export function getAllBanks(): BankStyle[] {
  return Object.values(BANK_STYLES);
}
