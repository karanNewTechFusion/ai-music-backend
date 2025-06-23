
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

console.log("✅ Supabase Key in use (first 20 chars):", process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 20)); // add this line


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

console.log('====================================');
console.log(">>>>>",supabase);
console.log('====================================');

export default supabase;

