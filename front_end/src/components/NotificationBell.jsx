import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { customerApi } from "@/api/backendClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  CreditCard,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { de, ar, enUS, tr as trLocale, es as esLocale, uk as ukLocale } from "date-fns/locale";

const typeIcons = {
  booking_confirmed: CheckCircle,
  booking_cancelled: XCircle,
  booking_reminder: Clock,
  new_booking_request: Calendar,
  payment_received: CreditCard,
  review_received: Star,
  general: Info
};

const typeColors = {
  booking_confirmed: "text-green-500",
  booking_cancelled: "text-red-500",
  booking_reminder: "text-orange-500",
  new_booking_request: "text-blue-500",
  payment_received: "text-green-500",
  review_received: "text-yellow-500",
  general: "text-gray-500"
};

export default function NotificationBell({ user, lang = "de" }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const locales = { de, ar, en: enUS, tr: trLocale, es: esLocale, uk: ukLocale };

  const translations = {
    de: {
      notifications: "Benachrichtigungen",
      no_notifications: "Keine neuen Benachrichtigungen",
      mark_all_read: "Alle als gelesen markieren",
      view_all: "Alle anzeigen"
    },
    ar: {
      notifications: "الإشعارات",
      no_notifications: "لا توجد إشعارات جديدة",
      mark_all_read: "تحديد الكل كمقروء",
      view_all: "عرض الكل"
    },
    en: {
      notifications: "Notifications",
      no_notifications: "No new notifications",
      mark_all_read: "Mark all as read",
      view_all: "View all"
    },
    tr: {
      notifications: "Bildirimler",
      no_notifications: "Yeni bildirim yok",
      mark_all_read: "Tümünü okundu işaretle",
      view_all: "Tümünü göster"
    },
    es: {
      notifications: "Notificaciones",
      no_notifications: "No hay notificaciones nuevas",
      mark_all_read: "Marcar todo como leído",
      view_all: "Ver todo"
    },
    uk: {
      notifications: "Сповіщення",
      no_notifications: "Немає нових сповіщень",
      mark_all_read: "Позначити все як прочитане",
      view_all: "Показати все"
    }
  };

  const t = translations[lang] || translations.de;

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () => customerApi.listNotifications(user.email),
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      await customerApi.markNotificationRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await customerApi.markAllNotificationsRead(user.email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    }
  });

  // Text in the visitor's language; Ukrainian falls back to English, everything else to German
  const pick = (notification, field) =>
    notification[`${field}_${lang}`] ||
    (lang === "uk" ? notification[`${field}_en`] : "") ||
    notification[`${field}_de`] ||
    "";
  const getTitle = (notification) => pick(notification, "title");
  const getMessage = (notification) => pick(notification, "message");

  const handleNotificationClick = (notification, href) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    setOpen(false);
    navigate(href);
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-[#1e3a5f] hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-[#1e3a5f]">{t.notifications}</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => markAllAsReadMutation.mutate()}
            >
              <Check className="w-3 h-3 me-1" />
              {t.mark_all_read}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">{t.no_notifications}</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || Info;
                const colorClass = typeColors[notification.type] || "text-gray-500";
                
                // Build a safe in-app URL from the notification link with robust fallbacks
                const buildHref = (link) => {
                  const PAGE_WHITELIST = new Set([
                    'Home','Services','Booking','Bookings','MyBookings','CustomerDashboard','Profile','Payment','Payments','Notifications','NotificationSettings','CustomerRequests','AdminBookings','AdminServices','ProvidersList','ProviderApprovals','ProviderProfile','BookingReports','PriceAdmin','SEOAdmin','Offers','CustomerService'
                  ]);
                  // Handle direct "Payment?id=xxx" style links from notifications
                  if (link && link.startsWith('Payment')) {
                    const [p, q] = link.split('?');
                    return createPageUrl(p) + (q ? `?${q}` : '');
                  }

                  const SLUG_TO_PAGE = {
                    'home':'Home',
                    'services':'Services',
                    'booking':'Booking',
                    'bookings':'MyBookings',
                    'my-bookings':'MyBookings',
                    'mybookings':'MyBookings',
                    'customer-dashboard':'CustomerDashboard',
                    'customerdashboard':'CustomerDashboard',
                    'profile':'Profile',
                    'payments':'Payments',
                    'notifications':'Notifications',
                    'notification-settings':'NotificationSettings',
                    'customerservice':'CustomerService',
                    'customer-service':'CustomerService'
                  };

                  const DEFAULT_BY_TYPE = {
                    booking_confirmed: 'CustomerDashboard',
                    booking_cancelled: 'CustomerDashboard',
                    booking_reminder: 'CustomerDashboard',
                    new_booking_request: 'CustomerDashboard',
                    payment_received: 'Payments',
                    review_received: 'CustomerDashboard',
                    general: 'Notifications'
                  };

                  const normalizeToPage = (raw) => {
                    if (!raw) return null;
                    // take only the first path segment
                    const first = raw.replace(/^\//,'').split('?')[0].split('/')[0];
                    if (PAGE_WHITELIST.has(first)) return first;
                    const lower = first.toLowerCase();
                    if (SLUG_TO_PAGE[lower]) return SLUG_TO_PAGE[lower];
                    // Handle camelCase direct names (e.g., MyBookings)
                    if (PAGE_WHITELIST.has(first)) return first;
                    return null;
                  };

                  let pageCandidate = null;
                  let queryStr = '';

                  if (link) {
                    try {
                      const url = new URL(link);
                      const p = url.pathname.replace(/^\//,'');
                      const q = url.search?.replace(/^\?/,'');
                      pageCandidate = normalizeToPage(p);
                      queryStr = q ? `?${q}` : '';
                    } catch {
                      const [p, q] = link.replace(/^\//,'').split('?');
                      pageCandidate = normalizeToPage(p);
                      queryStr = q ? `?${q}` : '';
                    }
                  }

                  if (!pageCandidate) {
                    pageCandidate = DEFAULT_BY_TYPE[notification.type] || 'Notifications';
                  }

                  if (!PAGE_WHITELIST.has(pageCandidate)) {
                    pageCandidate = 'Notifications';
                  }

                  return createPageUrl(pageCandidate) + queryStr;
                };
                const notifHref = buildHref(notification.link);

                return (
                  <div
                   key={notification.id}
                   onClick={() => handleNotificationClick(notification, notifHref)}
                    className={`block p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_read ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className={`text-sm font-medium text-[#1e3a5f] ${!notification.is_read ? "font-semibold" : ""}`}>
                          {getTitle(notification)}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {getMessage(notification)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at || notification.created_date), { 
                            addSuffix: true, 
                            locale: locales[lang] || locales.de 
                          })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                );

              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t">
          <Link to={createPageUrl("Notifications")} onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full text-sm">
              {t.view_all}
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
