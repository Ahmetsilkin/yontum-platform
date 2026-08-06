'use client';
import{useEffect}from'react';
export default function AuthHashRedirect(){useEffect(()=>{const hash=window.location.hash;if(!hash)return;const p=new URLSearchParams(hash.slice(1)),type=p.get('type');if(type==='recovery'&&window.location.pathname!=='/sifre-yenile')window.location.replace(`/sifre-yenile${hash}`);if(type==='invite'&&window.location.pathname!=='/sifre-olustur')window.location.replace(`/sifre-olustur${hash}`)},[]);return null}
