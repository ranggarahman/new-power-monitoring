// types/analytics.ts

export interface CategoryStatusSummary {
  category_name: string;
  safe_count: number;
  caution_count: number;
  below_count: number;
  total_items: number;
}

export interface AnalyticsOverviewResponse {
  total_items: number;
  total_safe: number;
  total_caution: number;
  total_below: number;
  by_category: CategoryStatusSummary[];
}

export interface CategoryValue {
  category_name: string;
  total_value: number;
}

export interface ValueSummaryResponse {
  grand_total_value: number;
  by_category: CategoryValue[];
}