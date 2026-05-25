import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (loading) return

    // Lenis smooth scroll
    const lenis = new Lenis()
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Three.js background
    if (canvasRef.current) {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current, 
        alpha: true, 
        antialias: true 
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      const particlesCount = 1500
      const posArray = new Float32Array(particlesCount * 3)
      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10
      }
      const particlesGeometry = new THREE.BufferGeometry()
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: '#3D2B1F',
        transparent: true,
        opacity: 0.3,
      })
      
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
      scene.add(particlesMesh)

      const spheres: THREE.Mesh[] = []
      const sphereGeom = new THREE.SphereGeometry(1.5, 32, 32)
      for(let i=0; i<3; i++) {
        const mat = new THREE.MeshPhongMaterial({
            color: i === 0 ? '#4B5320' : i === 1 ? '#3D2B1F' : '#D2B48C',
            transparent: true,
            opacity: 0.1,
        })
        const sphere = new THREE.Mesh(sphereGeom, mat)
        sphere.position.set((Math.random()-0.5)*8, (Math.random()-0.5)*8, (Math.random()-0.5)*8)
        scene.add(sphere)
        spheres.push(sphere)
      }

      const light = new THREE.DirectionalLight(0xffffff, 1)
      light.position.set(2, 2, 5)
      scene.add(light)
      scene.add(new THREE.AmbientLight(0xffffff, 0.6))

      camera.position.z = 5

      const animate = () => {
        requestAnimationFrame(animate)
        particlesMesh.rotation.y += 0.0008
        spheres.forEach((s, idx) => {
            s.position.y += Math.sin(Date.now() * 0.0005 + idx) * 0.001
            s.rotation.x += 0.001
        })
        renderer.render(scene, camera)
      }
      animate()

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
        lenis.destroy()
      }
    }
  }, [loading])

  useEffect(() => {
    if (loading) return
    const reveals = document.querySelectorAll('.reveal')
    reveals.forEach((el) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
          }
        }
      )
    })
  }, [loading])

  return (
    <div ref={containerRef} className="relative bg-brand-cream min-h-screen text-brand-charcoal selection:bg-brand-brown selection:text-white cursor-none">
      <CustomCursor />
      
      {loading && (
        <div className="fixed inset-0 z-[100] bg-brand-charcoal flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-2 border-brand-beige/20 border-t-brand-beige rounded-full animate-spin mb-6" />
            <div className="text-brand-beige font-bold tracking-[0.4em] animate-pulse uppercase text-xs">Viti Kava Dealers</div>
        </div>
      )}

      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40" />
      
      <Navbar />
      <Hero />
      <Features />
      <Products />
      <Accessories />
      <Enquire />
      <Footer />
    </div>
  )
}

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && dotRef.current) {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.6, ease: 'power3.out' })
        gsap.set(dotRef.current, { x: e.clientX, y: e.clientY })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <div ref={cursorRef} className="fixed top-0 left-0 w-10 h-10 border border-brand-brown/30 rounded-full pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2 hidden md:block" />
      <div ref={dotRef} className="fixed top-0 left-0 w-1 h-1 bg-brand-brown rounded-full pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2 hidden md:block" />
    </>
  )
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-500 ${isScrolled ? 'py-4 glass shadow-lg' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-brown rounded-lg flex items-center justify-center text-brand-cream font-bold text-xl shadow-lg rotate-3">V</div>
            <span className="text-xl font-black tracking-tighter uppercase">Viti Kava Dealers</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.25em]">
            <a href="#about" className="hover:text-brand-brown transition-colors">Experience</a>
            <a href="#products" className="hover:text-brand-brown transition-colors">Collection</a>
            <a href="#contact" className="hover:text-brand-brown transition-colors">Enquire</a>
        </div>
        <a href="#contact" className="bg-brand-charcoal text-white px-7 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-brown transition-all hover:scale-105 active:scale-95 shadow-xl inline-block">
            Order Now
        </a>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center z-10">
        <div className="inline-block px-4 py-1.5 glass rounded-full mb-8 reveal opacity-0">
            <span className="text-brand-brown font-bold tracking-[0.3em] uppercase text-[10px]">Premium Traditional Kava</span>
        </div>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-10 reveal opacity-0">
            EXPERIENCE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-brown via-brand-olive to-brand-brown">PURE FIJI</span><br />
            QUALITY KAVA.
        </h1>
        <p className="max-w-xl mx-auto text-lg text-gray-500 mb-14 reveal opacity-0 leading-relaxed font-medium">
            Sourced from Fiji's most pristine estates, our noble kava varieties are selected 
            for those who demand authenticity and refinement.
        </p>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-brown/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}

