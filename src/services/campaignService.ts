import { queryService } from '../database';
import { Campaign, CampaignFilters } from '../database/models/Campaign';

export class CampaignService {
  async getAllCampaigns(filters: CampaignFilters = {}) {
    const {
      search,
      category_id,
      status = 'active',
      is_featured,
      page = 1,
      limit = 6,
    } = filters;

    let query = `
      SELECT 
        c.*,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.status = ?
    `;

    const params: any[] = [status];

    // Add search filter
    if (search) {
      query += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.short_description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add category filter
    if (category_id) {
      query += ` AND c.category_id = ?`;
      params.push(category_id);
    }

    // Add featured filter
    if (is_featured !== undefined) {
      query += ` AND c.is_featured = ?`;
      params.push(is_featured);
    }

    // Add ordering
    query += ` ORDER BY c.is_featured DESC, c.created_at DESC`;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const campaigns = await queryService.customQuery(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM campaigns c
      WHERE c.status = ?
    `;
    const countParams: any[] = [status];

    if (search) {
      countQuery += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.short_description LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category_id) {
      countQuery += ` AND c.category_id = ?`;
      countParams.push(category_id);
    }

    if (is_featured !== undefined) {
      countQuery += ` AND c.is_featured = ?`;
      countParams.push(is_featured);
    }

    const countResult = await queryService.customQuery(countQuery, countParams);
    const total = (countResult as any[])[0]?.total || 0;

    return {
      campaigns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCampaignById(id: number) {
    const query = `
      SELECT 
        c.*,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `;

    const campaigns = await queryService.customQuery(query, [id]);
    return (campaigns as any[])[0] || null;
  }

  async getFeaturedCampaigns(limit = 3) {
    const query = `
      SELECT 
        c.*,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.status = 'active' AND c.is_featured = true
      ORDER BY c.created_at DESC
      LIMIT ?
    `;

    return await queryService.customQuery(query, [limit]);
  }

  async getCampaignsByCreator(userId: number) {
    const query = `
      SELECT 
        c.*,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `;

    return await queryService.customQuery(query, [userId]);
  }

  async getCategories() {
    // Assuming you have a categories table
    const query = `SELECT id, name FROM categories ORDER BY name`;
    return await queryService.customQuery(query);
  }
}

export const campaignService = new CampaignService();
