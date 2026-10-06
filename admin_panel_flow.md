# MShoppy Admin Panel Flow & Access

Here is the flow diagram illustrating the structure of the Admin Panel, including the access points, features, and capabilities it provides to administrators. 

### Access Control
- **Login Requirements**: Admin access requires a specific login via the `/admin/login` route.
- **Credentials**: Uses an email/password combination (e.g. `admin@mshoppy.com` / `admin123` for testing). 
- **Role Validation**: Assigns a generic `ADMIN` role on login, securely stored in local storage and the Redux store (`meesho_admin_token`, `meesho_admin_session`, `admin_user`). All sub-routes require this authentication state.

### Admin Panel Architecture Diagram

```mermaid
flowchart TD
    %% Core Authentication & Entry
    Entry([Admin Panel Request]) --> IsAuth{Authenticated \n as ADMIN?}
    
    IsAuth -- No --> Login[Admin Login Page]
    Login --> AuthSubmit[Submit Credentials]
    AuthSubmit --> |Valid| Redux[Store 'ADMIN' Role in Redux & LocalStorage]
    Redux --> Dashboard
    AuthSubmit --> |Invalid| Login
    
    IsAuth -- Yes --> Dashboard[Admin Web Dashboard / Overview]
    
    %% Main Modules
    Dashboard --> KYC[KYC Verifications Hub]
    Dashboard --> Products[Product & Catalog Management]
    Dashboard --> Orders[Orders Management]
    Dashboard --> Logistics[Returns, Refunds & SPF]
    Dashboard --> Users[User & Seller Management]
    Dashboard --> Analytics[Performance & Earnings]
    Dashboard --> Configuration[System Configuration]
    Dashboard --> Support[Admin Support Desk]
    
    %% KYC Sub-modules
    KYC --> DropshipperKYC[Dropshipper KYC Audit]
    KYC --> AffiliateKYC[Affiliate KYC Approval]
    
    %% Logistics Sub-modules
    Logistics --> RefundSettlement[Return & Refund Settlement]
    Logistics --> SPFClaims[Supplier SPF Dispute Claims]
    
    %% User Management Sub-modules
    Users --> EndUsers[End User Profiles]
    Users --> VerifiedSellers[Verified Seller Dashboard]
    
    %% Analytics
    Analytics --> PlatformGrowth[Platform Growth & GMV Charts]
    Analytics --> SystemHealth[System Health & Server Uptime]
    
    %% Configuration Sub-modules
    Configuration --> Campaigns[Campaign Creation Flow]
    Configuration --> ROTRules[ROT Business Rules Configurator]
    
    %% Styling
    classDef main fill:#b90041,color:#fff,stroke:#fff,stroke-width:2px;
    classDef sub fill:#f8f9fb,color:#191c1e,stroke:#b90041,stroke-width:1px;
    classDef alert fill:#ffecf1,color:#b7004d,stroke:#b7004d,stroke-width:1px;
    
    class Dashboard,Login main;
    class KYC,Products,Orders,Logistics,Users,Analytics,Configuration,Support sub;
    class DropshipperKYC,AffiliateKYC,RefundSettlement,SPFClaims,PlatformGrowth,SystemHealth,Campaigns,ROTRules alert;
```
