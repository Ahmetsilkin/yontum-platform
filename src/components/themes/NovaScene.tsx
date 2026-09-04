'use client';
/* Nova'nın imza görsel öğesi: kullanıcının 21st.dev'den paylaştığı "3D Orbit
   Gallery" referansının aynısı — toz parçacıklarından oluşan bir küre,
   etrafında dönen fotoğraf halkası, sürükleyerek döndürme + kaydırma (pan)
   kamera kontrolü — referansla tıpatıp aynı. Hem Hero'da hem Galeri'de
   kullanılıyor (aynı bileşen, iki kez).

   İKİ bilinçli fark:
   1) 1500 parçacık artık referanstaki gibi 1500 ayrı <mesh> değil, TEK bir
      <instancedMesh> — görsel olarak birebir aynı ama 1500 ayrı çizim komutu
      yerine tek çizim komutu (bu oturumda WebGL performansıyla defalarca
      uğraştık, aynı hatayı bilerek tekrar etmedim).
   2) enableZoom KAPALI. Three.js'in OrbitControls'ü fare tekerleğini
      yakınlaştırma için kullanıyor — ama bu bir DEMO sayfası değil, altında
      Hizmetler/Galeri/Randevu bölümleri olan gerçek bir site. Zoom açıkken
      tekerlek sahneye her değdiğinde sayfa KAYMIYOR, kamera yakınlaşıyordu
      ("aşağı kaydırınca aşağıya inmiyor" hatası buydu). Sürükleyerek
      döndürme + kaydırma (pan) tekerlek kullanmadığı için sayfa scroll'uyla
      hiç çakışmıyor, tamamen açık kaldı — sadece "tekerlekle yakınlaştır"
      kapatıldı ki tekerlek her zaman sayfayı kaydırsın. */
import{useRef,useMemo,useEffect,Suspense}from'react';
import{Canvas,useFrame}from'@react-three/fiber';
import{OrbitControls,useTexture}from'@react-three/drei';
import * as THREE from 'three';

const PARTICLE_COUNT=1500,SPHERE_RADIUS=9,POSITION_RANDOMNESS=4;
const PARTICLE_SIZE_MIN=0.005,PARTICLE_SIZE_MAX=0.010;
const IMAGE_COUNT=24,IMAGE_SIZE=1.5;

function ParticleField(){
  const meshRef=useRef<THREE.InstancedMesh>(null);
  const dummy=useMemo(()=>new THREE.Object3D(),[]);
  const data=useMemo(()=>{
    const arr:{position:[number,number,number];scale:number;color:THREE.Color}[]=[];
    for(let i=0;i<PARTICLE_COUNT;i++){
      const phi=Math.acos(-1+(2*i)/PARTICLE_COUNT);
      const theta=Math.sqrt(PARTICLE_COUNT*Math.PI)*phi;
      const r=SPHERE_RADIUS+(Math.random()-0.5)*POSITION_RANDOMNESS;
      const x=r*Math.cos(theta)*Math.sin(phi);
      const y=r*Math.cos(phi);
      const z=r*Math.sin(theta)*Math.sin(phi);
      arr.push({
        position:[x,y,z],
        scale:Math.random()*(PARTICLE_SIZE_MAX-PARTICLE_SIZE_MIN)+PARTICLE_SIZE_MIN,
        /* Referanstaki sarımsı/amber ton yerine kullanıcının verdiği tema
           renklerinin (#595B83, #333456) hue'su — ~0.66. Doygunluk/parlaklık
           bu iki rengin ham L değerlerinden değil, siyah zeminde "ışıldayan
           toz" gibi görünmesi için biraz daha açık tutuldu (aksi hâlde bu iki
           renk koyu tonda olduğundan parçacıklar neredeyse görünmez olurdu). */
        color:new THREE.Color().setHSL(0.65+Math.random()*0.04,0.32+Math.random()*0.18,0.55+Math.random()*0.25)
      });
    }
    return arr;
  },[]);
  useEffect(()=>{
    const mesh=meshRef.current;if(!mesh)return;
    data.forEach((d,i)=>{
      dummy.position.set(d.position[0],d.position[1],d.position[2]);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i,dummy.matrix);
      mesh.setColorAt(i,d.color);
    });
    mesh.instanceMatrix.needsUpdate=true;
    if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  },[data,dummy]);
  return <instancedMesh ref={meshRef} args={[undefined as any,undefined as any,PARTICLE_COUNT]}>
    <sphereGeometry args={[1,8,6]}/>
    <meshBasicMaterial transparent opacity={1}/>
  </instancedMesh>;
}

function OrbitImages({photos}:{photos:string[]}){
  const textures=useTexture(photos);
  useEffect(()=>{
    (Array.isArray(textures)?textures:[textures]).forEach((t:any)=>{
      if(t){t.wrapS=THREE.ClampToEdgeWrapping;t.wrapT=THREE.ClampToEdgeWrapping;t.flipY=false}
    });
  },[textures]);
  const list=Array.isArray(textures)?textures:[textures];
  const images=useMemo(()=>{
    const arr:{position:[number,number,number];rotation:[number,number,number];textureIndex:number}[]=[];
    for(let i=0;i<IMAGE_COUNT;i++){
      const angle=(i/IMAGE_COUNT)*Math.PI*2;
      const x=SPHERE_RADIUS*Math.cos(angle),y=0,z=SPHERE_RADIUS*Math.sin(angle);
      const position=new THREE.Vector3(x,y,z);
      const outward=position.clone().normalize();
      const m=new THREE.Matrix4();
      m.lookAt(position,position.clone().add(outward),new THREE.Vector3(0,1,0));
      const euler=new THREE.Euler().setFromRotationMatrix(m);
      euler.z+=Math.PI;
      arr.push({position:[x,y,z],rotation:[euler.x,euler.y,euler.z],textureIndex:i%list.length});
    }
    return arr;
  },[list.length]);
  return <>{images.map((img,i)=><mesh key={i} position={img.position} rotation={img.rotation}>
    <planeGeometry args={[IMAGE_SIZE,IMAGE_SIZE]}/>
    <meshBasicMaterial map={list[img.textureIndex]} side={THREE.DoubleSide}/>
  </mesh>)}</>;
}

function NovaGroup({photos}:{photos:string[]}){
  const groupRef=useRef<THREE.Group>(null);
  useFrame(()=>{if(groupRef.current)groupRef.current.rotation.y+=0.0005});
  return <group ref={groupRef}>
    <ParticleField/>
    <Suspense fallback={null}><OrbitImages photos={photos}/></Suspense>
  </group>;
}

export default function NovaScene({photos}:{photos:string[]}){
  return <Canvas camera={{position:[-10,1.5,10],fov:50}} dpr={[1,2]} gl={{antialias:false}}>
    <ambientLight intensity={0.5}/>
    <pointLight position={[10,10,10]} intensity={1}/>
    <NovaGroup photos={photos}/>
    <OrbitControls enablePan enableZoom={false} enableRotate enableDamping dampingFactor={0.06}/>
  </Canvas>;
}
