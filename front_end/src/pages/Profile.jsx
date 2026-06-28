import React from "react";
import {
  Bell,
  Camera,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  User
} from "lucide-react";
import {
  CardHeader,
  DesignCard,
  FieldPreview,
  PageScaffold,
  PrimaryButton,
  QuickLink,
  SecondaryButton,
  StatusPill
} from "@/components/design/PageScaffold";

export default function Profile() {
  return (
    <PageScaffold
      title="ملفي الشخصي"
      eyebrow="حساب المستخدم"
      icon={User}
      description="تصميم صفحة الملف الشخصي للحساب التجريبي، مع بيانات شخصية وإعدادات إشعارات وأمان."
      actions={
        <>
          <SecondaryButton>إلغاء</SecondaryButton>
          <PrimaryButton>حفظ التصميم</PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <DesignCard className="h-fit p-6 text-center">
          <div className="relative mx-auto h-28 w-28">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#122238] text-4xl font-black text-white">
              A.A
            </div>
            <button type="button" className="absolute bottom-0 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af25] text-white shadow-lg">
              <Camera className="h-5 w-5" />
            </button>
          </div>
          <h2 className="mt-5 text-2xl font-black text-[#13233a]">A.A</h2>
          <p className="mt-1 text-sm font-semibold text-[#65758b]">admin@example.com</p>
          <div className="mt-4 flex justify-center">
            <StatusPill tone="purple">مدير النظام</StatusPill>
          </div>
          <div className="mt-6 grid gap-3 text-start">
            <QuickLink icon={Bell} title="الإشعارات" description="البريد والتنبيهات داخل التطبيق." />
            <QuickLink icon={Shield} title="الأمان" description="كلمة المرور وجلسات الدخول." />
            <QuickLink icon={Globe} title="اللغة" description="العربية هي اللغة الحالية." />
          </div>
        </DesignCard>

        <div className="space-y-6">
          <DesignCard>
            <CardHeader title="المعلومات الشخصية" description="حقول تصميمية جاهزة لربطها لاحقاً بالمصادقة الحقيقية." />
            <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
              <FieldPreview label="الاسم الكامل" value="A.A" />
              <FieldPreview label="البريد الإلكتروني" value="admin@example.com" />
              <FieldPreview label="رقم الهاتف" value="01573 1770487" />
              <FieldPreview label="العنوان" value="Frankfurt, Deutschland" />
            </div>
          </DesignCard>

          <DesignCard>
            <CardHeader title="إعدادات الحساب" />
            <div className="divide-y divide-[#e5edf7]">
              {[
                [Mail, "إشعارات البريد الإلكتروني", "تلقي تحديثات الحجز والدفع عبر البريد.", true],
                [Bell, "إشعارات التطبيق", "إظهار التنبيهات في شريط الحساب.", true],
                [Lock, "تغيير كلمة المرور", "تصميم لمسار الأمان لاحقاً.", false],
                [MapPin, "العنوان الافتراضي", "استخدام العنوان المحفوظ للحجوزات الجديدة.", true],
                [Phone, "تأكيد رقم الهاتف", "عرض حالة رقم الهاتف في الحساب.", true]
              ].map(([Icon, title, desc, active]) => (
                <div key={title} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#e8f0fd] text-[#1e3a5f]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[#13233a]">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#65758b]">{desc}</p>
                    </div>
                  </div>
                  <span className={`h-7 w-12 rounded-full p-1 ${active ? "bg-[#122238]" : "bg-[#d9e4f2]"}`}>
                    <span className={`block h-5 w-5 rounded-full bg-white transition ${active ? "translate-x-0" : "-translate-x-5"}`} />
                  </span>
                </div>
              ))}
            </div>
          </DesignCard>
        </div>
      </div>
    </PageScaffold>
  );
}
