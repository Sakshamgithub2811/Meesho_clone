import React from 'react';

import{ SidebarProvider, Sidebar, SidebarContent, SidebarGroup,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, 
    SidebarHeader, SidebarRail, SidebarTrigger,SidebarMenuSub,SidebarMenuSubItem,SidebarMenuSubButton 
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronRight } from "lucide-react";

import { LogOut } from "lucide-react";

export default function DashboardLayout({
menuItems = [],
activeTab,
onTabChange, 
roleName = "Portal",
userName = "User",
onLogout, 
children
}) {

    return (
         <SidebarProvider>
          {/* 1. LEFT SIDEBAR */}
         <Sidebar>
          <SidebarHeader className="h-16 flex items-center justify-center border-b">
           <h1 className="text-xl font-black tracking-tight text-[#b7004d]">
             MSHOPPY <span className="text-[#ff7293] text-sm uppercase">{roleName}</span>
           </h1>
        </SidebarHeader> 
          <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="mt-4 gap-2">
              {menuItems.map((item) => {
  // CONDITION 1: Agar Menu ke andar Sub-menu (children) hain
  if (item.children) {
    return (
      <Collapsible key={item.id} defaultOpen={false} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="text-slate-500 hover:bg-pink-50 hover:text-[#b7004d]">
              <item.icon className="h-5 w-5" />
              <span className="font-medium text-[15px]">{item.label}</span>
              {/* Yeh chota arrow hai jo open hone par neche ghoomega */}
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <SidebarMenuSub className="border-l-2 border-pink-300">
              {item.children.map((subItem) => (
                <SidebarMenuSubItem key={subItem.id}>
                  <SidebarMenuSubButton 
                    isActive={activeTab === subItem.id}
                    onClick={() => onTabChange(subItem.id)}
                    className={activeTab === subItem.id ? "text-[#b7004d] font-bold bg-pink-50/50" : "text-slate-500 hover:text-[#b7004d]"}
                  >
                    {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                    <span>{subItem.label}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }
  // CONDITION 2: Agar Normal Single Menu hai
  return (
    <SidebarMenuItem key={item.id}>
      <SidebarMenuButton 
        isActive={activeTab === item.id} 
        onClick={() => onTabChange(item.id)}
        className={activeTab === item.id ? "bg-pink-50 text-[#b7004d]" : "text-slate-500 hover:bg-pink-50 hover:text-[#b7004d]"}
      >
        <item.icon className="h-5 w-5" />
        <span className="font-medium text-[15px]">{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
})}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
         </Sidebar>

         {/* 2. RIGHT MAIN CONTENT */}             
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        
        {/* TOP HEADER */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-[#b7004d]" /> {/* Ye button sidebar ko open/close karega */}
            <h2 className="text-lg font-bold text-gray-800">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <DropdownMenu>
               <DropdownMenuTrigger className="flex items-center gap-3 outline-none cursor-pointer p-1 rounded-full hover:bg-gray-100">
                 <div className="text-right hidden sm:block">
                   <p className="text-sm font-bold text-gray-800 leading-none">{userName}</p>
                   <p className="text-[11px] text-gray-500 mt-1 uppercase font-semibold">{roleName}</p>
                 </div>
                 <Avatar className="h-9 w-9 border border-pink-100">
                   <AvatarFallback className="bg-pink-100 text-[#b7004d] font-bold">
                     {userName.charAt(0).toUpperCase()}
                   </AvatarFallback>
                 </Avatar>
               </DropdownMenuTrigger>              
               <DropdownMenuContent align="end" className="w-48">
                 <DropdownMenuItem onClick={onLogout} className="text-red-600 font-medium cursor-pointer">
                   <LogOut className="mr-2 h-4 w-4" />
                   Logout System
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </header>
         <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
    )
}