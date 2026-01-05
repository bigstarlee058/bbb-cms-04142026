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
    subtitle?: string;
    description?: string;
    image: string;
    originalPrice: number;
    discountType: "percent" | "fixed";
    discountValue: number;
    currency: string;
    buttonText: string;
    buttonLink: string;
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