function Features() {
    const features = [
        { title: "Authentic Fiji Sourced", desc: "Directly imported from the pristine islands, ensuring true traditional potency." },
        { title: "Premium Grade", desc: "Only noble varieties, meticulously processed for a superior experience." },
        { title: "Australian Compliant", desc: "Strictly following all health regulations for your peace of mind." },
        { title: "Brisbane Based", desc: "Local expertise and fast distribution across the entire continent." }
    ]

    return (
        <section id="about" className="py-40 bg-brand-dark-green text-brand-cream relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16">
                    {features.map((f, i) => (
                        <div key={i} className="reveal opacity-0 group">
                            <div className="w-10 h-1 bg-brand-beige/30 mb-8 group-hover:w-full group-hover:bg-brand-beige transition-all duration-1000" />
                            <h3 className="text-xl font-black mb-5 tracking-tight">{f.title}</h3>
                            <p className="text-brand-cream/50 text-sm leading-relaxed font-medium">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        </section>
    )
}

function Products() {
    const products = [
        { name: "Traditional Blend", size: "500g", desc: "The essential kava experience for daily relaxation." },
        { name: "Traditional Blend", size: "1kg", desc: "Our most popular selection, perfect for regular sessions." },
        { name: "Elite Premium", size: "1kg", desc: "Rare noble roots with an exceptionally smooth finish." }
    ]

    return (
        <section id="products" className="py-40 relative">
            <div className="max-w-7xl mx-auto px-6 text-center mb-24">
                <h2 className="text-brand-brown font-bold tracking-[0.3em] uppercase text-[10px] mb-4 reveal opacity-0">The Collection</h2>
                <h3 className="text-5xl font-black reveal opacity-0 tracking-tighter">PREMIUM KAVA ROOTS</h3>
            </div>
            
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
                {products.map((p, i) => (
                    <div key={i} className="reveal opacity-0 glass p-12 rounded-[2.5rem] hover:bg-white transition-all duration-700 hover:-translate-y-5 shadow-xl group border border-brand-brown/5">
                        <div className="mb-10 flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-brown bg-brand-brown/10 px-5 py-1.5 rounded-full">{p.size}</span>
                        </div>
                        <h4 className="text-3xl font-black mb-3 group-hover:text-brand-brown transition-colors tracking-tight">{p.name}</h4>
                        <div className="text-lg font-bold mb-8 text-brand-brown/60 uppercase tracking-widest">Pricing Available Upon Request</div>
                        <p className="text-gray-500 mb-2 text-sm leading-relaxed font-medium">{p.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

function Accessories() {
    const accessories = [
        { name: "Small Bilo", icon: "🥥" },
        { name: "Big Bilo", icon: "🥥" },
        { name: "Serving Spoon", icon: "🥄" },
        { name: "Strainer", icon: "🧤" }
    ]

    return (
        <section className="py-40 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
                    <div>
                        <h2 className="text-brand-brown font-bold tracking-[0.3em] uppercase text-[10px] mb-4 reveal opacity-0">Refinement</h2>
                        <h3 className="text-5xl font-black reveal opacity-0 tracking-tighter">TRADITIONAL<br />EQUIPMENT</h3>
                    </div>
                    <p className="max-w-sm text-gray-400 reveal opacity-0 text-sm font-medium leading-relaxed">
                        Complete your ritual with our hand-selected tools designed for the perfect preparation and service.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {accessories.map((a, i) => (
                        <div key={i} className="reveal opacity-0 group">
                            <div className="aspect-square bg-white rounded-[2rem] mb-6 flex items-center justify-center p-12 transition-all group-hover:shadow-2xl group-hover:-translate-y-3 border border-black/5 relative overflow-hidden">
                                <div className="text-6xl group-hover:scale-125 transition-transform duration-700 z-10">{a.icon}</div>
                                <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/[0.02] transition-colors" />
                            </div>
                            <div className="flex flex-col px-2">
                                <h4 className="font-black text-sm uppercase tracking-tight mb-1">{a.name}</h4>
                                <span className="text-brand-brown/40 font-bold text-[9px] uppercase tracking-tighter">Pricing Upon Request</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function Enquire() {
    return (
        <section id="contact" className="py-40 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 glass p-20 md:p-32 rounded-[4rem] shadow-2xl relative z-10 reveal opacity-0 border border-white/20">
                <div className="text-center mb-16">
                    <h2 className="text-brand-brown font-bold tracking-[0.4em] uppercase text-[10px] mb-6">Concierge</h2>
                    <h3 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter leading-none">BEGIN YOUR<br />EXPERIENCE</h3>
                    <p className="text-gray-500 text-sm font-medium max-w-md mx-auto leading-relaxed">
                        Enquire about our private stock, wholesale opportunities, or direct delivery in Brisbane.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <a href="tel:+61448876747" className="flex items-center gap-6 p-10 bg-white/40 rounded-3xl hover:bg-brand-brown hover:text-white transition-all duration-500 group border border-brand-brown/5">
                        <div className="w-12 h-12 bg-brand-charcoal text-white rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-brand-brown transition-all shadow-lg">
                            📞
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-black opacity-40 mb-1">Direct Line</p>
                            <p className="text-lg font-black tracking-tight">+61 448 876 747</p>
                        </div>
                    </a>
                    <a href="mailto:mdnarayan@hotmail.com" className="flex items-center gap-6 p-10 bg-white/40 rounded-3xl hover:bg-brand-brown hover:text-white transition-all duration-500 group border border-brand-brown/5">
                        <div className="w-12 h-12 bg-brand-charcoal text-white rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-brand-brown transition-all shadow-lg">
                            ✉️
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] uppercase tracking-widest font-black opacity-40 mb-1">Electronic Mail</p>
                            <p className="text-lg font-black tracking-tight truncate">mdnarayan@hotmail.com</p>
                        </div>
                    </a>
                </div>
                
                <div className="mt-10 p-10 bg-brand-charcoal text-brand-cream rounded-3xl text-center shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] uppercase tracking-[0.5em] font-black mb-3">Brisbane, Australia</p>
                        <p className="opacity-40 italic text-[11px] font-medium tracking-wide">Serving the community with tradition and excellence.</p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-brown/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                </div>
            </div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-olive/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        </section>
    )
}

function Footer() {
    return (
        <footer className="py-24 bg-brand-charcoal text-brand-cream border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-20">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                            <div className="w-9 h-9 bg-brand-beige text-brand-charcoal rounded-lg flex items-center justify-center font-black rotate-3">V</div>
                            <span className="text-2xl font-black tracking-tighter uppercase">Viti Kava Dealers</span>
                        </div>
                        <p className="text-brand-cream/30 max-w-xs text-sm font-medium leading-relaxed">
                            The definitive standard of Fiji Kava in Australia. 
                            Preserving tradition through modern excellence.
                        </p>
                    </div>
                </div>
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] uppercase tracking-[0.4em] font-black text-brand-cream/10">
                    <p>© 2024 Viti Kava Dealers. Brisbane, Australia.</p>
                    <p className="text-brand-beige/30">Fully Licensed & Australian Law Compliant</p>
                </div>
            </div>
        </footer>
    )
}
