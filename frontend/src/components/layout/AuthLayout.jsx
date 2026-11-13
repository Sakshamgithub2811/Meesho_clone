import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthLayout({
  title,
  subtitle,
  roleName = "Portal",
  loginContent,
  registerContent,
  activeTab,
  onTabChange
}) {
  const tabsProps = activeTab ? { value: activeTab, onValueChange: onTabChange } : { defaultValue: "login" };

  return (
    <div className="min-h-screen w-full relative bg-[#fff4f6] text-[#4a2135] font-sans flex flex-col items-center justify-center p-3 sm:p-4 select-none">
      {/* 1. Background Graphic Banner */}
      <div className="absolute top-0 left-0 w-full h-[280px] sm:h-[320px] pointer-events-none overflow-hidden [clip-path:ellipse(110%_100%_at_50%_0%)] bg-[#ff7293]/20 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fff4f6]/50 to-[#fff4f6] z-10" />
        <img
          className="w-full h-full object-cover mix-blend-multiply opacity-80"
          alt=""
          role="presentation"
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* 2. Floating Brand Logo Badge (Floating above card) */}
      <div className="relative z-10 mb-3 shrink-0 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-[20px] px-5 py-1.5 rounded-full border border-white/60 shadow-[0_8px_30px_rgba(74,33,53,0.08)] flex items-center gap-2">
          <span className="text-[#b7004d] font-black tracking-tighter text-base sm:text-lg">
            MSHOPPY <span className="uppercase text-[#ff7293] text-xs font-black">{roleName}</span>
          </span>
        </div>
      </div>

      {/* 3. Authentication Card Container */}
      <div className="relative z-10 w-full max-w-[430px] shrink-0 flex flex-col items-center">
        <Card className="w-full shadow-2xl border-white/60 bg-white/95 backdrop-blur-md rounded-[1.75rem] overflow-hidden">
          <CardHeader className="text-center pt-6 pb-2 px-6 sm:px-7">
            <CardTitle className="text-2xl font-black tracking-tight text-[#4a2135]">
              {title}
            </CardTitle>
            {subtitle && (
              <CardDescription className="text-[#7d4d62] font-medium opacity-80 mt-1 text-xs sm:text-sm">
                {subtitle}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="pb-5 pt-1 px-6 sm:px-7">
            {/* If registerContent provided, show Login / Register Tabs */}
            {registerContent ? (
              <Tabs {...tabsProps} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-3 rounded-full bg-[#ffecf1] p-1 !h-10.5 items-center relative overflow-hidden">
                  <TabsTrigger
                    value="login"
                    className="!h-full rounded-full !py-0 flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer text-[#7d4d62] hover:text-[#b7004d] data-[state=active]:!bg-gradient-to-r data-[state=active]:!from-[#b7004d] data-[state=active]:!to-[#ff7293] data-[state=active]:!text-white data-[state=active]:shadow-sm border-0 focus-visible:ring-0 after:hidden"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="!h-full rounded-full !py-0 flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer text-[#7d4d62] hover:text-[#b7004d] data-[state=active]:!bg-gradient-to-r data-[state=active]:!from-[#b7004d] data-[state=active]:!to-[#ff7293] data-[state=active]:!text-white data-[state=active]:shadow-sm border-0 focus-visible:ring-0 after:hidden"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab Content */}
                <TabsContent value="login" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {loginContent}
                </TabsContent>

                {/* Register Tab Content */}
                <TabsContent value="register" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {registerContent}
                </TabsContent>
              </Tabs>
            ) : (
              loginContent
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
