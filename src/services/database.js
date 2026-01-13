import { supabase } from '../lib/supabase';

// ============================================
// PROFILES
// ============================================
export const profile = {
  async get() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(profileData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// WALLET & TOKENS
// ============================================
export const wallet = {
  async getBalance() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('user_tokens')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return data?.balance || 0;
  },

  async updateBalance(amount, type = 'debit') {
    const { data: { user } } = await supabase.auth.getUser();
    
    const currentBalance = await this.getBalance();
    const newBalance = type === 'credit' 
      ? currentBalance + amount 
      : currentBalance - amount;

    if (newBalance < 0) {
      throw new Error('Insufficient tokens');
    }

    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({ balance: newBalance })
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Log transaction
    await this.logTransaction({
      type,
      amount,
      description: type === 'credit' ? 'Tokens added' : 'Tokens used'
    });

    return newBalance;
  },

  async logTransaction(transactionData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('ai_transactions')
      .insert([{
        user_id: user.id,
        ...transactionData,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
  },

  async getTransactions() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('ai_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// ============================================
// PROJECTS
// ============================================
export const projects = {
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(projectData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        user_id: user.id,
        ...projectData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, projectData) {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// DATASETS
// ============================================
export const datasets = {
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(datasetData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('datasets')
      .insert([{
        user_id: user.id,
        ...datasetData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('datasets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// MODELS
// ============================================
export const models = {
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(modelData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('models')
      .insert([{
        user_id: user.id,
        ...modelData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, modelData) {
    const { data, error } = await supabase
      .from('models')
      .update(modelData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('models')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// COMBINED EXPORT
// ============================================
export const database = {
  profile,
  wallet,
  projects,
  datasets,
  models
};