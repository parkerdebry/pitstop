export const TRIM_DATA: Record<string, Record<string, string[]>> = {
  toyota: {
    camry:['LE','SE','XSE','XLE','TRD','XLE V6','XSE V6'],
    corolla:['L','LE','SE','XSE','XLE','Apex'],
    rav4:['LE','XLE','XLE Premium','TRD Off-Road','Adventure','Limited','Prime SE','Prime XSE'],
    tacoma:['SR','SR5','TRD Sport','TRD Off-Road','Limited','TRD Pro'],
    tundra:['SR','SR5','Limited','Platinum','1794 Edition','TRD Pro'],
    highlander:['L','LE','XLE','Limited','Platinum','XSE'],
    '4runner':['SR5','TRD Sport','TRD Off-Road','Limited','Venture','TRD Pro'],
  },
  ford: {
    f150:['XL','XLT','Lariat','King Ranch','Platinum','Limited','Raptor','Tremor'],
    mustang:['EcoBoost','EcoBoost Premium','GT','GT Premium','Mach 1','Shelby GT500'],
    explorer:['Base','XLT','Limited','Platinum','ST','Timberline'],
    bronco:['Base','Big Bend','Black Diamond','Outer Banks','Badlands','Wildtrak','Raptor'],
    escape:['S','SE','SE Sport','SEL','Titanium'],
    maverick:['XL','XLT','Lariat'],
  },
  chevrolet: {
    silverado:['WT','Custom','LT','RST','LTZ','High Country','ZR2','Trail Boss'],
    equinox:['LS','LT','RS','Premier'],
    tahoe:['LS','LT','RST','Premier','High Country','Z71'],
    malibu:['LS','RS','LT','Premier'],
    corvette:['1LT','2LT','3LT','Z06','Grand Sport','ZR1'],
    colorado:['WT','LT','Z71','Trail Boss','ZR2'],
  },
  honda: {
    civic:['LX','Sport','EX','EX-L','Touring','Si','Type R'],
    accord:['LX','Sport','EX','EX-L','Touring','Sport 2.0T'],
    crv:['LX','EX','EX-L','Touring','Sport','Sport Touring'],
    pilot:['LX','EX','EX-L','Touring','Elite','TrailSport'],
    ridgeline:['Sport','RTL','RTL-E','Black Edition'],
  },
  jeep: {
    wrangler:['Sport','Sport S','Sahara','Rubicon','Willys','High Altitude','392'],
    'grand cherokee':['Laredo','Altitude','Limited','Trailhawk','Overland','Summit','Trackhawk'],
    gladiator:['Sport','Sport S','Willys','Overland','Rubicon','Mojave'],
    compass:['Sport','Latitude','Altitude','Limited','Trailhawk'],
  },
  ram: {
    '1500':['Tradesman','Big Horn','Lone Star','Laramie','Rebel','Longhorn','Limited','TRX'],
    '2500':['Tradesman','Big Horn','Laramie','Power Wagon','Longhorn','Limited'],
  },
  subaru: {
    outback:['Base','Premium','Limited','Onyx Edition','Touring','Wilderness'],
    forester:['Base','Premium','Sport','Limited','Touring'],
    wrx:['Base','Premium','Limited','GT','STI'],
    crosstrek:['Base','Premium','Sport','Limited','Wilderness'],
  },
  'harley-davidson': {
    sportster:['883','883 Iron','883 SuperLow','1200 Custom','1200 Forty-Eight','1200 Roadster'],
    softail:['Standard','Street Bob','Fat Boy','Heritage Classic','Deluxe','Fat Bob','Low Rider'],
    touring:['Street Glide','Road Glide','Road King','Ultra Limited'],
  },
  ktm: {
    '250 sx-f':['Standard'],
    '350 sx-f':['Standard'],
    '450 sx-f':['Standard'],
    '250 exc-f':['Standard','Six Days'],
    '300 xc-w':['Standard'],
  },
  honda: {
    'crf450r':['Standard','Works Edition'],
    'crf250r':['Standard'],
    'crf450rx':['Standard'],
    'crf300l':['Standard','Rally'],
  },
  yamaha: {
    'yz450f':['Standard'],
    'yz250f':['Standard'],
    'wr450f':['Standard'],
    'wr250f':['Standard'],
    'tenere 700':['Standard','Rally'],
  },
  nissan: {
    altima:['S','SV','SR','SL','Platinum'],
    rogue:['S','SV','SL','Platinum'],
    frontier:['S','SV','Pro-4X','PRO-X'],
    titan:['S','SV','Pro-4X','PRO-X','Platinum Reserve'],
  },
  gmc: {
    sierra:['Regular Cab','SLE','SLT','AT4','Denali','AT4X'],
    yukon:['SLE','SLT','AT4','Denali'],
    terrain:['SLE','SLT','AT4','Denali'],
    canyon:['Elevation','AT4','Denali'],
  },
  dodge: {
    charger:['SXT','GT','R/T','Scat Pack','Hellcat','Redeye'],
    challenger:['SXT','GT','R/T','Scat Pack','Hellcat','Redeye'],
    durango:['SXT','GT','Citadel','R/T','SRT 392','SRT Hellcat'],
  },
  bmw: {
    '3 series':['330i','330e','M340i','M3'],
    '5 series':['530i','530e','540i','M550i','M5'],
    x3:['sDrive30i','xDrive30i','M40i','M'],
    x5:['sDrive40i','xDrive40i','xDrive45e','M50i','M'],
  },
};

export const GENERIC_TRIMS = [
  'Base','S','SE','SL','Sport','EX','LX','LE','XLE',
  'Limited','Premium','Platinum','Luxury','Elite','Pro','Plus','Touring',
];

export function getTrimsForVehicle(make: string, model: string): string[] {
  const m  = make.toLowerCase();
  const mo = model.toLowerCase();
  const makeData = TRIM_DATA[m];
  if (!makeData) return GENERIC_TRIMS;
  return makeData[mo] ?? GENERIC_TRIMS;
}
