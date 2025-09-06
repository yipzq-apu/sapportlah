export interface Campaign {
  id?: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  short_description: string;
  goal_amount: number;
  current_amount: number;
  end_date: string;
  featured_image?: string;
  video_url?: string;
  status: 'draft' | 'active' | 'successful' | 'failed' | 'cancelled';
  is_featured: boolean;
  backers_count: number;
  created_at?: Date;
  updated_at?: Date;
  // Joined fields from users table
  creator_name?: string;
  creator_email?: string;
  category_name?: string;
}

export interface CampaignFilters {
  search?: string;
  category_id?: number;
  status?: string;
  is_featured?: boolean;
  page?: number;
  limit?: number;
}
