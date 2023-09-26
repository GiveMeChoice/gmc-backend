export interface LabelDocument {
  merchantLabel: MerchantLabelDocument;
  gmcLabel?: GmcLabelDocument;
}

export interface MerchantLabelDocument {
  code: string;
  name: string;
  description?: string;
  logo?: string;
  url?: string;
}

export interface GmcLabelDocument {
  name: string;
  description?: string;
  sublabel?: GmcLabelDocument;
}
