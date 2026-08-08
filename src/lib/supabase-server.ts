import{createServerClient,type CookieOptions}from'@supabase/ssr';import{createClient as adminClient}from'@supabase/supabase-js';import{cookies}from'next/headers';
type CookieItem={name:string;value:string;options?:CookieOptions};
export async function createClient(){const store=await cookies();return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>store.getAll(),setAll(items:CookieItem[]){try{items.forEach(({name,value,options})=>store.set(name,value,options))}catch{}}}})}
export const createServiceClient=()=>adminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
