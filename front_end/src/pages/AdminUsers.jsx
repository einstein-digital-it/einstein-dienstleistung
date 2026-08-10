import React, { useState, useEffect } from "react";
import { usersApi } from "@/api/backendClient";
import { requireStoredUser } from "@/lib/backendAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Search, Loader2, Mail, Calendar, Shield, User, Bell, CheckCheck, Phone, Power, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function AdminUsers() {
  const [lang] = useState(() => localStorage.getItem("einstein_lang") || "ar");
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const check = () => setUser(requireStoredUser({ role: "admin" }));
    check();
  }, []);

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: usersApi.listUsers,
    enabled: !!user
  });

  const { data: notified = [] } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: usersApi.listUserNotifications,
    enabled: !!user
  });

  const notifiedEmails = new Set(notified.map(n => n.user_email));
  const newUsers = users.filter(u => !notifiedEmails.has(u.email));

  const markAllSeenMutation = useMutation({
    mutationFn: async () => {
      return usersApi.markAllSeen(newUsers.map((u) => u.email));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-notifications"] })
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => usersApi.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-users"] })
  });

  const deleteUserMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-all-users"] })
  });

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const labels = {
    de: { title: "Alle Benutzer", search: "Suchen...", total: "Gesamt", admins: "Admins", users_lbl: "Benutzer", joined: "Beigetreten", role: "Rolle", user_col: "Benutzer", email_col: "E-Mail", no_users: "Keine Benutzer gefunden", admin_lbl: "Admin", user_badge: "Benutzer" },
    ar: { title: "كل المستخدمين", search: "بحث...", total: "الإجمالي", admins: "المشرفون", users_lbl: "المستخدمون", joined: "تاريخ التسجيل", role: "الدور", user_col: "المستخدم", email_col: "البريد الإلكتروني", no_users: "لا يوجد مستخدمون", admin_lbl: "مشرف", user_badge: "مستخدم" },
    en: { title: "All Users", search: "Search...", total: "Total", admins: "Admins", users_lbl: "Users", joined: "Joined", role: "Role", user_col: "User", email_col: "Email", no_users: "No users found", admin_lbl: "Admin", user_badge: "User" },
    tr: { title: "Tüm Kullanıcılar", search: "Ara...", total: "Toplam", admins: "Yöneticiler", users_lbl: "Kullanıcılar", joined: "Katılım Tarihi", role: "Rol", user_col: "Kullanıcı", email_col: "E-posta", no_users: "Kullanıcı bulunamadı", admin_lbl: "Yönetici", user_badge: "Kullanıcı" },
    es: { title: "Todos los Usuarios", search: "Buscar...", total: "Total", admins: "Admins", users_lbl: "Usuarios", joined: "Fecha de registro", role: "Rol", user_col: "Usuario", email_col: "Correo", no_users: "No se encontraron usuarios", admin_lbl: "Admin", user_badge: "Usuario" },
  };
  const t = labels[lang] || labels.de;

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B46C1]" />
      </div>
    );
  }

  const totalAdmins = users.filter(u => u.role === "admin").length;
  const totalUsers = users.filter(u => u.role !== "admin").length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <Users className="w-8 h-8 text-[#6B46C1]" />
            {t.title}
            {newUsers.length > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold rounded-full px-2.5 py-0.5">
                {newUsers.length} {lang === "ar" ? "جديد" : lang === "en" ? "new" : "neu"}
              </span>
            )}
          </h1>
          {newUsers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllSeenMutation.mutate()}
              disabled={markAllSeenMutation.isPending}
              className="flex items-center gap-2 text-gray-600"
            >
              <CheckCheck className="w-4 h-4" />
              {lang === "ar" ? "تحديد الكل كمقروء" : lang === "en" ? "Mark all as seen" : "Alle als gesehen markieren"}
            </Button>
          )}
        </div>

        {/* New Users Alert */}
        {newUsers.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 mb-2">
                {lang === "ar" ? `${newUsers.length} مستخدم جديد سجّل مؤخراً` : lang === "en" ? `${newUsers.length} new user(s) registered recently` : `${newUsers.length} neue Benutzer registriert`}
              </p>
              <div className="flex flex-wrap gap-2">
                {newUsers.map(u => (
                  <span key={u.id} className="inline-flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-3 py-1 text-sm text-amber-900">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                      {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className="font-medium">{u.full_name || u.email}</span>
                    <span className="text-amber-500 text-xs">{u.created_date ? format(new Date(u.created_date), "dd.MM.yyyy") : ""}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: t.total, value: users.length, color: "from-[#1e3a5f] to-[#2d5a8a]", icon: Users },
            { label: t.admins, value: totalAdmins, color: "from-[#6B46C1] to-[#805AD5]", icon: Shield },
            { label: t.users_lbl, value: totalUsers, color: "from-emerald-600 to-emerald-500", icon: User },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className={`bg-gradient-to-br ${s.color} text-white border-0 shadow-md`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs">{s.label}</p>
                    <p className="text-3xl font-bold mt-1">{s.value}</p>
                  </div>
                  <s.icon className="w-8 h-8 text-white/30" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t.search}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ps-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" dir="ltr">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-start px-4 py-3 text-sm font-semibold text-gray-600">{t.user_col}</th>
                    <th className="text-start px-4 py-3 text-sm font-semibold text-gray-600">{t.email_col}</th>
                    <th className="text-start px-4 py-3 text-sm font-semibold text-gray-600">{t.role}</th>
                    <th className="text-start px-4 py-3 text-sm font-semibold text-gray-600">{t.joined}</th>
                    <th className="text-start px-4 py-3 text-sm font-semibold text-gray-600">{lang === "ar" ? "الهاتف" : lang === "en" ? "Phone" : "Telefon"}</th>
                    <th className="text-start px-4 py-3 text-sm font-semibold text-gray-600">{lang === "ar" ? "تواصل" : lang === "en" ? "Contact" : "Kontakt"}</th>
                    <th className="text-start px-4 py-3 text-sm font-semibold text-gray-600">Manage</th>
                    </tr>
                    </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#6B46C1]/10 flex items-center justify-center text-[#6B46C1] font-bold text-sm flex-shrink-0">
                            {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-[#1e3a5f]">{u.full_name || "-"}</span>
                          {!notifiedEmails.has(u.email) && (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                              {lang === "ar" ? "جديد" : lang === "en" ? "New" : "Neu"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"}>
                          {u.role === "admin" ? t.admin_lbl : t.user_badge}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {u.created_date ? format(new Date(u.created_date), "dd.MM.yyyy") : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {u.phone ? (
                          <a href={`tel:${u.phone}`} className="flex items-center gap-1 hover:text-[#6B46C1]">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {u.phone}
                          </a>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${u.email}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-[#6B46C1]/30 text-[#6B46C1] hover:bg-purple-50 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {lang === "ar" ? "إيميل" : lang === "en" ? "Email" : "E-Mail"}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Select
                            value={u.role || "user"}
                            onValueChange={(role) => updateUserMutation.mutate({ id: u.id, data: { role } })}
                            disabled={updateUserMutation.isPending}
                          >
                            <SelectTrigger className="h-8 w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="provider">Provider</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateUserMutation.mutate({ id: u.id, data: { is_active: !u.is_active } })}
                            disabled={updateUserMutation.isPending}
                            title={u.is_active ? "Deactivate" : "Activate"}
                          >
                            <Power className={`w-4 h-4 ${u.is_active ? "text-green-600" : "text-gray-400"}`} />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              if (window.confirm("Delete this user?")) deleteUserMutation.mutate(u.id);
                            }}
                            disabled={deleteUserMutation.isPending}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                      </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>{t.no_users}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
