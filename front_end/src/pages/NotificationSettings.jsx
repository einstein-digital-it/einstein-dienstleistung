import React, { useState, useEffect } from "react";
import { customerApi } from "@/api/backendClient";
import { getStoredAuthUser } from "@/lib/backendAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const translations = {
  de: {
    title: "Benachrichtigungseinstellungen",
    description: "Verwalten Sie Ihre Benachrichtigungseinstellungen",
    bookingConfirmed: "Buchungsbestätigung",
    bookingChanged: "Buchungsänderung",
    bookingCancelled: "Buchungsstornierung",
    appointmentReminder: "Terminberinnerung",
    providerDocuments: "Anbieter-Dokumentupload",
    paymentDue: "Zahlungsfälligkeitserinnerung",
    paymentReceived: "Zahlungsbestätigung",
    reviewRequest: "Bewertungsanfrage",
    emailNotifications: "E-Mail-Benachrichtigungen",
    inAppNotifications: "In-App-Benachrichtigungen",
    notificationLanguage: "Benachrichtigungssprache",
    reminderTiming: "Erinnerungszeit vor Termin",
    saved: "Einstellungen gespeichert!",
    saving: "Speichern...",
    save: "Speichern",
    enable: "Aktivieren",
    disable: "Deaktivieren"
  },
  ar: {
    title: "إعدادات الإشعارات",
    description: "إدارة إعدادات الإشعارات الخاصة بك",
    bookingConfirmed: "تأكيد الحجز",
    bookingChanged: "تغيير الحجز",
    bookingCancelled: "إلغاء الحجز",
    appointmentReminder: "تذكير الموعد",
    providerDocuments: "تحميل وثائق المزود",
    paymentDue: "تذكير استحقاق الدفع",
    paymentReceived: "تأكيد الدفع",
    reviewRequest: "طلب التقييم",
    emailNotifications: "إشعارات البريد الإلكتروني",
    inAppNotifications: "الإشعارات داخل التطبيق",
    notificationLanguage: "لغة الإشعارات",
    reminderTiming: "توقيت التذكيرات",
    saved: "تم حفظ الإعدادات!",
    saving: "جاري الحفظ...",
    save: "حفظ",
    enable: "تفعيل",
    disable: "تعطيل"
  },
  en: {
    title: "Notification Settings",
    description: "Manage your notification preferences",
    bookingConfirmed: "Booking Confirmation",
    bookingChanged: "Booking Changed",
    bookingCancelled: "Booking Cancelled",
    appointmentReminder: "Appointment Reminder",
    providerDocuments: "Provider Documents Upload",
    paymentDue: "Payment Due Reminder",
    paymentReceived: "Payment Confirmation",
    reviewRequest: "Review Request",
    emailNotifications: "Email Notifications",
    inAppNotifications: "In-App Notifications",
    notificationLanguage: "Notification Language",
    reminderTiming: "Reminder Timing",
    saved: "Settings saved!",
    saving: "Saving...",
    save: "Save",
    enable: "Enable",
    disable: "Disable"
  }
};

export default function NotificationSettings() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState("de");
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const t = translations[lang];

  useEffect(() => {
    const init = async () => {
      try {
        const savedLang = localStorage.getItem("einstein_lang") || "de";
        setLang(savedLang);
        const userData = getStoredAuthUser();
        const email = userData?.email || localStorage.getItem("einstein_customer_email") || "customer@example.com";
        localStorage.setItem("einstein_customer_email", email);
        setUser(userData || { email });
      } catch (e) {
        console.log("Error loading user");
      }
    };
    init();
  }, []);

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notificationPreferences", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      return customerApi.getNotificationPreferences(user.email);
    },
    enabled: !!user?.email
  });

  const [formData, setFormData] = useState(preferences || {});

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await customerApi.updateNotificationPreferences({
        ...data,
        user_email: user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    await updateMutation.mutate(formData);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B46C1]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.description}</p>
        </div>

        {saved && (
          <Alert className="mb-6 bg-green-50 border-green-300">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{t.saved}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Booking Status Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">حالة الحجز / Booking Status</CardTitle>
              <CardDescription>إشعارات تحديثات حالة الحجز</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">{t.bookingConfirmed}</Label>
                <Switch
                  checked={formData?.booking_confirmed !== false}
                  onCheckedChange={() => handleToggle("booking_confirmed")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">{t.bookingChanged}</Label>
                <Switch
                  checked={formData?.booking_changed !== false}
                  onCheckedChange={() => handleToggle("booking_changed")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">{t.bookingCancelled}</Label>
                <Switch
                  checked={formData?.booking_cancelled !== false}
                  onCheckedChange={() => handleToggle("booking_cancelled")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reminders & Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">التذكيرات والتنبيهات / Reminders</CardTitle>
              <CardDescription>تذكيرات المواعيد والدفع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">{t.appointmentReminder}</Label>
                <Switch
                  checked={formData?.appointment_reminder !== false}
                  onCheckedChange={() => handleToggle("appointment_reminder")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">{t.paymentDue}</Label>
                <Switch
                  checked={formData?.payment_due_reminder !== false}
                  onCheckedChange={() => handleToggle("payment_due_reminder")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">{t.paymentReceived}</Label>
                <Switch
                  checked={formData?.payment_received !== false}
                  onCheckedChange={() => handleToggle("payment_received")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Provider & Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المزود والوثائق / Provider</CardTitle>
              <CardDescription>إشعارات تحديثات المزود والوثائق</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">{t.providerDocuments}</Label>
                <Switch
                  checked={formData?.provider_documents_uploaded !== false}
                  onCheckedChange={() => handleToggle("provider_documents_uploaded")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">{t.reviewRequest}</Label>
                <Switch
                  checked={formData?.review_request !== false}
                  onCheckedChange={() => handleToggle("review_request")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">قنوات الإشعارات / Channels</CardTitle>
              <CardDescription>اختر كيفية استقبال الإشعارات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">{t.emailNotifications}</Label>
                <Switch
                  checked={formData?.email_notifications !== false}
                  onCheckedChange={() => handleToggle("email_notifications")}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label className="cursor-pointer">{t.inAppNotifications}</Label>
                <Switch
                  checked={formData?.in_app_notifications !== false}
                  onCheckedChange={() => handleToggle("in_app_notifications")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Setting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.notificationLanguage}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData?.notification_language || lang}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  notification_language: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="tr">🇹🇷 Turkçe</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full bg-[#6B46C1] hover:bg-[#805AD5] text-white py-6 text-lg font-semibold"
          >
            {updateMutation.isPending ? t.saving : t.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
