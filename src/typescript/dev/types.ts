/* eslint-disable camelcase */
import { youtube_v3 } from "@googleapis/youtube";

export type CheckinLists = {
    fullChecklist: string[];
    trackedActivities: string[];
};

export type CheckinQueueItem = {
    checkinFields: CheckinFields;
    formResponse: Record<string, string>;
    getWeight?: boolean;
    sleepStart?: number;
    sleepEnd?: number;
};

export type CheckinFields = {
    spreadsheetName: string;
    date: string;
    month: string;
    cellReference: string;
};

export type CheckinResult = CheckinFields & {
    resultsString: string;
};

export type CheckinApiResponse = {
    unprocessed: CheckinQueueItem[];
    results: CheckinResult[];
};

export type ExpensesJson = {
    categories: string[];
    vendors: string[];
};

export type Habit = {
    name: string;
    lastDate: string;
    daysSince: number;
    pastWeek: string[];
    avoid?: boolean;
    reminderText?: string;
    reminderThreshold?: number;
    types?: string[];
    weeklyTarget?: number;
};

export type Reward = {
    name: string;
    weight: number;
    timesAppeared: number;
    unredeemed: number;
};

export type CheckinListCategories = {
    checkboxItems: Record<string, string[]>,
    rangeItems: Record<string, string[]>
};

export type CheckinJson = {
    habits: Habit[];
    lists: {
        evening: CheckinListCategories;
        morning: CheckinListCategories;
    };
    rewards: {
        habitsTarget: number;
        daysSinceLastRewardRoll: number;
        rollStreak: number;
        rewardList: Reward[];
    }
};

export type Quote = {
    quote: string;
    author: string;
    id: number;
    hasAppeared: boolean;
};

export type QuotesJson = {
    daily: {
        quotes: Quote[];
        nextId: number;
        todaysQuoteId: number;
    };
    weekly: string;
    monthly: string;
};

export type YogaJson = {
    ywaChannelId: string;
    currentVidIndex: number;
    currentMonth: string;
    defaultNotifTime: string;
    playlistId: string;
    playlistTitle: string;
    videos: {
        yogaVideo: string;
        yogaTitle: string;
        yogaDuration: string;
        meditationVideo?: string;
        meditationTitle?: string;
        meditationDuration?: string;
    }
};

export type JsonPaths = {
    checkin: string;
    checkinQueue: string;
    expenses: string;
    quotes: string;
    yoga: string;
};

export type NotificationAction = {
    label: string;
    action: {
        name: string;
        par1?: any;
        par2?: any;
    }
};

export type NotificationPayload = {
    title: string;
    text: string;
    icon?: string;
    priority?: number;
    soundFile?: string;
    category?: string;
    // Too much of a headache to do an array of NotificationAction objects due to limitations with Tasker JSON parsing
    action1?: NotificationAction;
    action2?: NotificationAction;
    action3?: NotificationAction;
};

export type LogMessage = LogParams & {
    timestamp: string;
    task: string;
    action: string;
};

export type LogParams = {
    level: "ERROR" | "WARNING" | "INFO" | "DEBUG" | "TRACE",
    message: string | Error;
    logFile?: string;
    properties?: Record<string, any>;
    funcName?: string;
};

export type PlaylistItem = youtube_v3.Schema$PlaylistItemListResponse;
export type Playlist = youtube_v3.Schema$PlaylistListResponse;
