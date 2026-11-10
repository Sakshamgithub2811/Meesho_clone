import React from 'react';

import { 
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, 
  SidebarHeader, SidebarRail, SidebarTrigger, SidebarMenuSub,
  SidebarMenuSubItem, SidebarMenuSubButton, useSidebar 
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronRight, Lock, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { getDropshipperKycState } from "../../services/dropshipperService";

function DashboardLayoutContent({
  menuItems = [],
  activeTab,
  onTabChange, 
  roleName = "Portal",
  userName = "User",
  pageTitle,
  pageSubtitle,
  onLogout, 
  children
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const safeUserName =
    typeof userName === 'string' && userName.trim()
      ? userName.trim()
      : typeof userName === 'object' && userName?.name
      ? String(userName.name)
      : 'User';
  const initialLetter = safeUserName.charAt(0).toUpperCase() || 'U';
  const safeRoleName = typeof roleName === 'string' ? roleName : 'PORTAL';
  const isDropshipperRole = safeRoleName.toLowerCase().includes('dropship');
  const { isKycApproved } = isDropshipperRole ? getDropshipperKycState() : { isKycApproved: true };

  const displayedMenuItems = React.useMemo(() => {
    if (!isDropshipperRole) return safeMenuItems;
    return safeMenuItems.filter((item) => {
      // If KYC is approved, remove 4-Step KYC Verification from sidebar
      if (item.id === 'kyc' && isKycApproved) return false;
      // If KYC is NOT approved, hide View Profile
      if (item.id === 'view-profile' && !isKycApproved) return false;
      return true;
    });
  }, [safeMenuItems, isDropshipperRole, isKycApproved]);

  const handleMenuClick = (itemOrSub) => {
    if (isMobile) {
      setOpenMobile(false);
    }
    if (isDropshipperRole && itemOrSub.requiresKyc && !isKycApproved) {
      toast.warning('4-Step KYC Verification Required', {
        description: `"${itemOrSub.label}" is locked. Complete business & bank verification to unlock full access.`,
        action: {
          label: 'Start KYC',
          onClick: () => {
            if (onTabChange) onTabChange('kyc');
          }
        }
      });
      return;
    }
    if (onTabChange) {
      onTabChange(itemOrSub.id);
    }
  };

  return (
    <>
      {/* 1. LEFT SIDEBAR */}
      <Sidebar>
        <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
          <h1 className="text-xl font-black tracking-tight text-[#b7004d] truncate">
            MSHOPPY <span className="text-[#ff7293] text-sm uppercase">{safeRoleName}</span>
          </h1>
        </SidebarHeader> 
        <SidebarContent className="px-2 py-2">
          <SidebarGroup className="p-0">
            <SidebarMenu className="gap-1.5">
              {displayedMenuItems.map((item) => {
                // CONDITION 1: Agar Menu ke andar Sub-menu (children) hain
                if (item.children && Array.isArray(item.children)) {
                  const hasActiveChild = item.children.some(c => c.id === activeTab);
                  return (
                    <Collapsible key={item.id} defaultOpen={hasActiveChild} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-pink-50 hover:text-[#b7004d] transition-colors cursor-pointer ${
                              hasActiveChild ? "text-[#b7004d] font-bold bg-pink-50/40" : ""
                            }`}
                          >
                            {item.icon && <item.icon className="h-4.5 w-4.5 shrink-0 text-slate-500 group-hover:text-[#b7004d]" />}
                            <span className="flex-1 min-w-0 truncate text-[14px] font-medium text-left leading-normal" title={item.label}>
                              {item.label}
                            </span>
                            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-slate-400" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <SidebarMenuSub className="border-l-2 border-pink-200 ml-4 mr-1 pl-2 pr-1 py-1 space-y-1">
                            {item.children.map((subItem) => {
                              const isLocked = isDropshipperRole && subItem.requiresKyc && !isKycApproved;
                              const isActive = activeTab === subItem.id;
                              return (
                                <SidebarMenuSubItem key={subItem.id}>
                                  <SidebarMenuSubButton 
                                    isActive={isActive}
                                    onClick={() => handleMenuClick(subItem)}
                                    className={`min-h-[36px] h-auto w-full py-1.5 px-2.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                                      isActive 
                                        ? "text-[#b7004d] font-bold bg-pink-50 shadow-2xs" 
                                        : "text-slate-600 hover:text-[#b7004d] hover:bg-pink-50/70"
                                    } ${isLocked ? "opacity-85" : ""}`}
                                  >
                                    {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0 text-slate-400" />}
                                    <span 
                                      className="flex-1 min-w-0 truncate text-[13px] font-medium text-left leading-snug" 
                                      title={subItem.label}
                                    >
                                      {subItem.label}
                                    </span>
                                    {isLocked && (
                                      <span className="shrink-0 ml-auto inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/90 px-1.5 py-0.5 rounded-full shadow-2xs">
                                        <Lock className="h-2.5 w-2.5 shrink-0 text-amber-600" />
                                        <span>KYC</span>
                                      </span>
                                    )}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                // CONDITION 2: Agar Normal Single Menu hai
                const isSingleLocked = isDropshipperRole && item.requiresKyc && !isKycApproved;
                const isSingleActive = activeTab === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      isActive={isSingleActive} 
                      onClick={() => handleMenuClick(item)}
                      className={`min-h-[40px] h-auto w-full px-3 py-2 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                        isSingleActive 
                          ? "bg-pink-50 text-[#b7004d] font-bold shadow-2xs" 
                          : "text-slate-600 hover:bg-pink-50 hover:text-[#b7004d]"
                      } ${isSingleLocked ? "opacity-85" : ""}`}
                    >
                      {item.icon && <item.icon className="h-4.5 w-4.5 shrink-0" />}
                      <span className="flex-1 min-w-0 truncate text-[14px] font-medium text-left leading-normal" title={item.label}>
                        {item.label}
                      </span>
                      {isSingleLocked ? (
                        <span className="shrink-0 ml-auto inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/90 px-1.5 py-0.5 rounded-full shadow-2xs">
                          <Lock className="h-2.5 w-2.5 shrink-0 text-amber-600" />
                          <span>KYC</span>
                        </span>
                      ) : item.badge && (
                        <span className={`shrink-0 ml-auto text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${item.badgeClass || 'bg-[#b7004d] text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      {/* 2. RIGHT MAIN CONTENT */}             
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full h-screen max-h-screen overflow-hidden bg-gray-50/50">
        
        {/* TOP HEADER */}

        <header className="min-h-16 border-b bg-white flex items-center justify-between px-3 sm:px-6 py-2.5 sticky top-0 shrink-0 z-30 shadow-xs gap-2 sm:gap-3 w-full max-w-full min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
            <SidebarTrigger className="text-[#b7004d] shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-bold text-gray-800 leading-tight truncate">

                {pageTitle || (safeMenuItems.find(m => m.id === activeTab)?.label || 
                     safeMenuItems.flatMap(m => m.children || []).find(c => c.id === activeTab)?.label || 
                     'Dashboard')
                }
              </h2>
              {pageSubtitle && (

                <p className="text-[11px] sm:text-xs text-gray-500 truncate line-clamp-1 sm:line-clamp-none">{pageSubtitle}</p>

              )}
            </div>
          </div>
          

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 outline-none cursor-pointer p-1 rounded-full hover:bg-gray-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 leading-none">{safeUserName}</p>
                  <p className="text-[11px] text-gray-500 mt-1 uppercase font-semibold">{safeRoleName}</p>
                </div>
                <Avatar className="h-9 w-9 border border-pink-100">
                  <AvatarFallback className="bg-pink-100 text-[#b7004d] font-bold">
                    {initialLetter}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>              
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => onTabChange && onTabChange('profile')} 
                  className="font-medium cursor-pointer hover:bg-pink-50"
                >
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="text-red-600 font-medium cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-2.5 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden min-w-0 w-full max-w-full">

          {children}
        </main>
      </div>
    </>
  );
}

export default function DashboardLayout(props) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "17.5rem" }}>
      <DashboardLayoutContent {...props} />
    </SidebarProvider>
  );
}