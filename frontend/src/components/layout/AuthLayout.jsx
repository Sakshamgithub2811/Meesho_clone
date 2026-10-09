import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthLayout({ 
  title, 
  subtitle, 
  roleName = "Portal", 
  loginContent, 
  registerContent 
}) {
  return (
    <div className="bg-[#fff4f6] text-[#4a2135] h-screen w-full overflow-hidden relative font-sans">
      {/* 1. Background Graphic & Floating Logo (Fixed) */}
      <div className="absolute top-0 left-0 w-full h-[353px] overflow-hidden [clip-path:ellipse(110%_100%_at_50%_0%)] bg-[#ff7293]/20 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fff4f6]/90 z-10" />
        <img 
          className="w-full h-full object-cover mix-blend-multiply opacity-80" 
          alt="MShoppy Auth" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA17Odz0VuEd9507iy5ggYedrO4p3lV7PTifqh_NIFIjMwYs7F7xvv7dJPF3VZ6Z11llVLVw5xtNaMn4qJcaZlijJ5VYBvw4lkhDG0GaD_3mqVC6fp_xGCsC_hT5Kl2Yvq85636Vd8iv-Nfvmw3A5Otx5SstITEeJ4evOSjB2EZqGwhDYhrJHL4AtEO6BSjDVRSWi-AhA3f8HCmXuKT-yo3NUOxOwpD4XR4x4e-hJLySUEWwuFS8o8Obusm8jNEjV35CWqYtkzkNNg" 
        />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/80 backdrop-blur-[20px] px-6 py-2 rounded-full border border-white/40 shadow-[0_12px_40px_rgba(74,33,53,0.06)] flex items-center gap-2.5">
            <span className="text-[#b7004d] font-black tracking-tighter text-xl">
              MSHOPPY <span className="uppercase text-[#ff7293] text-sm">{roleName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Content Card Area */}
      <main className="relative z-20 h-screen w-full overflow-y-auto flex flex-col items-center justify-center px-6 pt-16 pb-6">
        <div className="w-full max-w-md shrink-0 flex flex-col items-center mt-12">
        <Card className="w-full shadow-2xl border-white/50 bg-white/95 backdrop-blur-sm rounded-[2rem]">
          <CardHeader className="text-center pt-8 pb-6">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-[#4a2135]">
              {title}
            </CardTitle>
            {subtitle && (
              <CardDescription className="text-[#7d4d62] font-medium opacity-80 mt-2 text-sm">
                {subtitle}
              </CardDescription>
            )}
          </CardHeader> 
          
          <CardContent className="pb-8 px-6 sm:px-8">
            {/* Agar registerContent bheja hai toh Tabs dikhayenge */}
            {registerContent ? (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 rounded-full bg-[#ffecf1] p-1.5 min-h-[54px] items-center">
                  <TabsTrigger 
                    value="login" 
                    className="rounded-full py-2.5 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#b7004d] data-[state=active]:to-[#ff7293] data-[state=active]:text-white font-bold text-sm transition-all"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="rounded-full py-2.5 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#b7004d] data-[state=active]:to-[#ff7293] data-[state=active]:text-white font-bold text-sm transition-all"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
                
                {/* Login Form ki jagah */}
                <TabsContent value="login" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {loginContent}
                </TabsContent>
                
                {/* Register Form ki jagah */}
                <TabsContent value="register" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {registerContent}
                </TabsContent>
              </Tabs>
            ) : (
              /* Agar register nahi chahiye, toh bas login content dikhao */
              loginContent
            )}
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
