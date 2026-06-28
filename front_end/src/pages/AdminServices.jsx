import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Euro,
  FileText,
  Globe,
  MoreHorizontal,
  Plus,
  Printer,
  Search,
  Settings,
  SlidersHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminServicesApi } from "@/api/backendClient";
import { staticServices } from "@/lib/staticAdminData";

const categoryMeta = {
  office: { label: "Buero", icon: Briefcase, color: "bg-violet-50 text-violet-700 border-violet-200" },
  forms: { label: "Formulare", icon: ClipboardList, color: "bg-teal-50 text-teal-700 border-teal-200" },
  admin: { label: "Administration", icon: FileText, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  coordination: { label: "Koordination", icon: Settings, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  mercosur: { label: "MERCOSUR", icon: Globe, color: "bg-amber-50 text-amber-700 border-amber-200" },
  tutoring: { label: "Nachhilfe", icon: BookOpen, color: "bg-blue-50 text-blue-700 border-blue-200" },
  print: { label: "Druck", icon: Printer, color: "bg-pink-50 text-pink-700 border-pink-200" }
};

export default function AdminServices() {
  const [search, setSearch] = useState("");
  const { data: backendServices = [] } = useQuery({
    queryKey: ["admin-services"],
    queryFn: adminServicesApi.listServices,
  });
  const services = backendServices.length > 0 ? backendServices : staticServices;

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return services;
    return services.filter((service) =>
      [service.name, service.category, service.description].join(" ").toLowerCase().includes(term)
    );
  }, [search, services]);

  const activeCount = services.filter((service) => service.status === "active").length;
  const totalBookings = services.reduce((sum, service) => sum + Number(service.bookings || 0), 0);

  return (
    <div className="min-h-screen bg-[#f6f8fb] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="mb-2 text-sm font-semibold text-[#c9a227]">Admin / Dienste verwalten</p>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">Dienstleistungen verwalten</h1>
            <p className="mt-2 text-sm text-[#65758b]">
              Statische Designansicht fuer Kategorien, Preise und Sichtbarkeit der angebotenen Services.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-[#dbe3ee]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
              <Plus className="mr-2 h-4 w-4" />
              Neue Dienstleistung
            </Button>
          </div>
        </motion.div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: "Aktive Dienste", value: activeCount, icon: CheckCircle2 },
            { label: "Buchungen", value: totalBookings, icon: ClipboardList },
            { label: "Startpreis", value: "ab 1 EUR", icon: Euro }
          ].map((stat) => (
            <Card key={stat.label} className="border-[#e3e9f2] shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-md bg-[#eef3f9] p-3 text-[#1e3a5f]">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-[#65758b]">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#1e3a5f]">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6 border-[#e3e9f2] shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ea0b7]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Dienstleistung suchen..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service, index) => {
            const meta = categoryMeta[service.category] || categoryMeta.admin;
            const Icon = meta.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="h-full border-[#e3e9f2] shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-[#1e3a5f] p-3 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-[#1e3a5f]">{service.name}</CardTitle>
                          <Badge variant="outline" className={`mt-2 ${meta.color}`}>
                            {meta.label}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="min-h-[64px] text-sm leading-6 text-[#65758b]">{service.description}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#e3e9f2] pt-4">
                      <div>
                        <p className="text-xs text-[#8ea0b7]">Preis ab</p>
                        <p className="font-bold text-[#1e3a5f]">{service.price_from} EUR / {service.price_unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8ea0b7]">Buchungen</p>
                        <p className="font-bold text-[#1e3a5f]">{service.bookings}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge className={service.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}>
                        {service.status === "active" ? "Aktiv" : "Entwurf"}
                      </Badge>
                      <Button variant="outline" size="sm" className="border-[#dbe3ee]">
                        Bearbeiten
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
