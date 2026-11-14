import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs as TabsPrimitive } from "radix-ui";

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
    <div className="min-h-screen w-full relative bg-[#fff4f6] text-[#4a2135] font-sans flex flex-col items-center p-3 sm:p-4 select-none">
      {/* 1. Background Graphic Banner */}
      <div className="absolute top-0 left-0 w-full h-[260px] sm:h-[300px] pointer-events-none overflow-hidden [clip-path:ellipse(110%_100%_at_50%_0%)] bg-[#ff7293]/20 z-0">
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

      {/* Main Centered Container with safe margins (never clipped at top, centered on tall screens) */}
      <div className="relative z-10 w-full max-w-[420px] my-auto py-2 flex flex-col items-center">
        {/* 2. Floating Brand Logo Badge (Floating safely above card) */}
        <div className="mb-2.5 shrink-0 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-[20px] px-4 py-1.5 rounded-full border border-white/80 shadow-[0_4px_20px_rgba(74,33,53,0.08)] flex items-center gap-1.5">
            <span className="text-[#b7004d] font-black tracking-tight text-sm sm:text-base">
              MSHOPPY <span className="uppercase text-[#ff7293] text-[11px] font-black">{roleName}</span>
            </span>
          </div>
        </div>

        {/* 3. Authentication Card Container */}
        <Card className="w-full shadow-2xl border-white/60 bg-white/95 backdrop-blur-md rounded-[1.5rem] overflow-hidden">
          <CardHeader className="text-center pt-5 pb-2 px-6 sm:px-7">
            <CardTitle className="text-xl sm:text-2xl font-black tracking-tight text-[#4a2135]">
              {title}
            </CardTitle>
            {subtitle && (
              <CardDescription className="text-[#7d4d62] font-medium opacity-80 mt-0.5 text-xs sm:text-sm">
                {subtitle}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="pb-5 pt-1 px-6 sm:px-7">
            {/* If registerContent provided, show Login / Register Tabs */}
            {registerContent ? (
              <TabsPrimitive.Root {...tabsProps} className="w-full">
                <TabsPrimitive.List className="w-full h-10.5 bg-[#ffecf1] p-1 rounded-full grid grid-cols-2 gap-1 mb-3 relative box-border">
                  <TabsPrimitive.Trigger
                    value="login"
                    className="h-full rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer text-[#7d4d62] hover:text-[#b7004d] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#b7004d] data-[state=active]:to-[#ff7293] data-[state=active]:text-white data-[state=active]:shadow-xs focus:outline-none select-none border-0 py-0"
                  >
                    Login
                  </TabsPrimitive.Trigger>
                  <TabsPrimitive.Trigger
                    value="register"
                    className="h-full rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer text-[#7d4d62] hover:text-[#b7004d] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#b7004d] data-[state=active]:to-[#ff7293] data-[state=active]:text-white data-[state=active]:shadow-xs focus:outline-none select-none border-0 py-0"
                  >
                    Register
                  </TabsPrimitive.Trigger>
                </TabsPrimitive.List>

                {/* Login Tab Content */}
                <TabsPrimitive.Content value="login" className="mt-0 focus:outline-none">
                  {loginContent}
                </TabsPrimitive.Content>

                {/* Register Tab Content */}
                <TabsPrimitive.Content value="register" className="mt-0 focus:outline-none">
                  {registerContent}
                </TabsPrimitive.Content>
              </TabsPrimitive.Root>
            ) : (
              loginContent
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
