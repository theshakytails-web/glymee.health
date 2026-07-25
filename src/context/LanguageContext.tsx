"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Language = "en" | "hi" | "mr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.whyGlymee": "Why Glymee?",
    "nav.services": "Services",
    "nav.process": "Our Process",
    "nav.faq": "FAQ",
    "nav.bookConsultation": "Book Consultation",

    // Hero
    "hero.badge": "Manage Today. Healthy Tomorrow.",
    "hero.title1": "Stop Guessing.",
    "hero.title2": "Start Understanding",
    "hero.title3": "Your Diabetes.",
    "hero.description": "We don't just treat blood sugar—we help you understand the \"why\" behind your numbers for a sustainable, healthy future.",
    "hero.cta1": "Book Consultation",
    "hero.cta2": "Know How Glymee Works",

    // Why Root Cause
    "why.title": "Why Root Cause Matters",
    "why.description": "Treating symptoms only gets you so far. By identifying the root causes of glucose fluctuations—from stress to sleep to gut health—we create lasting change.",
    "why.feature1Title": "Precision Analysis",
    "why.feature1Desc": "We dive deep into your metabolic profile to find what specifically triggers your spikes.",
    "why.feature2Title": "Behavioral Science",
    "why.feature2Desc": "Understand the psychological factors influencing your daily health choices and habits.",
    "why.feature3Title": "Sustainable Shift",
    "why.feature3Desc": "Replace guesswork with data-backed lifestyle adjustments that stick for life.",

    // Comparison
    "compare.title": "Traditional Care vs. Glymee",
    "compare.traditional": "Traditional Management",
    "compare.traditional1": "Short, hurried doctor appointments",
    "compare.traditional2": "Focus on \"lowering numbers\" only",
    "compare.traditional3": "One-size-fits-all dietary advice",
    "compare.traditional4": "Disconnected tracking devices",
    "compare.glymee": "The Glymee Way",
    "compare.glymee1": "24/7 access to your dedicated care team",
    "compare.glymee2": "Holistic root-cause identification",
    "compare.glymee3": "Personalized nutrition based on CGM data",
    "compare.glymee4": "Unified ecosystem for all health metrics",

    // Conditions
    "conditions.title": "Conditions We Help Manage",
    "conditions.type2": "Type 2 Diabetes",
    "conditions.prediabetes": "Prediabetes",
    "conditions.gestational": "Gestational",
    "conditions.type1": "Type 1 Support",

    // Process
    "process.title": "Our 5-Step Transformation",
    "process.description": "A proven path from confusion to complete control.",
    "process.step1": "Discovery",
    "process.step1Desc": "Metabolic health assessment & history review.",
    "process.step2": "Onboarding",
    "process.step2Desc": "Device setup & team introduction.",
    "process.step3": "Monitoring",
    "process.step3Desc": "14-day intensive data collection phase.",
    "process.step4": "Analysis",
    "process.step4Desc": "Identifying root causes & patterns.",
    "process.step5": "Thrive",
    "process.step5Desc": "Personalized roadmap for long-term health.",

    // Services
    "services.title": "Our Services",
    "services.cgm": "CGM Integration",
    "services.cgmDesc": "Continuous monitoring that speaks to our platform in real-time for instant feedback.",
    "services.nutrition": "Nutrition Coaching",
    "services.nutritionDesc": "Personalized meal plans designed around your body's specific glycemic response.",
    "services.clinical": "Clinical Support",
    "services.clinicalDesc": "Expert guidance from licensed endocrinologists whenever you need an adjustment.",
    "services.learnMore": "Learn More",

    // About
    "about.title": "Our Story",
    "about.p1": "Glymee was born from a simple observation: modern healthcare manages diabetes, but it doesn't always empower the patient. Our team of doctors, dietitians, and engineers came together to build a bridge between data and daily living.",
    "about.p2": "Based in Pune, India, we serve patients with one mission: to make metabolic health intuitive, accessible, and life-changing.",
    "about.quote": "\"Founded on clinical excellence and a deep passion for human-centric metabolic health.\"",
    "about.location": "Pune, Maharashtra, India",
    "about.email": "hello@glymee.com",

    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.q1": "How does Glymee differ from my regular doctor?",
    "faq.a1": "While your doctor provides clinical diagnosis and prescriptions, Glymee provides the daily support, real-time data analysis, and behavioral coaching required to manage your condition between visits.",
    "faq.q2": "Do I need my own CGM to start?",
    "faq.a2": "If you don't have one, we can help facilitate getting a Continuous Glucose Monitor through our network of providers, or work with the device you already use.",
    "faq.q3": "Is Glymee covered by insurance?",
    "faq.a3": "Many components of Glymee are HSA/FSA eligible. We also partner with select employers and insurance providers. Contact us for a benefit check.",
    "faq.q4": "What results can I expect?",
    "faq.a4": "Most users see a reduction in A1c, improved time-in-range, and increased confidence in their food choices within the first 3 months.",

    // CTA
    "cta.title": "Start Your Journey Today",
    "cta.description": "Ready to uncover the \"why\" behind your blood sugar? Book your initial discovery session with our team.",
    "cta.book": "Book Consultation",
    "cta.pricing": "View Pricing",
    "cta.note": "No long-term contracts. Scientific approach. Real human support.",

    // Footer
    "footer.description": "Empowering smarter metabolic health management through data and human connection.",
    "footer.product": "Product",
    "footer.features": "Features",
    "footer.integrations": "Integrations",
    "footer.pricing": "Pricing",
    "footer.company": "Company",
    "footer.aboutUs": "About Us",
    "footer.careers": "Careers",
    "footer.contact": "Contact",
    "footer.contactUs": "Contact",
    "footer.copyright": "© 2024 Glymee Health. All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.accessibility": "Accessibility",

    // Form
    "form.title": "Book a Consultation",
    "form.subtitle": "Tell us about yourself and we'll get back to you within 24 hours.",
    "form.personalInfo": "Personal Information",
    "form.fullName": "Full Name *",
    "form.age": "Age *",
    "form.gender": "Gender *",
    "form.selectGender": "Select gender",
    "form.male": "Male",
    "form.female": "Female",
    "form.other": "Other",
    "form.preferNotToSay": "Prefer not to say",
    "form.contactInfo": "Contact Information",
    "form.email": "Email Address *",
    "form.phone": "Phone Number *",
    "form.city": "City *",
    "form.state": "State / Province *",
    "form.healthInfo": "Health Information",
    "form.diabetesType": "Diabetes Type *",
    "form.selectType": "Select type",
    "form.diagnosisDuration": "Time Since Diagnosis",
    "form.medications": "Current Medications / Treatments",
    "form.mainConcern": "Main Health Concern *",
    "form.mainConcernPlaceholder": "Tell us about your main health concern or what you'd like help with...",
    "form.referral": "How Did You Find Us?",
    "form.referralSource": "Referral Source *",
    "form.selectOption": "Select an option",
    "form.additionalNotes": "Anything Else You'd Like Us to Know?",
    "form.additionalPlaceholder": "Optional: any additional information...",
    "form.cancel": "Cancel",
    "form.submit": "Submit Request",
    "form.submitting": "Submitting...",
    "form.success": "Thank you! We'll contact you within 24 hours.",
    "form.error": "Something went wrong. Please try again or contact us directly.",

    // Language
    "lang.en": "English",
    "lang.hi": "हिन्दी",
    "lang.mr": "मराठी",
  },
  hi: {
    // Nav
    "nav.whyGlymee": "ग्लाइमी क्यों?",
    "nav.services": "सेवाएँ",
    "nav.process": "हमारी प्रक्रिया",
    "nav.faq": "अक्सर पूछे जाने वाले प्रश्न",
    "nav.bookConsultation": "परामर्श बुक करें",

    // Hero
    "hero.badge": "आज प्रबंधन करें। स्वस्थ कल।",
    "hero.title1": "अनुमान लगाना बंद करें।",
    "hero.title2": "समझना शुरू करें",
    "hero.title3": "अपनी मधुमेह को।",
    "hero.description": "हम केवल रक्त शर्करा का इलाज नहीं करते—हम आपकी स्थायी, स्वस्थ भविष्य के लिए आपकी संख्याओं के पीछे के \"क्यों\" को समझने में आपकी मदद करते हैं।",
    "hero.cta1": "परामर्श बुक करें",
    "hero.cta2": "जानें ग्लाइमी कैसे काम करता है",

    // Why Root Cause
    "why.title": "मूल कारण क्यों महत्वपूर्ण है",
    "why.description": "लक्षणों का इलाज केवल इतना ही कर सकता है। ग्लूकोज में उतार-चढ़ाव के मूल कारणों की पहचान करके—तनाव से नींद तक, आंत्र स्वास्थ्य तक—हम स्थायी बदलाव बनाते हैं।",
    "why.feature1Title": "सटीक विश्लेषण",
    "why.feature1Desc": "हम आपकी चयापचय प्रोफ़ाइल में गहराई से उतरकर यह पता लगाते हैं कि विशेष रूप से क्या आपके स्पाइक्स को ट्रिगर करता है।",
    "why.feature2Title": "व्यवहार विज्ञान",
    "why.feature2Desc": "आपके दैनिक स्वास्थ्य विकल्पों और आदतों को प्रभावित करने वाले मनोवैज्ञानिक कारकों को समझें।",
    "why.feature3Title": "स्थायी बदलाव",
    "why.feature3Desc": "अनुमान को डेटा-समर्थित जीवनशैली समायोजनों से बदलें जो जीवन भर टिके रहें।",

    // Comparison
    "compare.title": "पारंपरिक देखभाल बनाम ग्लाइमी",
    "compare.traditional": "पारंपरिक प्रबंधन",
    "compare.traditional1": "छोटी, जल्दी डॉक्टर नियुक्तियाँ",
    "compare.traditional2": "केवल \"संख्या कम करने\" पर ध्यान केंद्रित",
    "compare.traditional3": "एक आकार सबके लिए आहार सलाह",
    "compare.traditional4": "असंबद्ध ट्रैकिंग उपकरण",
    "compare.glymee": "ग्लाइमी का तरीका",
    "compare.glymee1": "अपनी समर्पित देखभाल टीम तक 24/7 पहुँच",
    "compare.glymee2": "समग्र मूल-कारण पहचान",
    "compare.glymee3": "CGM डेटा पर आधारित व्यक्तिगत पोषण",
    "compare.glymee4": "सभी स्वास्थ्य मापदंडों के लिए एकीकृत पारिस्थितिकी तंत्र",

    // Conditions
    "conditions.title": "हम जिन स्थितियों में सहायता करते हैं",
    "conditions.type2": "टाइप 2 मधुमेह",
    "conditions.prediabetes": "प्रीडायबिटीज",
    "conditions.gestational": "गर्भकालीन",
    "conditions.type1": "टाइप 1 सहायता",

    // Process
    "process.title": "हमारा 5-चरणीय रूपांतरण",
    "process.description": "भ्रम से पूर्ण नियंत्रण तक एक सिद्ध मार्ग।",
    "process.step1": "खोज",
    "process.step1Desc": "चयापचय स्वास्थ्य मूल्यांकन और इतिहास समीक्षा।",
    "process.step2": "ऑनबोर्डिंग",
    "process.step2Desc": "डिवाइस सेटअप और टीम परिचय।",
    "process.step3": "निगरानी",
    "process.step3Desc": "14-दिवसीय गहन डेटा संग्रह चरण।",
    "process.step4": "विश्लेषण",
    "process.step4Desc": "मूल कारणों और पैटर्न की पहचान।",
    "process.step5": "विकसित होना",
    "process.step5Desc": "दीर्घकालिक स्वास्थ्य के लिए व्यक्तिगत रोडमैप।",

    // Services
    "services.title": "हमारी सेवाएँ",
    "services.cgm": "CGM एकीकरण",
    "services.cgmDesc": "तत्काल प्रतिक्रिया के लिए हमारे प्लेटफ़ॉर्म से वास्तविक समय में बात करने वाली निरंतर निगरानी।",
    "services.nutrition": "पोषण कोचिंग",
    "services.nutritionDesc": "आपके शरीर की विशिष्ट ग्लाइसेमिक प्रतिक्रिया के चारों ओर डिज़ाइन की गई व्यक्तिगत भोजन योजनाएँ।",
    "services.clinical": "क्लिनिकल सहायता",
    "services.clinicalDesc": "जब भी आपको समायोजन की आवश्यकता हो, लाइसेंस प्राप्त एंडोक्रिनोलॉजिस्ट से विशेषज्ञ मार्गदर्शन।",
    "services.learnMore": "और जानें",

    // About
    "about.title": "हमारी कहानी",
    "about.p1": "ग्लाइमी एक सरल अवलोकन से पैदा हुआ: आधुनिक स्वास्थ्य सेवा मधुमेह का प्रबंधन करती है, लेकिन हमेशा रोगी को सशक्त नहीं बनाती। हमारे डॉक्टरों, आहार विशेषज्ञों और इंजीनियरों की टीम डेटा और दैनिक जीवन के बीच एक सेतु बनाने के लिए एक साथ आई।",
    "about.p2": "भारत के पुणे में स्थित, हम रोगियों की सेवा करते हैं एक मिशन के साथ: चयापचय स्वास्थ्य को सहज, सुलभ और जीवन बदलने वाला बनाना।",
    "about.quote": "\"नैदानिक उत्कृष्टता और मानव-केंद्रित चयापचय स्वास्थ्य के गहरे जुनून पर स्थापित।\"",
    "about.location": "पुणे, महाराष्ट्र, भारत",
    "about.email": "hello@glymee.com",

    // FAQ
    "faq.title": "अक्सर पूछे जाने वाले प्रश्न",
    "faq.q1": "ग्लाइमी मेरे नियमित डॉक्टर से कैसे अलग है?",
    "faq.a1": "जबकि आपका डॉक्टर नैदानिक निदान और नुस्खे प्रदान करता है, ग्लाइमी दौरों के बीच आपकी स्थिति का प्रबंधन करने के लिए आवश्यक दैनिक समर्थन, वास्तविक समय डेटा विश्लेषण और व्यवहार कोचिंग प्रदान करता है।",
    "faq.q2": "क्या मुझे शुरुआत के लिए अपना CGM चाहिए?",
    "faq.a2": "यदि आपके पास नहीं है, तो हम आपके प्रदाताओं के नेटवर्क के माध्यम से निरंतर ग्लूकोज मॉनिटर प्राप्त करने में सहायता कर सकते हैं, या आपके द्वारा पहले से उपयोग किए जा रहे डिवाइस के साथ काम कर सकते हैं।",
    "faq.q3": "क्या ग्लाइमी बीमा द्वारा कवर किया गया है?",
    "faq.a3": "ग्लाइमी के कई घटक HSA/FSA के लिए पात्र हैं। हम चयनित नियोक्ताओं और बीमा प्रदाताओं के साथ भी साझेदारी करते हैं। लाभ जांच के लिए हमसे संपर्क करें।",
    "faq.q4": "मुझे क्या परिणाम की उम्मीद करनी चाहिए?",
    "faq.a4": "अधिकांश उपयोगकर्ता A1c में कमी, समय-सीमा में सुधार और पहले 3 महीनों में अपने भोजन विकल्पों में वृद्धि का आत्मविश्वास देखते हैं।",

    // CTA
    "cta.title": "आज ही अपनी यात्रा शुरू करें",
    "cta.description": "अपने रक्त शर्करा के पीछे के \"क्यों\" को उजागर करने के लिए तैयार? अपना प्रारंभिक खोज सत्र हमारी टीम के साथ बुक करें।",
    "cta.book": "परामर्श बुक करें",
    "cta.pricing": "मूल्य देखें",
    "cta.note": "कोई दीर्घकालिक अनुबंध नहीं। वैज्ञानिक दृष्टिकोण। वास्तविक मानव सहायता।",

    // Footer
    "footer.description": "डेटा और मानव कनेक्शन के माध्यम से स्मार्ट चयापचय स्वास्थ्य प्रबंधन को सशक्त बनाना।",
    "footer.product": "उत्पाद",
    "footer.features": "सुविधाएँ",
    "footer.integrations": "एकीकरण",
    "footer.pricing": "मूल्य निर्धारण",
    "footer.company": "कंपनी",
    "footer.aboutUs": "हमारे बारे में",
    "footer.careers": "करियर",
    "footer.contact": "संपर्क",
    "footer.contactUs": "संपर्क",
    "footer.copyright": "© 2024 ग्लाइमी हेल्थ। सर्वाधिकार सुरक्षित।",
    "footer.privacy": "गोपनीयता नीति",
    "footer.terms": "सेवा की शर्तें",
    "footer.accessibility": "पहुँच",

    // Form
    "form.title": "परामर्श बुक करें",
    "form.subtitle": "हमें अपने बारे में बताएं और हम 24 घंटे के भीतर आपसे संपर्क करेंगे।",
    "form.personalInfo": "व्यक्तिगत जानकारी",
    "form.fullName": "पूरा नाम *",
    "form.age": "आयु *",
    "form.gender": "लिंग *",
    "form.selectGender": "लिंग चुनें",
    "form.male": "पुरुष",
    "form.female": "महिला",
    "form.other": "अन्य",
    "form.preferNotToSay": "बताना नहीं चाहते",
    "form.contactInfo": "संपर्क जानकारी",
    "form.email": "ईमेल पता *",
    "form.phone": "फ़ोन नंबर *",
    "form.city": "शहर *",
    "form.state": "राज्य / प्रांत *",
    "form.healthInfo": "स्वास्थ्य जानकारी",
    "form.diabetesType": "मधुमेह का प्रकार *",
    "form.selectType": "प्रकार चुनें",
    "form.diagnosisDuration": "निदान के बाद से समय",
    "form.medications": "वर्तमान दवाएँ / उपचार",
    "form.mainConcern": "मुख्य स्वास्थ्य चिंता *",
    "form.mainConcernPlaceholder": "हमें अपनी मुख्य स्वास्थ्य चिंता या आप किस चीज़ में सहायता चाहते हैं, उसके बारे में बताएं...",
    "form.referral": "आपने हमें कैसे खोजा?",
    "form.referralSource": "रेफरल स्रोत *",
    "form.selectOption": "एक विकल्प चुनें",
    "form.additionalNotes": "कुछ और जो आप हमें बताना चाहें?",
    "form.additionalPlaceholder": "वैकल्पिक: कोई अतिरिक्त जानकारी...",
    "form.cancel": "रद्द करें",
    "form.submit": "अनुरोध सबमिट करें",
    "form.submitting": "सबमिट हो रहा है...",
    "form.success": "धन्यवाद! हम 24 घंटे के भीतर आपसे संपर्क करेंगे।",
    "form.error": "कुछ गलत हो गया। कृपया पुनः प्रयास करें या सीधे हमसे संपर्क करें।",

    // Language
    "lang.en": "English",
    "lang.hi": "हिन्दी",
    "lang.mr": "मराठी",
  },
  mr: {
    // Nav
    "nav.whyGlymee": "ग्लाइमी का?",
    "nav.services": "सेवा",
    "nav.process": "आमची प्रक्रिया",
    "nav.faq": "वारंवार विचारले जाणारे प्रश्न",
    "nav.bookConsultation": "सल्ला बुक करा",

    // Hero
    "hero.badge": "आज व्यवस्थापन करा. निरोगी उद्या.",
    "hero.title1": "अंदाज लावणे थांबवा.",
    "hero.title2": "समजून घेणे सुरू करा",
    "hero.title3": "तुमचा मधुमेह.",
    "hero.description": "आम्ही फक्त रक्तातील साखरेचा उपचार करत नाही—आम्ही तुमच्या शाश्वत, निरोगी भविष्यासाठी तुमच्या संख्यांमागील \"का\" समजून घेण्यात तुम्हाला मदत करतो.",
    "hero.cta1": "सल्ला बुक करा",
    "hero.cta2": "जाणून घ्या ग्लाइमी कसे काम करते",

    // Why Root Cause
    "why.title": "मूळ कारण का महत्त्वाचे आहे",
    "why.description": "लक्षणांचा उपचार केवळ इतकेच करू शकतो. ग्लुकोजमधील उतार-चढावांची मूळ कारणे ओळखून—तणावापासून झोपेपर्यंत, आत्र स्वास्थ्यापर्यंत—आम्ही शाश्वत बदल निर्माण करतो.",
    "why.feature1Title": "अचूक विश्लेषण",
    "why.feature1Desc": "आम्ही तुमच्या चयापचय प्रोफाइलमध्ये खोलवर उतरून ते शोधतो कोणते विशिष्टपणे तुमच्या स्पाइक्स ट्रिगर करते.",
    "why.feature2Title": "वर्तन विज्ञान",
    "why.feature2Desc": "तुमच्या दैनिक आरोग्य निवडी आणि सवयींवर प्रभाव टाकणाऱ्या मनोवैज्ञानिक घटकांना समजून घ्या.",
    "why.feature3Title": "शाश्वत बदल",
    "why.feature3Desc": "अंदाजाला डेटा-समर्थित जीवनशैली समायोजनांनी बदला जे आयुष्यभर टिकतात.",

    // Comparison
    "compare.title": "पारंपरिक देखभाल बनाम ग्लाइमी",
    "compare.traditional": "पारंपरिक व्यवस्थापन",
    "compare.traditional1": "छोट्या, जलद डॉक्टर भेटी",
    "compare.traditional2": "केवळ \"संख्या कमी करण्यावर\" भर",
    "compare.traditional3": "एक आकार सर्वांना आहार सल्ला",
    "compare.traditional4": "असंबद्ध ट्रॅकिंग उपकरणे",
    "compare.glymee": "ग्लाइमीचा मार्ग",
    "compare.glymee1": "तुमच्या समर्पित देखभाल टीमला 24/7 प्रवेश",
    "compare.glymee2": "समग्र मूळ-कारण ओळख",
    "compare.glymee3": "CGM डेटावर आधारित वैयक्तिक पोषण",
    "compare.glymee4": "सर्व आरोग्य मापदंडांसाठी एकीकृत पारिस्थितिकी तंत्र",

    // Conditions
    "conditions.title": "आम्ही ज्या स्थितीत मदत करतो",
    "conditions.type2": "टाइप 2 मधुमेह",
    "conditions.prediabetes": "प्रीडायबिटीज",
    "conditions.gestational": "गर्भकालीन",
    "conditions.type1": "टाइप 1 सहाय्य",

    // Process
    "process.title": "आमचे 5-टप्प्यांचे रूपांतर",
    "process.description": "गोंधळापासून पूर्ण नियंत्रणापर्यंत एक सिद्ध मार्ग.",
    "process.step1": "शोध",
    "process.step1Desc": "चयापचय आरोग्य मूल्यांकन आणि इतिहास पुनरावलोकन.",
    "process.step2": "ऑनबोर्डिंग",
    "process.step2Desc": "डिव्हाइस सेटअप आणि टीम परिचय.",
    "process.step3": "निरीक्षण",
    "process.step3Desc": "14-दिवसीय तीव्र डेटा संकलन टप्पा.",
    "process.step4": "विश्लेषण",
    "process.step4Desc": "मूळ कारणे आणि नमुने ओळखणे.",
    "process.step5": "वाढणे",
    "process.step5Desc": "दीर्घकालीन आरोग्यासाठी वैयक्तिक रोडमॅप.",

    // Services
    "services.title": "आमच्या सेवा",
    "services.cgm": "CGM एकीकरण",
    "services.cgmDesc": "तत्काळ अभिप्रायासाठी आमच्या प्लॅटफॉर्मशी वास्तविक वेळेत बोलणारे सातत्य निरीक्षण.",
    "services.nutrition": "पोषण प्रशिक्षण",
    "services.nutritionDesc": "तुमच्या शरीरच्या विशिष्ट ग्लायसेमिक प्रतिसादाभोवती डिझाइन केलेल्या वैयक्तिक जेवण योजना.",
    "services.clinical": "क्लिनिकल सहाय्य",
    "services.clinicalDesc": "जेव्हा तुम्हाला समायोजनाची गरज असते तेव्हा लायसन्स प्राप्त एंडोक्रिनोलॉजिस्टकडून तज्ञ मार्गदर्शन.",
    "services.learnMore": "अधिक जाणून घ्या",

    // About
    "about.title": "आमची कथा",
    "about.p1": "ग्लाइमी एका साध्या निरीक्षणातून जन्माला आले: आधुनिक आरोग्यसेवा मधुमेहाचे व्यवस्थापन करते, परंतु नेहमी रुग्णाला सक्षम करत नाही. आमच्या डॉक्टर, आहार तज्ञ आणि अभियंत्यांची टीम डेटा आणि दैनंदिन जीवनातील सेतू निर्माण करण्यासाठी एकत्र आली.",
    "about.p2": "भारतातील पुण्यात स्थित, आम्ही रुग्णांची सेवा करतो एका ध्येयासह: चयापचय आरोग्य सहज, प्रवेशायोग्य आणि जीवन बदलणारे बनवणे.",
    "about.quote": "\"नैदानिक उत्कृष्टता आणि मानव-केंद्रित चयापचय आरोग्यावरील खोल उत्साहावर स्थापित.\"",
    "about.location": "पुणे, महाराष्ट्र, भारत",
    "about.email": "hello@glymee.com",

    // FAQ
    "faq.title": "वारंवार विचारले जाणारे प्रश्न",
    "faq.q1": "ग्लाइमी माझ्या नियमित डॉक्टरपेक्षा कसे वेगळे आहे?",
    "faq.a1": "जरी तुमचा डॉक्टर नैदानिक निदान आणि विरचना प्रदान करतो, ग्लाइमी भेटींमध्ये तुमच्या स्थितीचे व्यवस्थापन करण्यासाठी आवश्यक दैनिक समर्थन, वास्तविक वेळ डेटा विश्लेषण आणि वर्तन प्रशिक्षण प्रदान करते.",
    "faq.q2": "सुरुवातीसाठी माझ्या स्वतःच्या CGM ची गरज आहे का?",
    "faq.a2": "जर तुमच्याकडे नसेल, तर आम्ही तुमच्या प्रदात्यांच्या नेटवर्कद्वारे निरंतर ग्लुकोज मॉनिटर मिळवण्यात मदत करू शकतो, किंवा तुम्ही आधीच वापरत असलेल्या डिव्हाइससह काम करू शकतो.",
    "faq.q3": "ग्लाइमी विमा द्वारे कव्हर केले जाते का?",
    "faq.a3": "ग्लाइमीचे अनेक घटक HSA/FSA साठी पात्र आहेत. आम्ही निवडलेल्या नियोक्ते आणि विमा प्रदात्यांशीही भागीदारी करतो. लाभ तपासणीसाठी आमच्याशी संपर्क साधा.",
    "faq.q4": "मला कोणते परिणाम अपेक्षित आहेत?",
    "faq.a4": "बहुतेक वापरकर्त्यांना A1c मध्ये कमी, वेळ-व्याप्तीत सुधार आणि पहिल्या 3 महिन्यांत त्यांच्या अन्न निवडीतील वाढलेला आत्मविश्वास दिसून येतो.",

    // CTA
    "cta.title": "आज तुमचा प्रवास सुरू करा",
    "cta.description": "तुमच्या रक्तातील साखरेमागील \"का\" उघड करण्यासाठी तयार? तुमचा सुरुवातीचा शोध सत्र आमच्या टीमसह बुक करा.",
    "cta.book": "सल्ला बुक करा",
    "cta.pricing": "किंमत पहा",
    "cta.note": "दीर्घकालीन करार नाही. शास्त्रीय दृष्टिकोन. खऱ्या मानवी सहाय्य.",

    // Footer
    "footer.description": "डेटा आणि मानवी कनेक्शनद्वारे स्मार्ट चयापचय आरोग्य व्यवस्थापनाला सक्षम करणे.",
    "footer.product": "उत्पादन",
    "footer.features": "वैशिष्ट्ये",
    "footer.integrations": "एकीकरण",
    "footer.pricing": "किंमत",
    "footer.company": "कंपनी",
    "footer.aboutUs": "आमच्याबद्दल",
    "footer.careers": "करिअर",
    "footer.contact": "संपर्क",
    "footer.contactUs": "संपर्क",
    "footer.copyright": "© 2024 ग्लाइमी आरोग्य. सर्व हक्क राखीव.",
    "footer.privacy": "गोपनीयता धोरण",
    "footer.terms": "सेवा अटी",
    "footer.accessibility": "प्रवेशयोग्यता",

    // Form
    "form.title": "सल्ला बुक करा",
    "form.subtitle": "तुमच्याबद्दल आम्हाला सांगा आणि आम्ही 24 तासांच्या आत तुमच्याशी संपर्क साधू.",
    "form.personalInfo": "वैयक्तिक माहिती",
    "form.fullName": "पूर्ण नाव *",
    "form.age": "वय *",
    "form.gender": "लिंग *",
    "form.selectGender": "लिंग निवडा",
    "form.male": "पुरुष",
    "form.female": "स्त्री",
    "form.other": "इतर",
    "form.preferNotToSay": "सांगू इच्छित नाही",
    "form.contactInfo": "संपर्क माहिती",
    "form.email": "ईमेल पत्ता *",
    "form.phone": "फोन नंबर *",
    "form.city": "शहर *",
    "form.state": "राज्य / प्रांत *",
    "form.healthInfo": "आरोग्य माहिती",
    "form.diabetesType": "मधुमेहाचा प्रकार *",
    "form.selectType": "प्रकार निवडा",
    "form.diagnosisDuration": "निदानानंतरचा कालावधी",
    "form.medications": "सध्याच्या औषधे / उपचार",
    "form.mainConcern": "मुख्य आरोग्य चिंता *",
    "form.mainConcernPlaceholder": "तुमच्या मुख्य आरोग्य चिंतेबद्दल किंवा तुम्हाला कोणत्या गोष्टीत मदत हवी आहे त्याबद्दल आम्हाला सांगा...",
    "form.referral": "तुम्ही आम्हाला कसे शोधले?",
    "form.referralSource": "रेफरल स्रोत *",
    "form.selectOption": "एक पर्याय निवडा",
    "form.additionalNotes": "तुम्हाला आम्हाला काही अतिरिक्त सांगू इच्छित आहे?",
    "form.additionalPlaceholder": "पर्यायी: कोणतीही अतिरिक्त माहिती...",
    "form.cancel": "रद्द करा",
    "form.submit": "विनंती सबमिट करा",
    "form.submitting": "सबमिट होत आहे...",
    "form.success": "धन्यवाद! आम्ही 24 तासांच्या आत तुमच्याशी संपर्क साधू.",
    "form.error": "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा किंवा थेट आमच्याशी संपर्क साधा.",

    // Language
    "lang.en": "English",
    "lang.hi": "हिन्दी",
    "lang.mr": "मराठी",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
