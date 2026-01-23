import { supabase } from '../lib/supabase';

class AnalyticsService {
  // Track any event
  async trackEvent(eventType, eventData = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id,
          event_type: eventType,
          event_data: eventData,
          project_id: eventData.project_id || null
        });

      if (error) throw error;
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Track project view
  async trackProjectView(projectId) {
    try {
      await this.trackEvent('project_view', { project_id: projectId });
      
      // Update project analytics
      const { error } = await supabase.rpc('increment_project_stat', {
        p_project_id: projectId,
        p_stat_type: 'view'
      });

      if (error) throw error;
    } catch (error) {
      console.error('Track view error:', error);
    }
  }

  // Track project download
  async trackProjectDownload(projectId) {
    try {
      await this.trackEvent('project_download', { project_id: projectId });
      
      const { error } = await supabase.rpc('increment_project_stat', {
        p_project_id: projectId,
        p_stat_type: 'download'
      });

      if (error) throw error;
    } catch (error) {
      console.error('Track download error:', error);
    }
  }

  // Track project click
  async trackProjectClick(projectId) {
    try {
      await this.trackEvent('project_click', { project_id: projectId });
      
      const { error } = await supabase.rpc('increment_project_stat', {
        p_project_id: projectId,
        p_stat_type: 'click'
      });

      if (error) throw error;
    } catch (error) {
      console.error('Track click error:', error);
    }
  }

  // Get user analytics
  async getUserAnalytics(userId) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user analytics error:', error);
      return [];
    }
  }

  // Get project analytics
  async getProjectAnalytics(projectId) {
    try {
      const { data, error } = await supabase
        .from('project_analytics')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || { views: 0, downloads: 0, clicks: 0, shares: 0 };
    } catch (error) {
      console.error('Get project analytics error:', error);
      return { views: 0, downloads: 0, clicks: 0, shares: 0 };
    }
  }

  // Get all user projects analytics
  async getUserProjectsAnalytics(userId) {
    try {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, category, created_at')
        .eq('user_id', userId);

      if (projectsError) throw projectsError;

      const projectsWithAnalytics = await Promise.all(
        projects.map(async (project) => {
          const analytics = await this.getProjectAnalytics(project.id);
          return {
            ...project,
            analytics
          };
        })
      );

      return projectsWithAnalytics;
    } catch (error) {
      console.error('Get user projects analytics error:', error);
      return [];
    }
  }

  // Calculate engagement rate
  calculateEngagementRate(views, clicks, downloads) {
    if (views === 0) return 0;
    const totalEngagements = clicks + downloads;
    return ((totalEngagements / views) * 100).toFixed(2);
  }

  // Get trending categories
  async getTrendingCategories() {
    try {
      const { data, error } = await supabase
        .from('project_analytics')
        .select(`
          project_id,
          views,
          downloads,
          clicks,
          projects (
            category
          )
        `)
        .order('views', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Aggregate by category
      const categoryStats = {};
      data.forEach(item => {
        const category = item.projects?.category || 'Uncategorized';
        if (!categoryStats[category]) {
          categoryStats[category] = {
            totalViews: 0,
            totalDownloads: 0,
            totalClicks: 0,
            projectCount: 0
          };
        }
        categoryStats[category].totalViews += item.views || 0;
        categoryStats[category].totalDownloads += item.downloads || 0;
        categoryStats[category].totalClicks += item.clicks || 0;
        categoryStats[category].projectCount += 1;
      });

      // Convert to array and calculate scores
      const trends = Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        ...stats,
        trendScore: (stats.totalViews * 0.4 + stats.totalDownloads * 0.4 + stats.totalClicks * 0.2)
      }));

      return trends.sort((a, b) => b.trendScore - a.trendScore);
    } catch (error) {
      console.error('Get trending categories error:', error);
      return [];
    }
  }

  // Predict market potential
  async predictMarketPotential(category) {
    try {
      const trends = await this.getTrendingCategories();
      const categoryTrend = trends.find(t => t.category === category);

      if (!categoryTrend) {
        return {
          potential: 'Low',
          score: 0,
          recommendation: 'Limited data available for this category'
        };
      }

      const score = categoryTrend.trendScore;
      let potential, recommendation;

      if (score > 1000) {
        potential = 'Very High';
        recommendation = 'Excellent market opportunity. High demand and engagement.';
      } else if (score > 500) {
        potential = 'High';
        recommendation = 'Strong market potential. Good growth opportunity.';
      } else if (score > 200) {
        potential = 'Medium';
        recommendation = 'Moderate interest. Consider niche positioning.';
      } else {
        potential = 'Low';
        recommendation = 'Emerging category. Early adopter advantage possible.';
      }

      return {
        potential,
        score: score.toFixed(0),
        recommendation,
        stats: categoryTrend
      };
    } catch (error) {
      console.error('Predict market potential error:', error);
      return {
        potential: 'Unknown',
        score: 0,
        recommendation: 'Unable to analyze market data'
      };
    }
  }

  // Get analytics summary
  async getAnalyticsSummary(userId) {
    try {
      const projects = await this.getUserProjectsAnalytics(userId);
      
      const summary = {
        totalProjects: projects.length,
        totalViews: projects.reduce((sum, p) => sum + (p.analytics?.views || 0), 0),
        totalDownloads: projects.reduce((sum, p) => sum + (p.analytics?.downloads || 0), 0),
        totalClicks: projects.reduce((sum, p) => sum + (p.analytics?.clicks || 0), 0),
        avgEngagementRate: 0,
        topPerformingProjects: [],
        categoryBreakdown: {}
      };

      // Calculate average engagement
      const totalEngagements = summary.totalClicks + summary.totalDownloads;
      summary.avgEngagementRate = summary.totalViews > 0 
        ? ((totalEngagements / summary.totalViews) * 100).toFixed(2)
        : 0;

      // Get top performing projects
      summary.topPerformingProjects = projects
        .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
        .slice(0, 5);

      // Category breakdown
      projects.forEach(project => {
        const category = project.category || 'Uncategorized';
        if (!summary.categoryBreakdown[category]) {
          summary.categoryBreakdown[category] = 0;
        }
        summary.categoryBreakdown[category]++;
      });

      return summary;
    } catch (error) {
      console.error('Get analytics summary error:', error);
      return null;
    }
  }
}

export default new AnalyticsService();