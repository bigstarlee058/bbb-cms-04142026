export interface TargetCriteria {
    matchLogic: 'all' | 'any';
    subscriptionStatus: string;
    subscriptionType: string[];
    subscriptionSource: string[];
    signupSource: string;
}
export const defaultTargetCriteria: TargetCriteria = {
    matchLogic: 'all',
    subscriptionStatus: 'all',
    subscriptionType: [],
    subscriptionSource: [],
    signupSource: 'all',
};
export interface Upsell {
    _id: string;
    title: string;
    titleTranslations?: Record<string, string>;
    subtitle?: string;
    subtitleTranslations?: Record<string, string>;
    description?: string;
    descriptionTranslations?: Record<string, string>;
    image: string;
    imageTranslations?: Record<string, string>;
    originalPrice: number;
    discountType: "percent" | "fixed";
    discountValue: number;
    currency: string;
    buttonText: string;
    buttonTextTranslations?: Record<string, string>;
    buttonLink: string;
    buttonLinkTranslations?: Record<string, string>;
    timeType: "always" | "date_range" | "duration";
    startDate?: string | null;
    endDate?: string | null;
    durationDays?: number;
    durationHours?: number;
    targetType: "all" |  "criteria";
    targetUserIds?: string[];
    targetCriteria?: TargetCriteria; 
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    dismissBehavior: 'session' | 'days_30' | 'never';
}

export interface UpsellResponse {
    success: boolean;
    data: Upsell;
}

export interface UpsellsResponse {
    data: Upsell[];
}