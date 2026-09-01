import React, { useEffect, useState } from "react";
import { profileApi, uploadApi } from "@/api/backendClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const authUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("einstein_auth_user") || "null");
    } catch {
      return null;
    }
  })();
  const email = authUser?.email || localStorage.getItem("einstein_customer_email") || "customer@example.com";
  const [notice, setNotice] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    preferred_language: "ar",
    avatar_url: ""
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", email],
    queryFn: () => profileApi.getProfile(email),
  });

  useEffect(() => {
    if (!profile) return;
    setFormData({
      full_name: profile.full_name || profile.name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      preferred_language: profile.preferred_language || "ar",
      avatar_url: profile.avatar_url || ""
    });
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data) => profileApi.updateProfile({ email, ...data }),
    onSuccess: (updatedProfile) => {
      localStorage.setItem("einstein_customer_email", updatedProfile.email);
      localStorage.setItem("einstein_auth_user", JSON.stringify(updatedProfile));
      queryClient.setQueryData(["profile", email], updatedProfile);
      setNotice("Profile saved successfully.");
    },
    onError: (error) => setNotice(error.message || "Profile could not be saved."),
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => uploadApi.uploadFiles([file]),
    onSuccess: (uploaded) => {
      const avatarUrl = uploaded.files?.[0]?.url;
      if (avatarUrl) {
        setFormData((current) => ({ ...current, avatar_url: avatarUrl }));
      }
    },
    onError: (error) => setNotice(error.message || "Image upload failed."),
  });

  const displayName = profile?.full_name || profile?.name || "A.A";
  const currentName = formData.full_name || displayName;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AA";

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
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt={currentName} className="h-full w-full rounded-full object-cover" />
              ) : initials}
            </div>
            <label className="absolute bottom-0 left-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#d4af25] text-white shadow-lg">
              <Camera className="h-5 w-5" />
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadMutation.mutate(file);
                }}
              />
            </label>
          </div>
          <h2 className="mt-5 text-2xl font-black text-[#13233a]">{currentName}</h2>
          <p className="mt-1 text-sm font-semibold text-[#65758b]">{profile?.email || email}</p>
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
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[#13233a]">
                Full name
                <input
                  value={formData.full_name}
                  onChange={(event) => setFormData((current) => ({ ...current, full_name: event.target.value }))}
                  className="h-12 rounded-xl border border-[#d8e3f1] bg-white px-4 font-semibold outline-none focus:border-[#1e3a5f]"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#13233a]">
                Phone
                <input
                  value={formData.phone}
                  onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                  className="h-12 rounded-xl border border-[#d8e3f1] bg-white px-4 font-semibold outline-none focus:border-[#1e3a5f]"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#13233a] md:col-span-2">
                Address
                <input
                  value={formData.address}
                  onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))}
                  className="h-12 rounded-xl border border-[#d8e3f1] bg-white px-4 font-semibold outline-none focus:border-[#1e3a5f]"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#13233a]">
                Language
                <select
                  value={formData.preferred_language}
                  onChange={(event) => setFormData((current) => ({ ...current, preferred_language: event.target.value }))}
                  className="h-12 rounded-xl border border-[#d8e3f1] bg-white px-4 font-semibold outline-none focus:border-[#1e3a5f]"
                >
                  <option value="ar">Arabic</option>
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                </select>
              </label>
              <div className="flex items-end gap-3">
                <PrimaryButton
                  type="button"
                  onClick={() => updateMutation.mutate(formData)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </PrimaryButton>
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    if (!profile) return;
                    setFormData({
                      full_name: profile.full_name || profile.name || "",
                      phone: profile.phone || "",
                      address: profile.address || "",
                      preferred_language: profile.preferred_language || "ar",
                      avatar_url: profile.avatar_url || ""
                    });
                    setNotice("");
                  }}
                >
                  Reset
                </SecondaryButton>
              </div>
              {notice && <p className="text-sm font-bold text-[#1e3a5f] md:col-span-2">{notice}</p>}
            </div>
            <CardHeader title="المعلومات الشخصية" description="حقول تصميمية جاهزة لربطها لاحقاً بالمصادقة الحقيقية." />
            <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
              <FieldPreview label="الاسم الكامل" value={displayName} />
              <FieldPreview label="البريد الإلكتروني" value={profile?.email || email} />
              <FieldPreview label="رقم الهاتف" value={profile?.phone || "-"} />
              <FieldPreview label="العنوان" value={profile?.address || "-"} />
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
