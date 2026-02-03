
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bhuisfxxhwzlqjfzffau.supabase.co';

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJodWlzZnh4aHd6bHFqZnpmZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTAwODUsImV4cCI6MjA4NTY4NjA4NX0.ElHDrEsjXP5yZaxPf4YFYR4EU_CtO4Lqms10bwXQCpg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);