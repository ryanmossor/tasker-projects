import "dotenv/config";

export const mocks = {
    /* Tasker built-ins */
    SDK: "", // non-empty SDK value means env is Tasker
    LOC: process.env.GPS_COORDS,

    caller: "task=CALLER PLACEHOLDER",
    tasker_current_action_number: "5",

    /* Tasker global vars */
    CHECKIN_API: process.env.CHECKIN_API_ENDPOINT,

    HA_TOKEN: process.env.HOME_ASSISTANT_API_KEY,
    HA_URL: process.env.HOME_ASSISTANT_API_ENDPOINT,

    YOUTUBE_KEY: process.env.YOUTUBE_API_KEY,

    JSON_PATH: "./json",

    LOG_LEVEL: "DEBUG",
    LOG_NOTIF_THRESHOLD: "WARNING",

    LOG_WEIGHT: "1",
    HOME: "1",
    ONLINE: "1",
    YOGA_TIME: "7.20",

    CHECKIN_FIELDS: JSON.stringify({
        "spreadsheetName": "[Tasker] 2024 Daily Tracker",
        "date": "2024-09-03",
        "month": "Sep",
        "cellReference": "E1",
    }),
    CHECKIN_FIELDS_SET: "",

    TARGET_BEDTIME: "21:30",
    TARGET_WAKE_TIME: "05:30",
    SLEEP_TARGETS_REQUIRED: "2",

    /* Check-in local/project vars */
    par1: "End",
    par2: JSON.stringify({
        "Fan": "1",
        "Feel Well-Rested": "3",
        "Open window": "1",
        "Screens <1hr before bed": "1",
        "White noise": "1",
    }),

    spreadsheet_data: "JULY,[H] Journal,[H] Meditation,[H] Morning sunlight,[H] Read,[E] Calisthenics,[E] Elliptical,[E] HIIT,[E] Hike*,[E] Kayaking*,[E] Lifting,[E] Ride*,[E] Run*,[E] Stair climber,[E] Stationary bike,[E] Yoga,[L] Air travel,[L] Alcohol**,[L] Caffeine,[L] Commuting,[L] Late meal,[L] Sauna,[L] Work from home,[ST] Injured,[ST] Seasonal allergies,[ST] Sick,[M] Overall Mood,[M] Irritability,[M] Productivity,[M] Sense of Control,[M] Sense of Purpose,[M] Stress,[MS] Aller-Clear,[MS] Aller-Flo,[MS] Apigenin,[MS] Creatine,[MS] Fish oil,[MS] Magnesium Glycinate,[MS] Theanine,[MS] Vitamin C,[MS] Vitamin D3,[S] Away from home,[S] Fan,[S] Feel Well-Rested,[S] Heater,[S] Humidifier,[S] Open window,[S] Screens <1hr before bed,[S] Screens in bed,[S] White noise,Bedtime,Wake-up time,Total Time in Bed,BMI,Body fat %,Weight (lbs)",

    expense_categories: "Air travel,Books,Car insurance,Car maintenance,Car payment,Cleaning,Clothes,Computer/Accessories,Cycling,Decor,Electric bill,Electronics,Fitness,Furniture,Gas,Gifts,Groceries,Haircut,Hotels,Internet,Kitchen,Medical,Misc entertainment,Outdoors,Personal care,Phone bill,Rent,Renter's insurance,Restaurants,Rideshare,Running,Software,Subscriptions,Supplements,Taxes,Tools,Utilities,Video games",

    expense_vendors: "Costco,ALDI,Spectrum,Verizon,Costco,Costco,Walgreens,Walgreens,Costco,ALDI,Amazon,Costco,ALDI,Costco,Nintendo,Amazon,Target,Costco,ALDI,Amazon,Amazon,Amazon,Spectrum,Keychron,Verizon,IKEA,IKEA,IKEA,Costco,ALDI,ALDI,Costco,Amazon,Amazon,Amazon,Hilton,Southwest",

    /* Misc */
    date: "2023-01-29",
    input: "https://www.youtube.com/watch?v=Oy4wvF9Z24A&list=PLui6Eyny-Uzy2kmMzz9TTsOTKThpFKF-I&pp=iAQB",
    time: "19:30",

    SFX_JSON: JSON.stringify({
        nextIndex: 2,
        nextSfxFile: "/sdcard/Notifications/sfx/sound_file.wav",
    }),
};
