// Curated free Unsplash photographs; source pages checked 2026-10-21.
// Stock imagery illustrates a sample and does not represent the customer's premises or team.
const photo=(id:string,title:string,author:string,sourceId:string)=>({src:`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`,title,author,provider:'Unsplash',source:`https://unsplash.com/photos/${sourceId}`,license:'https://unsplash.com/license'})
export const STOCK_PHOTOS={
 team:photo('photo-1573167507387-6b4b98cb7c13','Women leading a business meeting','Christina @ wocintechchat.com','Q80LYxv_Tbs'),
 salon:photo('photo-1521590832167-7bcbfaa6381f','Salon interior','Guilherme Petri','PtOfbGkU3uI'),
 freight:photo('photo-1616432043562-3671ea2e5242','Freight truck on the road','Caleb Ruiter','EmEQ6kK_5P0'),
 equipment:photo('photo-1652303518314-e1196ef221f6','Excavator at a construction site','John Kakuk','GK3GYxaFc-8'),
 technology:photo('photo-1657035928246-143d8777f3cc','Computer workspace','Jason Dela Cueva','GIVV6rj9WTQ'),
 food:photo('photo-1557844352-761f2565b576','Fresh produce market','Iñigo De la Maza','s285sDw5Ikc'),
 books:photo('photo-1568667256531-7d5ac92eaa7a','Library books','Emil Widlund','ZtI4l8EvyUw'),
 care:photo('photo-1655913197692-012897652d13','Stethoscope on a blue background','Etactics Inc','JkWMM8x1sLo'),
 music:photo('photo-1707690614050-c0ff0b536ad3','Recording studio','Luke Greenwood','uZW1GyRLm44'),
 property:photo('photo-1649704584931-50d1480cf10a','House exterior','Megan Nixon','kYmJbjfv1no'),
}
export type StockPhotoKey=keyof typeof STOCK_PHOTOS
export const SECTOR_PHOTOS:Record<string,StockPhotoKey>={
 'Beauty & Personal Care':'salon','Travel & Logistics':'freight','Heavy Equipment & Earthmoving':'equipment','Technology & Workforce':'team','Professional & Finance':'team','Security & Legal':'technology','Food & Retail':'food','Faith & Community':'books','Care & Mobility':'care','Creator & Entertainment':'music','Property & Trades':'property',
}
