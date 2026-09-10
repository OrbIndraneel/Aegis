import { en } from './en';

export const hi: typeof en = {
  // Common & Branding
  appName: 'AEGIS',
  appSubhead: 'पूर्वोत्तर क्षेत्र में एआई-आधारित भूस्खलन पूर्व चेतावनी प्रणाली',
  preferredLanguage: 'पसंदीदा भाषा',
  loading: 'भूस्खलन जोखिम टेलीमेट्री लोड हो रही है...',
  error: 'एक अप्रत्याशित त्रुटि हुई।',
  offlineStatus: 'स्थानीय कैश सक्रिय | एसएमएस बैकअप सक्षम',
  offline: 'ऑफ़लाइन',
  live: 'लाइव टेलीमेट्री',

  // Navigation Tabs
  tabMap: 'जोखिम नक्शा',
  tabAlerts: 'चेतावनियां',
  tabRoute: 'सुरक्षित मार्ग',
  tabReport: 'रिपोर्ट',
  tabSos: 'एसओएस',
  tabProfile: 'प्रोफ़ाइल',

  // Civilian Home / Map Overlay
  criticalAlertTitle: 'गंभीर चेतावनी: NH-10 ढलान विफलता संभावित',
  criticalAlertSubtitle: '20वें मील के पास सक्रिय मलबा प्रवाह देखा गया।',
  reroutingText: 'सुरक्षित पहाड़ी निकासी मार्ग की गणना की जा रही है...',
  turnLeft: 'ऊपरी कटक सुरक्षित बाईपास पर बाएं मुड़ें',
  proceedSafeHaven: 'सिंगताम राहत शिविर की ओर बढ़ें',
  emergencySosButton: 'SOS  आपातकालीन बचाव बीकन',

  // Warning Levels
  warningLevelNotice: 'सूचना (NOTICE)',
  warningLevelWatch: 'निगरानी (WATCH)',
  warningLevelWarning: 'चेतावनी (WARNING)',

  // Alerts Screen
  alertsTitle: 'पूर्व चेतावनियां एवं निर्देश',
  activeDisasterOrders: 'लाइव भूस्खलन बुलेटिन',
  filterAll: 'सभी',
  filterCritical: 'चेतावनियां',
  filterHigh: 'निगरानी',
  filterModerate: 'सूचना',
  actionRequired: 'आवश्यक कार्रवाई',

  // Evacuation & Route Screen
  safeEvacuationRoute: 'सुरक्षित निकासी मार्ग',
  highRiskBannerTitle: 'सक्रिय भूस्खलन जोखिम क्षेत्र',
  highRiskBannerSub: 'NH-10 सक्रिय मलबे और चट्टान गिरने वाले क्षेत्र को दरकिनार करते हुए सुरक्षित मार्ग का पालन करें',
  targetShelter: 'राहत शिविर',
  estimatedTime: 'अनुमानित समय',
  distance: 'दूरी',
  safetyScore: 'सुरक्षा स्कोर',
  roadClosed: 'मार्ग अवरुद्ध',
  startActiveEvacuation: 'सक्रिय निकासी प्रारंभ करें',
  endNavigation: 'नेविगेशन समाप्त करें',
  liveEvacuationNavigationActive: 'लाइव निकासी नेविगेशन सक्रिय',
  currentNavigationStep: 'वर्तमान नेविगेशन चरण',

  // Field Reporting
  fieldReportTitle: 'स्थलीय अवलोकन एवं भूस्खलन रिपोर्ट',
  fieldReportSubtitle: 'जमीनी दरारें, मलबा या अवरोध सीधे आपदा नियंत्रण कक्ष को भेजें',
  reportType: 'घटना का प्रकार',
  reportLandslide: 'भूस्खलन / ढलान विफलता',
  reportMudslide: 'कीचड़ बहाव / मलबा',
  reportGroundCracks: 'जमीनी दरारें',
  reportRoadBlock: 'अवरुद्ध सड़क / चट्टान गिरना',
  submitReport: 'अवलोकन रिपोर्ट दर्ज करें',
  submittingReport: 'रिपोर्ट भेजी जा रही है...',
  reportQueuedOffline: 'रिपोर्ट ऑफ़लाइन सहेजी गई; कनेक्टिविटी आने पर स्वतः सिंक होगी।',
  reportSubmittedSuccess: 'अवलोकन सत्यापित और आपदा नियंत्रण कक्ष को प्रेषित।',

  // SOS Modal Screen
  emergencySosDispatch: 'आपातकालीन एसओएस प्रेषण',
  distressBeaconTitle: '1-टैप पहाड़ी संकट बीकन',
  distressBeaconSub: 'जीपीएस स्थान, विवरण और एसडीआरएफ/एनडीआरएफ इकाइयों को तुरंत भेजें।',
  transmittingGps: 'जीपीएस स्थान प्रसारित किया जा रहा है',
  emergencyReason: 'आपातकाल का कारण',
  confirmDispatchSos: 'पुष्टि करें और एसओएस भेजें',
  transmittingBeacon: 'बीकन प्रसारित हो रहा है...',
  activeRescueBeaconDispatched: 'सक्रिय बचाव बीकन भेजा गया',
  trackingId: 'ट्रैकिंग आईडी',
  assignedUnit: 'नियुक्त इकाई',
  cancelActiveSos: 'सक्रिय एसओएस बीकन रद्द करें',
  emergencyHotlines: 'आपातकालीन हेल्पलाइन',

  // Profile Screen
  emergencyProfile: 'आपातकालीन प्रोफ़ाइल',
  offlineEmergencyMode: 'ऑफ़लाइन आपातकालीन मोड',
  offlineModeDesc: 'शून्य-नेटवर्क क्षेत्रों के लिए आपदा डेटा कैश करें',
  civilianMedicalInfo: 'चिकित्सा एवं रक्त समूह जानकारी',
  bloodGroup: 'रक्त समूह',
  medicalConditions: 'चिकित्सा स्थिति',
  emergencyHotlinesContacts: 'आपातकालीन संपर्क',
  primarySos: 'प्राथमिक एसओएस',

  // Shelters Screen
  nearbyShelters: 'आपातकालीन राहत शिविर',
  capacity: 'क्षमता',
  occupancy: 'उपस्थिति',
  availableBeds: 'उपलब्ध बिस्तर',
  navigate: 'मार्ग देखें',
};
