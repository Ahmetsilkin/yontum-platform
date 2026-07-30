import type {NextConfig} from 'next';
const config:NextConfig={reactStrictMode:true,poweredByHeader:false,images:{remotePatterns:[{protocol:'https',hostname:'**.supabase.co'}]}};
export default config;
