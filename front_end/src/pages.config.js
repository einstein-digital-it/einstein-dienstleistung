// Page routing: every page here is served at /<Key> (see App.jsx).
// mainPage is the landing page.
import AGB from './pages/AGB';
import AdminBookings from './pages/AdminBookings';
import AdminUsers from './pages/AdminUsers';
import AdminServices from './pages/AdminServices';
import Administration from './pages/Administration';
import Booking from './pages/Booking';
import Cancellation from './pages/Cancellation';
import BookingReports from './pages/BookingReports';
import Bookings from './pages/Bookings';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerRequests from './pages/CustomerRequests';
import CustomerService from './pages/CustomerService';
import ClientWorkspace from './pages/ClientWorkspace';
import Dashboard from './pages/Dashboard';
import Datenschutz from './pages/Datenschutz';
import EarningsReports from './pages/EarningsReports';
import Home from './pages/Home';
import Impressum from './pages/Impressum';
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
    "AGB": AGB,
    "AdminBookings": AdminBookings,
    "AdminUsers": AdminUsers,
    "AdminServices": AdminServices,
    "Administration": Administration,
    "Booking": Booking,
    "Cancellation": Cancellation,
    "BookingReports": BookingReports,
    "Bookings": Bookings,
    "CustomerDashboard": CustomerDashboard,
    "CustomerRequests": CustomerRequests,
    "CustomerService": CustomerService,
    "ClientWorkspace": ClientWorkspace,
    "Dashboard": Dashboard,
    "Datenschutz": Datenschutz,
    "EarningsReports": EarningsReports,
    "Home": Home,
    "Impressum": Impressum,
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
