export type PassportAccessPrefs={languageTag:string;signLanguageTag?:string;oneHand?:'left'|'right';captions?:boolean;voice?:boolean;switchControl?:boolean;screenReader?:boolean;largeTargets?:boolean;reducedMotion?:boolean;highContrast?:boolean;plainLanguage?:boolean}
const prefs=new Map<string,PassportAccessPrefs>()
export function savePassportAccess(passportId:string,p:PassportAccessPrefs){prefs.set(passportId,{...p});return prefs.get(passportId)!}
export function loadPassportAccess(passportId:string){return prefs.get(passportId)}
export function clearPassportAccess(passportId:string){return prefs.delete(passportId)}
