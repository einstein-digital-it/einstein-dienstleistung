/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminBookings from './pages/AdminBookings';
import AdminUsers from './pages/AdminUsers';
import AdminServices from './pages/AdminServices';
import Administration from './pages/Administration';
import Booking from './pages/Booking';
import BookingReports from './pages/BookingReports';
import Bookings from './pages/Bookings';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerRequests from './pages/CustomerRequests';
import CustomerService from './pages/CustomerService';
import Dashboard from './pages/Dashboard';
import EarningsReports from './pages/EarningsReports';
import Home from './pages/Home';
import MyBookings from './pages/MyBookings';
import NotificationSettings from './pages/NotificationSettings';
import Notifications from './pages/Notifications';
import Offers from './pages/Offers';
import Payment from './pages/Payment';
import Payments from './pages/Payments';
import PriceAdmin from './pages/PriceAdmin';
import PricingPage from './pages/PricingPage';
import Profile from './pages/Profile';
import ProviderApplication from './pages/ProviderApplication';
import ProviderApprovals from './pages/ProviderApprovals';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderProfile from './pages/ProviderProfile';
import Providers from './pages/Providers';
import ProvidersList from './pages/ProvidersList';
import Reports from './pages/Reports';
import RevenueReports from './pages/RevenueReports';
import SEO from './pages/SEO';
import SEOAdmin from './pages/SEOAdmin';
import Services from './pages/Services';
import ServiceManagementPage from './pages/ServiceManagementPage';
import ServiceProviderPage from './pages/ServiceProviderPage';
import SupplierRequests from './pages/SupplierRequests';
import Users from './pages/Users';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminBookings": AdminBookings,
    "AdminUsers": AdminUsers,
    "AdminServices": AdminServices,
    "Administration": Administration,
    "Booking": Booking,
    "BookingReports": BookingReports,
    "Bookings": Bookings,
    "CustomerDashboard": CustomerDashboard,
    "CustomerRequests": CustomerRequests,
    "CustomerService": CustomerService,
    "Dashboard": Dashboard,
    "EarningsReports": EarningsReports,
    "Home": Home,
    "MyBookings": MyBookings,
    "NotificationSettings": NotificationSettings,
    "Notifications": Notifications,
    "Offers": Offers,
    "Payment": Payment,
    "Payments": Payments,
    "PriceAdmin": PriceAdmin,
    "PricingPage": PricingPage,
    "Profile": Profile,
    "ProviderApplication": ProviderApplication,
    "ProviderApprovals": ProviderApprovals,
    "ProviderDashboard": ProviderDashboard,
    "ProviderProfile": ProviderProfile,
    "Providers": Providers,
    "ProvidersList": ProvidersList,
    "Reports": Reports,
    "RevenueReports": RevenueReports,
    "SEO": SEO,
    "SEOAdmin": SEOAdmin,
    "Services": Services,
    "ServiceManagementPage": ServiceManagementPage,
    "ServiceProviderPage": ServiceProviderPage,
    "SupplierRequests": SupplierRequests,
    "Users": Users,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
