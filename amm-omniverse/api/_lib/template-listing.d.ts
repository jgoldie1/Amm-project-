export type TemplateDemo={brand:string;tagline:string;type:'shop'|'booking'|'inquiry';tone:string;items:[string,number][]}
export type TemplateListing={id:string;name:string;audience:string;headline:string;description:string;bestFor:string;benefit:string;includes:string;priceCents:number;demo:TemplateDemo;revision?:number}
export const CUSTOM_TEMPLATE_ID:RegExp
export function validateTemplateListing(input:unknown):{ok:true;data:TemplateListing}|{ok:false;error:string}
export function hasTemplateAuthority(user:unknown,configuredIds?:string):boolean
export function publicTemplate(row:unknown):TemplateListing|null
